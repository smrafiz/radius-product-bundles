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

/// Bundle configuration from cart attribute.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct BundleConfig {
    bundle_id: String,
    bundle_name: Option<String>,
    free_shipping: Option<bool>,
}

#[shopify_function]
fn cart_delivery_options_discounts_generate_run(
    input: schema::cart_delivery_options_discounts_generate_run::Input,
) -> Result<CartDeliveryOptionsDiscountsGenerateRunResult> {
    let no_discount = CartDeliveryOptionsDiscountsGenerateRunResult { operations: vec![] };

    // Check if discount applies to shipping
    let has_shipping_discount_class = input
        .discount()
        .discount_classes()
        .contains(&DiscountClass::Shipping);

    if !has_shipping_discount_class {
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

    // Check if any bundle has free shipping enabled
    let has_free_shipping = configs
        .iter()
        .any(|config| config.free_shipping.unwrap_or(false));

    if !has_free_shipping {
        return Ok(no_discount);
    }

    // Get first delivery group
    let first_delivery_group = match input.cart().delivery_groups().first() {
        Some(group) => group,
        None => return Ok(no_discount),
    };

    // Find bundle name for message
    let bundle_name = configs
        .iter()
        .find(|c| c.free_shipping.unwrap_or(false))
        .and_then(|c| c.bundle_name.clone())
        .unwrap_or_else(|| "Bundle".to_string());

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
                    message: Some(format!("Free shipping with {}", bundle_name)),
                    associated_discount_code: None,
                }],
            },
        )],
    })
}