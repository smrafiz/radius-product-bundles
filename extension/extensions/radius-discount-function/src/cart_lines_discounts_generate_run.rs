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
}

#[shopify_function]
fn cart_lines_discounts_generate_run(
    input: schema::cart_lines_discounts_generate_run::Input,
) -> Result<CartLinesDiscountsGenerateRunResult> {
    let no_discount = CartLinesDiscountsGenerateRunResult { operations: vec![] };

    // Check if discount applies to products
    if !input
        .discount()
        .discount_classes()
        .contains(&DiscountClass::Product)
    {
        return Ok(no_discount);
    }

    // Get cart attribute (untrusted - only for bundle IDs)
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

    // Get metafield (trusted - source of truth for discount values)
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

    // Calculate total cart value for minimum order check
    let cart_total: f64 = input
        .cart()
        .lines()
        .iter()
        .map(|line| line.cost().subtotal_amount().amount().0)
        .sum();

    let mut candidates: Vec<ProductDiscountCandidate> = vec![];

    for cart_config in cart_configs {
        // Look up bundle in metafield (source of truth)
        let bundle_settings = match active_bundles.get(&cart_config.bundle_id) {
            Some(settings) => settings,
            None => continue, // Bundle not found = deleted or inactive
        };

        // Check if bundle is active
        if bundle_settings.status.as_deref() != Some("ACTIVE") {
            continue;
        }

        // Check minimum order value (from metafield)
        if let Some(min_order) = bundle_settings.min_order_value {
            if min_order > 0.0 && cart_total < min_order {
                continue;
            }
        }

        // Find cart lines for this bundle
        let bundle_lines: Vec<_> = input
            .cart()
            .lines()
            .iter()
            .filter(|line| {
                line.attribute()
                    .and_then(|a| a.value())
                    .map(|v| *v == cart_config.bundle_id)
                    .unwrap_or(false)
            })
            .collect();

        // Validate completeness (from cart config - customer added these)
        if let Some(required) = cart_config.required_line_count {
            if bundle_lines.len() < required {
                continue;
            }
        }

        if bundle_lines.is_empty() {
            continue;
        }

        // Check if discount applies to specific products only (from metafield)
        let apply_to_specific =
            bundle_settings.discount_application.as_deref() == Some("products");
        let discounted_ids = bundle_settings
            .discounted_product_ids
            .clone()
            .unwrap_or_default();

        // Build targets
        let targets: Vec<ProductDiscountCandidateTarget> = bundle_lines
            .iter()
            .filter(|line| {
                if apply_to_specific && !discounted_ids.is_empty() {
                    if let Some(product_attr) = line.product_id() {
                        if let Some(product_id) = product_attr.value() {
                            return discounted_ids.contains(&product_id.to_string());
                        }
                    }
                    return false;
                }
                true
            })
            .map(|line| {
                ProductDiscountCandidateTarget::CartLine(CartLineTarget {
                    id: line.id().clone(),
                    quantity: None,
                })
            })
            .collect();

        if targets.is_empty() {
            continue;
        }

        // Calculate bundle total
        let bundle_total: f64 = bundle_lines
            .iter()
            .filter(|line| {
                if apply_to_specific && !discounted_ids.is_empty() {
                    if let Some(product_attr) = line.product_id() {
                        if let Some(product_id) = product_attr.value() {
                            return discounted_ids.contains(&product_id.to_string());
                        }
                    }
                    return false;
                }
                true
            })
            .map(|line| line.cost().subtotal_amount().amount().0)
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
            "FIXED_AMOUNT" => (
                bundle_settings.discount_value,
                ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
                    amount: Decimal(bundle_settings.discount_value),
                    applies_to_each_item: None,
                }),
            ),
            "CUSTOM_PRICE" => {
                let discount_needed = bundle_total - bundle_settings.discount_value;
                if discount_needed <= 0.0 {
                    continue;
                }
                (
                    discount_needed,
                    ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
                        amount: Decimal(discount_needed),
                        applies_to_each_item: None,
                    }),
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

        // Build message
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