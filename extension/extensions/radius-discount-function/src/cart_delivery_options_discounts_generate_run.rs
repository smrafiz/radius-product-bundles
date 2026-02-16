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
}

/// Identified bundle: (bundle_id, bundle_name).
/// Collected from cart attribute and/or line item properties.
struct IdentifiedBundle {
    bundle_id: String,
    bundle_name: Option<String>,
}

/// Extract bundles from cart line item `_bundle_id` properties.
/// Deduplicates by bundle_id, keeping the first bundle_name found.
fn extract_bundles_from_lines(
    lines: &[schema::cart_delivery_options_discounts_generate_run::input::cart::Lines],
) -> Vec<IdentifiedBundle> {
    let mut seen: HashMap<String, Option<String>> = HashMap::new();

    for line in lines {
        let bundle_id = match line.attribute().and_then(|a| a.value()) {
            Some(id) if !id.is_empty() => id.to_string(),
            _ => continue,
        };

        let bundle_name = line
            .bundle_name()
            .and_then(|a| a.value())
            .map(|v| v.to_string());

        seen.entry(bundle_id).or_insert(bundle_name);
    }

    seen.into_iter()
        .map(|(bundle_id, bundle_name)| IdentifiedBundle {
            bundle_id,
            bundle_name,
        })
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
    let mut bundles_by_id: HashMap<String, Option<String>> = HashMap::new();

    if let Some(attr) = input.cart().attribute() {
        if let Some(attr_value) = attr.value() {
            if let Ok(cart_configs) =
                serde_json::from_str::<Vec<CartBundleConfig>>(attr_value)
            {
                for config in cart_configs {
                    bundles_by_id
                        .entry(config.bundle_id)
                        .or_insert(config.bundle_name);
                }
            }
        }
    }

    // Also collect bundles from line item properties (handles standalone products,
    // Buy Now, XMLHttpRequest themes, and form submissions)
    let line_bundles = extract_bundles_from_lines(input.cart().lines());
    for lb in line_bundles {
        bundles_by_id.entry(lb.bundle_id).or_insert(lb.bundle_name);
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
            Err(_) => return Ok(no_discount),
        };

    if active_bundles.is_empty() {
        return Ok(no_discount);
    }

    // Find first bundle with free shipping enabled (validated against metafield)
    let free_shipping_bundle = bundles_by_id.iter().find(|(bundle_id, _)| {
        active_bundles
            .get(*bundle_id)
            .map(|settings| {
                settings.status.as_deref() == Some("ACTIVE")
                    && settings.free_shipping.unwrap_or(false)
            })
            .unwrap_or(false)
    });

    let (matched_bundle_id, matched_bundle_name) = match free_shipping_bundle {
        Some((id, name)) => (id, name),
        None => return Ok(no_discount),
    };

    // Get first delivery group
    let first_delivery_group = match input.cart().delivery_groups().first() {
        Some(group) => group,
        None => return Ok(no_discount),
    };

    let bundle_name = matched_bundle_name
        .clone()
        .unwrap_or_else(|| "Bundle".to_string());

    let message_template = active_bundles
        .get(matched_bundle_id)
        .and_then(|s| s.free_shipping_method_title.clone())
        .unwrap_or_else(|| "Free shipping with {name}".to_string());

    let message = message_template.replace("{name}", &bundle_name);

    Ok(CartDeliveryOptionsDiscountsGenerateRunResult {
        operations: vec![DeliveryOperation::DeliveryDiscountsAdd(
            DeliveryDiscountsAddOperation {
                selection_strategy: DeliveryDiscountSelectionStrategy::All,
                candidates: vec![DeliveryDiscountCandidate {
                    targets: vec![DeliveryDiscountCandidateTarget::DeliveryGroup(
                        DeliveryGroupTarget {
                            id: first_delivery_group.id().clone(),
                        },
                    )],
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
