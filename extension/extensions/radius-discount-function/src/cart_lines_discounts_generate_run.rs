use crate::schema::CartLineTarget;
use crate::schema::CartLinesDiscountsGenerateRunResult;
use crate::schema::CartOperation;
use crate::schema::DiscountClass;
use crate::schema::Percentage;
use crate::schema::ProductDiscountCandidate;
use crate::schema::ProductDiscountCandidateFixedAmount;
use crate::schema::ProductDiscountCandidateTarget;
use crate::schema::ProductDiscountCandidateValue;
use crate::schema::ProductDiscountSelectionStrategy;
use crate::schema::ProductDiscountsAddOperation;

use super::schema;
use schema::cart_lines_discounts_generate_run::input::cart::lines::Merchandise;
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
    required_line_count: Option<usize>,
}

/// Bundle config from metafield (trusted - source of truth).
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct MetafieldBundleConfig {
    status: Option<String>,
    discount_type: String,
    discount_value: f64,
    #[allow(dead_code)]
    free_shipping: Option<bool>,
    min_order_value: Option<f64>,
    max_discount_amount: Option<f64>,
    discount_application: Option<String>,
    discounted_product_ids: Option<Vec<String>>,
    product_quantities: Option<HashMap<String, i32>>,
    main_product_id: Option<String>,
}

/// Checks if a Shopify product GID belongs to this bundle.
fn is_product_in_bundle(product_gid: &str, settings: &MetafieldBundleConfig) -> bool {
    if let Some(ref main_id) = settings.main_product_id {
        if main_id == product_gid {
            return true;
        }
    }
    if let Some(ref qty_map) = settings.product_quantities {
        return qty_map.contains_key(product_gid);
    }
    false
}

/// Extracts the Shopify product GID from a line's merchandise (tamper-proof).
fn get_product_gid(
    line: &schema::cart_lines_discounts_generate_run::input::cart::Lines,
) -> Option<String> {
    match line.merchandise() {
        Merchandise::ProductVariant(variant) => Some(variant.product().id().to_string()),
        _ => None,
    }
}

/// Info about a bundle cart line needed for quantity validation.
struct BundleLineInfo<'a> {
    line: &'a schema::cart_lines_discounts_generate_run::input::cart::Lines,
    product_id: Option<String>,
}

#[shopify_function]
fn cart_lines_discounts_generate_run(
    input: schema::cart_lines_discounts_generate_run::Input,
) -> Result<CartLinesDiscountsGenerateRunResult> {
    let no_discount = CartLinesDiscountsGenerateRunResult { operations: vec![] };

    if !input
        .discount()
        .discount_classes()
        .contains(&DiscountClass::Product)
    {
        return Ok(no_discount);
    }

    let cart_attr = match input.cart().attribute() {
        Some(attr) => attr,
        None => return Ok(no_discount),
    };

    let cart_attr_value = match cart_attr.value() {
        Some(v) => v,
        None => return Ok(no_discount),
    };

    let cart_configs: Vec<CartBundleConfig> = match serde_json::from_str(cart_attr_value) {
        Ok(c) => c,
        Err(_) => return Ok(no_discount),
    };

    if cart_configs.is_empty() {
        return Ok(no_discount);
    }

    let metafield = match input.discount().metafield() {
        Some(mf) => mf,
        None => return Ok(no_discount),
    };

    let metafield_value = metafield.value();

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

    let cart_total: f64 = input
        .cart()
        .lines()
        .iter()
        .map(|line| line.cost().subtotal_amount().amount().0)
        .sum();

    let mut candidates: Vec<ProductDiscountCandidate> = vec![];

    for cart_config in cart_configs {
        let bundle_settings = match active_bundles.get(&cart_config.bundle_id) {
            Some(settings) => settings,
            None => continue,
        };

        if bundle_settings.status.as_deref() != Some("ACTIVE") {
            continue;
        }

        if let Some(min_order) = bundle_settings.min_order_value {
            if min_order > 0.0 && cart_total < min_order {
                continue;
            }
        }

        // Find cart lines for this bundle using tamper-proof merchandise product ID.
        // SECURITY: Only include lines whose actual product is in the bundle.
        let bundle_lines: Vec<BundleLineInfo> = input
            .cart()
            .lines()
            .iter()
            .filter(|line| {
                line.attribute()
                    .and_then(|a| a.value())
                    .map(|v| *v == cart_config.bundle_id)
                    .unwrap_or(false)
            })
            .filter_map(|line| {
                let product_id = get_product_gid(line);
                // Verify this product actually belongs to the bundle
                match &product_id {
                    Some(pid) if is_product_in_bundle(pid, bundle_settings) => {
                        Some(BundleLineInfo { line, product_id })
                    }
                    _ => None,
                }
            })
            .collect();

        if let Some(required) = cart_config.required_line_count {
            if bundle_lines.len() < required {
                continue;
            }
        }

        if bundle_lines.is_empty() {
            continue;
        }

        // --- Quantity validation: calculate complete bundle sets ---
        let product_quantities = bundle_settings
            .product_quantities
            .as_ref();

        let complete_sets: i32 = if let Some(qty_map) = product_quantities {
            if qty_map.is_empty() {
                1
            } else {
                let mut min_sets: Option<i32> = None;

                for (expected_product_id, expected_qty) in qty_map.iter() {
                    if *expected_qty <= 0 {
                        continue;
                    }

                    // Find the cart line for this product
                    let cart_qty = bundle_lines
                        .iter()
                        .filter(|bl| {
                            bl.product_id
                                .as_ref()
                                .map(|pid| pid == expected_product_id)
                                .unwrap_or(false)
                        })
                        .map(|bl| *bl.line.quantity())
                        .sum::<i32>();

                    let sets = cart_qty / expected_qty;

                    min_sets = Some(match min_sets {
                        Some(current_min) => {
                            if sets < current_min {
                                sets
                            } else {
                                current_min
                            }
                        }
                        None => sets,
                    });
                }

                min_sets.unwrap_or(0)
            }
        } else {
            // No quantity map = legacy behavior, no quantity limiting
            1
        };

        if complete_sets < 1 {
            continue;
        }

        // Check if discount applies to specific products only
        let apply_to_specific =
            bundle_settings.discount_application.as_deref() == Some("products");
        let discounted_ids = bundle_settings
            .discounted_product_ids
            .clone()
            .unwrap_or_default();

        // Build targets with quantity limits
        // Exclude the standalone product (main_product_id) from discount targets —
        // its price is already set to the bundle price, so discounting it would double-discount.
        let main_product_id = bundle_settings.main_product_id.as_deref();
        let targets: Vec<ProductDiscountCandidateTarget> = bundle_lines
            .iter()
            .filter(|bl| {
                // Never discount the standalone product itself
                if let Some(ref pid) = bl.product_id {
                    if main_product_id == Some(pid.as_str()) {
                        return false;
                    }
                }
                if apply_to_specific && !discounted_ids.is_empty() {
                    if let Some(ref pid) = bl.product_id {
                        return discounted_ids.contains(pid);
                    }
                    return false;
                }
                true
            })
            .map(|bl| {
                // Calculate the quantity to discount for this line
                let target_qty = if let Some(qty_map) = product_quantities {
                    bl.product_id
                        .as_ref()
                        .and_then(|pid| qty_map.get(pid))
                        .map(|expected_qty| complete_sets * expected_qty)
                } else {
                    None
                };

                ProductDiscountCandidateTarget::CartLine(CartLineTarget {
                    id: bl.line.id().clone(),
                    quantity: target_qty,
                })
            })
            .collect();

        if targets.is_empty() {
            continue;
        }

        // Calculate bundle total for discountable quantities only
        // Exclude the standalone product from the total (same filter as targets)
        let bundle_total: f64 = bundle_lines
            .iter()
            .filter(|bl| {
                if let Some(ref pid) = bl.product_id {
                    if main_product_id == Some(pid.as_str()) {
                        return false;
                    }
                }
                if apply_to_specific && !discounted_ids.is_empty() {
                    if let Some(ref pid) = bl.product_id {
                        return discounted_ids.contains(pid);
                    }
                    return false;
                }
                true
            })
            .map(|bl| {
                let subtotal = bl.line.cost().subtotal_amount().amount().0;
                let line_qty = *bl.line.quantity();

                if let Some(qty_map) = product_quantities {
                    if line_qty > 0 {
                        let discountable_qty = bl
                            .product_id
                            .as_ref()
                            .and_then(|pid| qty_map.get(pid))
                            .map(|expected_qty| complete_sets * expected_qty)
                            .unwrap_or(line_qty);

                        let per_unit = subtotal / line_qty as f64;
                        per_unit * discountable_qty as f64
                    } else {
                        0.0
                    }
                } else {
                    subtotal
                }
            })
            .sum();

        // Build discount value using METAFIELD values (trusted)
        let (discount_amount, value) = match bundle_settings.discount_type.as_str() {
            "PERCENTAGE" => {
                let calculated = bundle_total * bundle_settings.discount_value / 100.0;
                (
                    calculated,
                    ProductDiscountCandidateValue::Percentage(Percentage {
                        value: Decimal(bundle_settings.discount_value),
                    }),
                )
            }
            "FIXED_AMOUNT" => {
                let amount = bundle_settings.discount_value * complete_sets as f64;
                (
                    amount,
                    ProductDiscountCandidateValue::FixedAmount(
                        ProductDiscountCandidateFixedAmount {
                            amount: Decimal(amount),
                            applies_to_each_item: None,
                        },
                    ),
                )
            }
            "CUSTOM_PRICE" => {
                let custom_total = bundle_settings.discount_value * complete_sets as f64;
                let discount_needed = bundle_total - custom_total;
                if discount_needed <= 0.0 {
                    continue;
                }
                (
                    discount_needed,
                    ProductDiscountCandidateValue::FixedAmount(
                        ProductDiscountCandidateFixedAmount {
                            amount: Decimal(discount_needed),
                            applies_to_each_item: None,
                        },
                    ),
                )
            }
            "NO_DISCOUNT" => continue,
            _ => continue,
        };

        // Apply maximum discount cap (from metafield)
        let final_value = if let Some(max_discount) = bundle_settings.max_discount_amount {
            if max_discount > 0.0 && discount_amount > max_discount {
                ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
                    amount: Decimal(max_discount),
                    applies_to_each_item: None,
                })
            } else {
                value
            }
        } else {
            value
        };

        let bundle_name = cart_config
            .bundle_name
            .unwrap_or_else(|| "Bundle".to_string());
        let message = match bundle_settings.discount_type.as_str() {
            "PERCENTAGE" => format!(
                "{}: {}% off",
                bundle_name, bundle_settings.discount_value
            ),
            "FIXED_AMOUNT" => format!("{} discount", bundle_name),
            "CUSTOM_PRICE" => format!("{}: Special price", bundle_name),
            _ => format!("{} discount", bundle_name),
        };

        candidates.push(ProductDiscountCandidate {
            targets,
            message: Some(message),
            value: final_value,
            associated_discount_code: None,
        });
    }

    if candidates.is_empty() {
        return Ok(no_discount);
    }

    Ok(CartLinesDiscountsGenerateRunResult {
        operations: vec![CartOperation::ProductDiscountsAdd(
            ProductDiscountsAddOperation {
                selection_strategy: ProductDiscountSelectionStrategy::All,
                candidates,
            },
        )],
    })
}
