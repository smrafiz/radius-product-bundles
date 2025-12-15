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

/// Bundle configuration from cart attribute.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BundleConfig {
    bundle_id: String,
    bundle_name: Option<String>,
    discount_type: String,
    discount_value: f64,
    required_line_count: Option<usize>,
    min_order_value: Option<f64>,
    max_discount_amount: Option<f64>,
}

#[shopify_function]
fn cart_lines_discounts_generate_run(
    input: schema::cart_lines_discounts_generate_run::Input,
) -> Result<CartLinesDiscountsGenerateRunResult> {
    let no_discount = CartLinesDiscountsGenerateRunResult { operations: vec![] };

    // Check if discount applies to products
    let has_product_discount_class = input
        .discount()
        .discount_classes()
        .contains(&DiscountClass::Product);

    if !has_product_discount_class {
        return Ok(no_discount);
    }

    // Get bundle discounts attribute from cart
    let bundle_attr = match input.cart().attribute() {
        Some(attr) => attr,
        None => return Ok(no_discount),
    };

    let attr_value = match bundle_attr.value() {
        Some(v) => v,
        None => return Ok(no_discount),
    };

    // Parse array of bundle configs from JSON
    let configs: Vec<BundleConfig> = match serde_json::from_str(attr_value) {
        Ok(c) => c,
        Err(_) => return Ok(no_discount),
    };

    if configs.is_empty() {
        return Ok(no_discount);
    }

    // Calculate total cart value for minimum order check
    let cart_total: f64 = input
        .cart()
        .lines()
        .iter()
        .map(|line| line.cost().subtotal_amount().amount().0)
        .sum();

    // Collect discount candidates for all valid bundles
    let mut candidates: Vec<ProductDiscountCandidate> = vec![];

    for config in configs {
        // Check minimum order value
        if let Some(min_order) = config.min_order_value {
            if min_order > 0.0 && cart_total < min_order {
                continue; // Skip - cart total below minimum
            }
        }

        // Find all cart lines that belong to this bundle
        let bundle_lines: Vec<_> = input
            .cart()
            .lines()
            .iter()
            .filter(|line| {
                match line.attribute() {
                    Some(attr) => {
                        match attr.value() {
                            Some(line_bundle_id) => *line_bundle_id == config.bundle_id,
                            None => false,
                        }
                    }
                    None => false,
                }
            })
            .collect();

        // Validate bundle completeness
        if let Some(required_count) = config.required_line_count {
            if bundle_lines.len() < required_count {
                continue;
            }
        }

        if bundle_lines.is_empty() {
            continue;
        }

        // Calculate bundle total for discount calculations
        let bundle_total: f64 = bundle_lines
            .iter()
            .map(|line| line.cost().subtotal_amount().amount().0)
            .sum();

        // Build targets from bundle lines
        let targets: Vec<ProductDiscountCandidateTarget> = bundle_lines
            .iter()
            .map(|line| {
                ProductDiscountCandidateTarget::CartLine(CartLineTarget {
                    id: line.id().clone(),
                    quantity: None,
                })
            })
            .collect();

        // Build discount value based on type
        let (discount_amount, value) = match config.discount_type.as_str() {
            "PERCENTAGE" => {
                let calculated = bundle_total * config.discount_value / 100.0;
                (
                    calculated,
                    ProductDiscountCandidateValue::Percentage(Percentage {
                        value: Decimal(config.discount_value),
                    }),
                )
            }
            "FIXED_AMOUNT" => (
                config.discount_value,
                ProductDiscountCandidateValue::FixedAmount(
                    ProductDiscountCandidateFixedAmount {
                        amount: Decimal(config.discount_value),
                        applies_to_each_item: None,
                    },
                ),
            ),
            "CUSTOM_PRICE" => {
                let discount_needed = bundle_total - config.discount_value;

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

        // Apply maximum discount cap
        let final_value = if let Some(max_discount) = config.max_discount_amount {
            if max_discount > 0.0 && discount_amount > max_discount {
                // Cap the discount at maximum
                ProductDiscountCandidateValue::FixedAmount(
                    ProductDiscountCandidateFixedAmount {
                        amount: Decimal(max_discount),
                        applies_to_each_item: None,
                    },
                )
            } else {
                value
            }
        } else {
            value
        };

        // Build message with bundle name and discount details
        let bundle_name = config.bundle_name.unwrap_or_else(|| "Bundle".to_string());
        let message = match config.discount_type.as_str() {
            "PERCENTAGE" => format!("{} bundle: {}% off", bundle_name, config.discount_value),
            "FIXED_AMOUNT" => format!("{} bundle discount", bundle_name),
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