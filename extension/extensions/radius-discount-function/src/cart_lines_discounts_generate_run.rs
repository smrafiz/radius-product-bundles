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
    discount_type: String,
    discount_value: f64,
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

    // Get bundle attribute
    let bundle_attr = match input.cart().attribute() {
        Some(attr) => attr,
        None => return Ok(no_discount),
    };

    let attr_value = match bundle_attr.value() {
        Some(v) => v,
        None => return Ok(no_discount),
    };

    // Parse bundle config from JSON
    let config: BundleConfig = match serde_json::from_str(attr_value) {
        Ok(c) => c,
        Err(_) => return Ok(no_discount),
    };

    // Build targets from all cart lines
    let targets: Vec<ProductDiscountCandidateTarget> = input
        .cart()
        .lines()
        .iter()
        .map(|line| {
            ProductDiscountCandidateTarget::CartLine(CartLineTarget {
                id: line.id().clone(),
                quantity: None,
            })
        })
        .collect();

    if targets.is_empty() {
        return Ok(no_discount);
    }

    // Build discount value based on type
    let value = match config.discount_type.as_str() {
        "PERCENTAGE" => ProductDiscountCandidateValue::Percentage(Percentage {
            value: Decimal(config.discount_value),
        }),
        "FIXED_AMOUNT" => ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
            amount: Decimal(config.discount_value),
            applies_to_each_item: None,
        }),
        _ => return Ok(no_discount),
    };

    // Build message
    let message = match config.discount_type.as_str() {
        "PERCENTAGE" => format!("Bundle: {}% off", config.discount_value),
        "FIXED_AMOUNT" => format!("Bundle: ${} off", config.discount_value),
        _ => "Bundle discount".to_string(),
    };

    Ok(CartLinesDiscountsGenerateRunResult {
        operations: vec![CartOperation::ProductDiscountsAdd(
            ProductDiscountsAddOperation {
                selection_strategy: ProductDiscountSelectionStrategy::First,
                candidates: vec![ProductDiscountCandidate {
                    targets,
                    message: Some(message),
                    value,
                    associated_discount_code: None,
                }],
            },
        )],
    })
}