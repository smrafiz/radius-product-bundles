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
    let free_shipping_bundle = cart_configs.iter().find(|cart_config| {
        active_bundles
            .get(&cart_config.bundle_id)
            .map(|settings| {
                settings.status.as_deref() == Some("ACTIVE")
                    && settings.free_shipping.unwrap_or(false)
            })
            .unwrap_or(false)
    });

    let bundle_with_free_shipping = match free_shipping_bundle {
        Some(b) => b,
        None => return Ok(no_discount),
    };

    // Get first delivery group
    let first_delivery_group = match input.cart().delivery_groups().first() {
        Some(group) => group,
        None => return Ok(no_discount),
    };

    let bundle_name = bundle_with_free_shipping
        .bundle_name
        .clone()
        .unwrap_or_else(|| "Bundle".to_string());

    let message_template = active_bundles
        .get(&bundle_with_free_shipping.bundle_id)
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