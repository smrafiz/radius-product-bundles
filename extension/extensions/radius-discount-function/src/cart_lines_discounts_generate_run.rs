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

const MAX_QUANTITY: i32 = 10_000;

fn safe_mul(a: i32, b: i32) -> Option<i32> {
    a.checked_mul(b).filter(|&v| v <= MAX_QUANTITY)
}

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
    product_variant_ids: Option<HashMap<String, String>>, // productId -> variantId
    main_product_id: Option<String>,
    // BOGO/BXGY fields
    bundle_type: Option<String>,
    buy_quantity: Option<i32>,
    get_quantity: Option<i32>,
    product_roles: Option<HashMap<String, String>>,
}

/// Checks if a Shopify product GID belongs to this bundle.
/// If variant_ids are specified in the bundle config, also validates variant match.
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
    line: &schema::cart_lines_discounts_generate_run::input::cart::Lines,
) -> Option<String> {
    match line.merchandise() {
        Merchandise::ProductVariant(variant) => Some(variant.product().id().to_string()),
        _ => None,
    }
}

/// Extracts the Shopify variant GID from a line's merchandise.
fn get_variant_gid(
    line: &schema::cart_lines_discounts_generate_run::input::cart::Lines,
) -> Option<String> {
    match line.merchandise() {
        Merchandise::ProductVariant(variant) => Some(variant.id().to_string()),
        _ => None,
    }
}

/// Info about a bundle cart line needed for quantity validation.
#[allow(dead_code)]
struct BundleLineInfo<'a> {
    line: &'a schema::cart_lines_discounts_generate_run::input::cart::Lines,
    product_id: Option<String>,
    variant_id: Option<String>,
}

/// Calculate BXGY discount candidates for a bundle.
/// Returns Some(candidate) if discount should apply, None to skip.
fn calculate_bxgy_discount(
    bundle_settings: &MetafieldBundleConfig,
    bundle_lines: &[BundleLineInfo],
    bundle_name: &str,
) -> Option<ProductDiscountCandidate> {
    let roles = bundle_settings.product_roles.as_ref()?;
    let qty_map = bundle_settings.product_quantities.as_ref();

    // Separate trigger and reward lines
    let trigger_lines: Vec<&BundleLineInfo> = bundle_lines
        .iter()
        .filter(|bl| {
            bl.product_id
                .as_ref()
                .and_then(|pid| roles.get(pid))
                .map(|r| r == "TRIGGER")
                .unwrap_or(false)
        })
        .collect();

    let reward_lines: Vec<&BundleLineInfo> = bundle_lines
        .iter()
        .filter(|bl| {
            bl.product_id
                .as_ref()
                .and_then(|pid| roles.get(pid))
                .map(|r| r == "REWARD")
                .unwrap_or(false)
        })
        .collect();

    if reward_lines.is_empty() {
        return None;
    }

    // Same-product detection (unified):
    // Case 1: No triggers found — HashMap overwrote TRIGGER role with REWARD (same product ID)
    // Case 2: Trigger and reward product ID sets are identical
    let is_same_product = if trigger_lines.is_empty() {
        true
    } else {
        let trigger_product_ids: std::collections::HashSet<&str> = trigger_lines
            .iter()
            .filter_map(|bl| bl.product_id.as_deref())
            .collect();
        let reward_product_ids: std::collections::HashSet<&str> = reward_lines
            .iter()
            .filter_map(|bl| bl.product_id.as_deref())
            .collect();
        trigger_product_ids == reward_product_ids
    };

    // BOGO quantities (used for same-product per-line deal calculation)
    let buy_qty = bundle_settings.buy_quantity.unwrap_or(1);
    let get_qty = bundle_settings.get_quantity.unwrap_or(1);
    let items_per_deal = buy_qty + get_qty;

    if items_per_deal <= 0 || buy_qty <= 0 || get_qty <= 0 {
        return None;
    }

    // Calculate deal count
    let deal_count: i32 = if is_same_product {
        // Same product (BOGO): guard check — at least one product must have enough qty
        reward_lines
            .iter()
            .map(|bl| *bl.line.quantity() / items_per_deal)
            .max()
            .unwrap_or(0)
    } else {
        // Different products: use per-product expected quantities from product_quantities.
        // deal_count = min across all products of (cart_qty / expected_qty).
        // This correctly handles "Buy 2 Get 1" by checking each product independently.
        if let Some(qm) = qty_map {
            let trigger_min = trigger_lines
                .iter()
                .filter_map(|bl| {
                    let pid = bl.product_id.as_ref()?;
                    let expected = match qm.get(pid) {
                        Some(&qty) if qty > 0 => qty,
                        Some(&qty) => {
                            log!(
                                "[RadiusDiscount] Invalid quantity {} for product {}",
                                qty,
                                pid
                            );
                            return None;
                        }
                        None => {
                            log!("[RadiusDiscount] Missing quantity for product {}", pid);
                            return None;
                        }
                    };
                    Some(*bl.line.quantity() / expected)
                })
                .min()
                .unwrap_or(0);

            let reward_min = reward_lines
                .iter()
                .filter_map(|bl| {
                    let pid = bl.product_id.as_ref()?;
                    let expected = match qm.get(pid) {
                        Some(&qty) if qty > 0 => qty,
                        Some(&qty) => {
                            log!(
                                "[RadiusDiscount] Invalid quantity {} for product {}",
                                qty,
                                pid
                            );
                            return None;
                        }
                        None => {
                            log!("[RadiusDiscount] Missing quantity for product {}", pid);
                            return None;
                        }
                    };
                    Some(*bl.line.quantity() / expected)
                })
                .min()
                .unwrap_or(0);

            std::cmp::min(trigger_min, reward_min)
        } else {
            // Fallback: use buy_quantity/get_quantity
            let total_trigger: i32 = trigger_lines.iter().map(|bl| *bl.line.quantity()).sum();
            let total_reward: i32 = reward_lines.iter().map(|bl| *bl.line.quantity()).sum();
            std::cmp::min(total_trigger / buy_qty, total_reward / get_qty)
        }
    };

    if deal_count < 1 {
        return None;
    }

    // Build targets and calculate reward total using per-product expected quantities
    let mut targets: Vec<ProductDiscountCandidateTarget> = Vec::new();
    let mut reward_total: f64 = 0.0;

    for bl in &reward_lines {
        let qty_to_discount = if is_same_product {
            let per_product_deals = *bl.line.quantity() / items_per_deal;
            match safe_mul(per_product_deals, get_qty) {
                Some(v) => v,
                None => continue,
            }
        } else {
            let expected = match bl
                .product_id
                .as_ref()
                .and_then(|pid| qty_map.and_then(|qm| qm.get(pid)))
            {
                Some(&qty) if qty > 0 => qty,
                _ => continue,
            };
            match safe_mul(deal_count, expected) {
                Some(v) => std::cmp::min(v, *bl.line.quantity()),
                None => continue,
            }
        };

        if qty_to_discount <= 0 {
            continue;
        }

        // BXGY uses unit price (discounts specific qty); non-BXGY uses subtotal (discounts whole line)
        let unit_price = bl.line.cost().amount_per_quantity().amount().0;
        reward_total += unit_price * qty_to_discount as f64;

        targets.push(ProductDiscountCandidateTarget::CartLine(CartLineTarget {
            id: bl.line.id().clone(),
            quantity: Some(qty_to_discount),
        }));
    }

    if targets.is_empty() {
        return None;
    }

    // Total reward items being discounted (sum of per-product qty_to_discount)
    let total_reward_qty_to_discount: i32 = reward_lines
        .iter()
        .filter_map(|bl| {
            if is_same_product {
                let per_product_deals = *bl.line.quantity() / items_per_deal;
                safe_mul(per_product_deals, get_qty)
            } else {
                let expected = match bl
                    .product_id
                    .as_ref()
                    .and_then(|pid| qty_map.and_then(|qm| qm.get(pid)))
                {
                    Some(&qty) if qty > 0 => qty,
                    _ => return None,
                };
                safe_mul(deal_count, expected).map(|v| std::cmp::min(v, *bl.line.quantity()))
            }
        })
        .sum();

    // Reject negative discount values (prevents price increases via compromised data)
    if bundle_settings.discount_value < 0.0 {
        return None;
    }

    // Build discount value
    let (discount_amount, value) = match bundle_settings.discount_type.as_str() {
        "PERCENTAGE" => {
            let calculated = reward_total * bundle_settings.discount_value / 100.0;
            (
                calculated,
                ProductDiscountCandidateValue::Percentage(Percentage {
                    value: Decimal(bundle_settings.discount_value),
                }),
            )
        }
        "FIXED_AMOUNT" => {
            let amount = bundle_settings.discount_value * total_reward_qty_to_discount as f64;
            (
                amount,
                ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
                    amount: Decimal(bundle_settings.discount_value),
                    applies_to_each_item: Some(true),
                }),
            )
        }
        "CUSTOM_PRICE" => {
            let custom_price_per_deal = bundle_settings.discount_value;
            let total_custom_price = custom_price_per_deal * deal_count as f64;
            let total_discount = (reward_total - total_custom_price).max(0.0);

            if total_discount <= 0.0 {
                return None;
            }

            (
                total_discount,
                ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
                    amount: Decimal(total_discount),
                    applies_to_each_item: None,
                }),
            )
        }
        "NO_DISCOUNT" => return None,
        _ => return None,
    };

    // Apply max discount cap — converts any discount type to FixedAmount when capped,
    // because Shopify's discount API has no way to cap a percentage directly.
    let final_value = if let Some(max_discount) = bundle_settings.max_discount_amount {
        if max_discount > 0.0 && discount_amount > max_discount {
            log!(
                "[RadiusDiscount] Capping discount from {:.2} to {:.2} (max_discount_amount)",
                discount_amount,
                max_discount
            );
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

    let message = bundle_name.to_string();

    Some(ProductDiscountCandidate {
        targets,
        message: Some(message),
        value: final_value,
        associated_discount_code: None,
    })
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
        Err(e) => {
            log!("[RadiusDiscount] Failed to parse cart attribute: {}", e);
            return Ok(no_discount);
        }
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
            Err(e) => {
                log!("[RadiusDiscount] Failed to parse metafield: {}", e);
                return Ok(no_discount);
            }
        };

    if active_bundles.is_empty() {
        return Ok(no_discount);
    }

    let cart_subtotal: f64 = input
        .cart()
        .lines()
        .iter()
        .map(|line| line.cost().subtotal_amount().amount().0)
        .sum();

    let mut candidates: Vec<ProductDiscountCandidate> = vec![];

    for cart_config in cart_configs {
        if cart_config.bundle_id.is_empty() || cart_config.bundle_id.len() > 100 {
            log!(
                "[RadiusDiscount] Invalid bundle ID length: {}",
                cart_config.bundle_id.len()
            );
            continue;
        }

        let bundle_settings = match active_bundles.get(&cart_config.bundle_id) {
            Some(settings) => settings,
            None => continue,
        };

        if bundle_settings.status.as_deref() != Some("ACTIVE") {
            continue;
        }

        if let Some(min_order) = bundle_settings.min_order_value {
            if min_order > 0.0 && cart_subtotal < min_order {
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
                let variant_id = get_variant_gid(line);
                match &product_id {
                    Some(pid)
                        if is_product_in_bundle(pid, variant_id.as_deref(), bundle_settings) =>
                    {
                        Some(BundleLineInfo {
                            line,
                            product_id,
                            variant_id,
                        })
                    }
                    _ => None,
                }
            })
            .collect();

        if bundle_lines.is_empty() {
            continue;
        }

        // --- BOGO/BXGY: route to dedicated discount logic ---
        let is_bxgy = bundle_settings
            .bundle_type
            .as_deref()
            .map(|t| t == "BOGO" || t == "BUY_X_GET_Y")
            .unwrap_or(false);

        // For non-BXGY bundles, validate required line count.
        // Skip for BXGY because same-product BOGO merges into one cart line;
        // calculate_bxgy_discount validates quantities instead.
        if !is_bxgy {
            if let Some(required) = cart_config.required_line_count {
                if bundle_lines.len() < required {
                    continue;
                }
            }
        }

        if is_bxgy {
            let bxgy_bundle_name = cart_config.bundle_name.as_deref().unwrap_or("Bundle");
            if let Some(candidate) =
                calculate_bxgy_discount(bundle_settings, &bundle_lines, bxgy_bundle_name)
            {
                candidates.push(candidate);
            }
            continue;
        }

        // --- Quantity validation: calculate complete bundle sets ---
        let product_quantities = bundle_settings.product_quantities.as_ref();

        let complete_sets: i32 = if let Some(qty_map) = product_quantities {
            if qty_map.is_empty() {
                1
            } else {
                let mut min_sets: Option<i32> = None;

                for (expected_product_id, expected_qty) in qty_map.iter() {
                    if *expected_qty <= 0 {
                        log!(
                            "[RadiusDiscount] Invalid quantity {} for product {}",
                            expected_qty,
                            expected_product_id
                        );
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
        let apply_to_specific = bundle_settings.discount_application.as_deref() == Some("products");
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
                        .and_then(|expected_qty| safe_mul(complete_sets, *expected_qty))
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
                            .and_then(|expected_qty| safe_mul(complete_sets, *expected_qty))
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

        if bundle_settings.discount_value < 0.0 {
            continue;
        }

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
            "PERCENTAGE" => format!("{}: {}% off", bundle_name, bundle_settings.discount_value),
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
