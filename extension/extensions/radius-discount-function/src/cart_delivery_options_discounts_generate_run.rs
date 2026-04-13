use crate::schema::CartDeliveryOptionsDiscountsGenerateRunResult;
use crate::schema::DeliveryDiscountCandidate;
use crate::schema::DeliveryDiscountCandidateTarget;
use crate::schema::DeliveryDiscountCandidateValue;
use crate::schema::DeliveryDiscountSelectionStrategy;
use crate::schema::DeliveryDiscountsAddOperation;
use crate::schema::DeliveryGroupTarget;
use crate::schema::DeliveryOperation;
use crate::schema::DiscountClass;
use crate::schema::Percentage;

use super::schema;
use schema::cart_delivery_options_discounts_generate_run::input::cart::lines::Merchandise;
use serde::Deserialize;
use shopify_function::prelude::*;
use shopify_function::Result;
use std::collections::HashMap;

/// Bundle config from cart attribute (untrusted - only for identification).
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct CartBundleConfig {
    bundle_id: String,
    bundle_name: Option<String>,
}

/// Bundle config from metafield (trusted - source of truth).
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MetafieldBundleConfig {
    status: Option<String>,
    free_shipping: Option<bool>,
    free_shipping_method_title: Option<String>,
    product_quantities: Option<HashMap<String, i32>>,
    product_variant_ids: Option<HashMap<String, String>>, // productId -> variantId
    main_product_id: Option<String>,
}

/// Checks if a Shopify product GID belongs to this bundle.
/// If variant_ids are specified, also validates variant match.
fn is_product_in_bundle(
    product_gid: &str,
    variant_gid: Option<&str>,
    settings: &MetafieldBundleConfig,
) -> bool {
    if let Some(ref main_id) = settings.main_product_id {
        if main_id == product_gid {
            return true;
        }
    }

    let in_bundle = if let Some(ref qty_map) = settings.product_quantities {
        qty_map.contains_key(product_gid)
    } else {
        false
    };

    if !in_bundle {
        return false;
    }

    if let Some(ref variant_ids) = settings.product_variant_ids {
        if let Some(expected_variant) = variant_ids.get(product_gid) {
            match variant_gid {
                Some(cart_variant) => {
                    return cart_variant == expected_variant;
                }
                None => return false,
            }
        }
    }

    true
}

/// Extracts the Shopify product GID from a line's merchandise (tamper-proof).
fn get_product_gid(
    line: &schema::cart_delivery_options_discounts_generate_run::input::cart::Lines,
) -> Option<String> {
    match line.merchandise() {
        Merchandise::ProductVariant(variant) => Some(variant.product().id().to_string()),
        _ => None,
    }
}

/// Extracts the Shopify variant GID from a line's merchandise.
fn get_variant_gid(
    line: &schema::cart_delivery_options_discounts_generate_run::input::cart::Lines,
) -> Option<String> {
    match line.merchandise() {
        Merchandise::ProductVariant(variant) => Some(variant.id().to_string()),
        _ => None,
    }
}

/// Identified bundle: (bundle_id, bundle_name).
/// Collected from cart attribute and/or line item properties.
struct IdentifiedBundle {
    bundle_id: String,
    bundle_name: Option<String>,
    /// Actual product GIDs from merchandise (tamper-proof) for lines tagged with this bundle.
    product_gids: Vec<String>,
    /// Actual variant GIDs from merchandise for variant-level validation.
    variant_gids: Vec<Option<String>>,
}

/// Extract bundles from cart line item `_bundle_id` properties.
/// Deduplicates by bundle_id, keeping the first bundle_name found.
/// Also captures actual product and variant GIDs from merchandise for validation.
fn extract_bundles_from_lines(
    lines: &[schema::cart_delivery_options_discounts_generate_run::input::cart::Lines],
) -> Vec<IdentifiedBundle> {
    let mut seen: HashMap<String, (Option<String>, Vec<String>, Vec<Option<String>>)> =
        HashMap::new();

    for line in lines {
        let bundle_id = match line.attribute().and_then(|a| a.value()) {
            Some(id) if !id.is_empty() && id.len() <= 100 => id.to_string(),
            _ => continue,
        };

        let bundle_name = line
            .bundle_name()
            .and_then(|a| a.value())
            .map(|v| v.to_string());

        let product_gid = get_product_gid(line);
        let variant_gid = get_variant_gid(line);

        let entry = seen
            .entry(bundle_id)
            .or_insert_with(|| (bundle_name, Vec::new(), Vec::new()));

        if let Some(gid) = product_gid {
            entry.1.push(gid);
        }
        entry.2.push(variant_gid);
    }

    seen.into_iter()
        .map(
            |(bundle_id, (bundle_name, product_gids, variant_gids))| IdentifiedBundle {
                bundle_id,
                bundle_name,
                product_gids,
                variant_gids,
            },
        )
        .collect()
}

#[shopify_function]
fn cart_delivery_options_discounts_generate_run(
    input: schema::cart_delivery_options_discounts_generate_run::Input,
) -> Result<CartDeliveryOptionsDiscountsGenerateRunResult> {
    let no_discount = CartDeliveryOptionsDiscountsGenerateRunResult { operations: vec![] };

    // Check if discount applies to shipping
    if !input
        .discount()
        .discount_classes()
        .contains(&DiscountClass::Shipping)
    {
        return Ok(no_discount);
    }

    // Collect bundles from cart attribute (if available)
    let mut bundles_by_id: HashMap<String, (Option<String>, Vec<String>, Vec<Option<String>>)> =
        HashMap::new();

    if let Some(attr) = input.cart().attribute() {
        if let Some(attr_value) = attr.value() {
            if let Ok(cart_configs) = serde_json::from_str::<Vec<CartBundleConfig>>(attr_value) {
                // Limit cart configs to prevent DoS
                if cart_configs.len() > 50 {
                    log!("[RadiusDiscount] Too many delivery bundle configs: {}", cart_configs.len());
                    return Ok(no_discount);
                }
                for config in cart_configs {
                    // Validate bundle ID length
                    if config.bundle_id.is_empty() || config.bundle_id.len() > 100 {
                        continue;
                    }
                    bundles_by_id
                        .entry(config.bundle_id)
                        .or_insert_with(|| (config.bundle_name, Vec::new(), Vec::new()));
                }
            }
        }
    }

    // Also collect bundles from line item properties (handles standalone products,
    // Buy Now, XMLHttpRequest themes, and form submissions)
    let line_bundles = extract_bundles_from_lines(input.cart().lines());
    for lb in line_bundles {
        let entry = bundles_by_id
            .entry(lb.bundle_id)
            .or_insert_with(|| (lb.bundle_name, Vec::new(), Vec::new()));
        // Merge product GIDs from line items
        entry.1.extend(lb.product_gids);
        entry.2.extend(lb.variant_gids);
    }

    // Need at least one identified bundle
    if bundles_by_id.is_empty() {
        return Ok(no_discount);
    }

    // Get metafield (trusted - source of truth)
    let metafield = match input.discount().metafield() {
        Some(mf) => mf,
        None => return Ok(no_discount),
    };

    // metafield.value() returns &String directly
    let metafield_value = metafield.value();

    // Check if metafield value is empty
    if metafield_value.is_empty() {
        return Ok(no_discount);
    }

    let active_bundles: HashMap<String, MetafieldBundleConfig> =
        match serde_json::from_str(metafield_value) {
            Ok(v) => v,
            Err(e) => {
                log!("[RadiusDiscount] Failed to parse delivery metafield: {}", e);
                return Ok(no_discount);
            }
        };

    if active_bundles.is_empty() {
        return Ok(no_discount);
    }

    // Find first bundle with free shipping enabled (validated against metafield)
    // SECURITY: Also verify that at least one line's actual product belongs to the bundle
    let free_shipping_bundle =
        bundles_by_id
            .iter()
            .find(|(bundle_id, (_, product_gids, variant_gids))| {
                active_bundles
                    .get(*bundle_id)
                    .map(|settings| {
                        settings.status.as_deref() == Some("ACTIVE")
                            && settings.free_shipping.unwrap_or(false)
                            && product_gids
                                .iter()
                                .zip(variant_gids.iter())
                                .any(|(gid, vid)| {
                                    is_product_in_bundle(gid, vid.as_deref(), settings)
                                })
                    })
                    .unwrap_or(false)
            });

    let (matched_bundle_id, (matched_bundle_name, _, _)) = match free_shipping_bundle {
        Some((id, data)) => (id, data),
        None => return Ok(no_discount),
    };

    // Target ALL delivery groups, not just the first
    let delivery_groups = input.cart().delivery_groups();
    if delivery_groups.is_empty() {
        return Ok(no_discount);
    }

    let bundle_name = matched_bundle_name
        .clone()
        .unwrap_or_else(|| "Bundle".to_string());

    let message_template = active_bundles
        .get(matched_bundle_id)
        .and_then(|s| s.free_shipping_method_title.clone())
        .unwrap_or_else(|| "Free shipping with {name}".to_string());

    let message = message_template.replace("{name}", &bundle_name);

    let targets: Vec<DeliveryDiscountCandidateTarget> = delivery_groups
        .iter()
        .map(|group| {
            DeliveryDiscountCandidateTarget::DeliveryGroup(DeliveryGroupTarget {
                id: group.id().clone(),
            })
        })
        .collect();

    Ok(CartDeliveryOptionsDiscountsGenerateRunResult {
        operations: vec![DeliveryOperation::DeliveryDiscountsAdd(
            DeliveryDiscountsAddOperation {
                selection_strategy: DeliveryDiscountSelectionStrategy::All,
                candidates: vec![DeliveryDiscountCandidate {
                    targets,
                    value: DeliveryDiscountCandidateValue::Percentage(Percentage {
                        value: Decimal(100.0),
                    }),
                    message: Some(message),
                    associated_discount_code: None,
                }],
            },
        )],
    })
}
