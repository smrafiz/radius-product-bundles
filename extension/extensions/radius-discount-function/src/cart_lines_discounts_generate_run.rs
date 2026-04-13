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
    variant_roles: Option<HashMap<String, String>>, // variantId -> role (for same-product different-variant BOGO)
    // Volume discount fields
    #[allow(dead_code)]
    volume_tiers: Option<serde_json::Value>,
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

/// Volume discount tier configuration (from `volumeTiers` in the metafield).
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VolumeTierConfig {
    discount_type: String, // "PERCENTAGE" or "FIXED_AMOUNT"
    open_ended: bool,
    tiers: Vec<VolumeTier>,
}

/// A single volume discount tier.
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct VolumeTier {
    min_quantity: u64,
    discount: f64,
}

/// Find the highest-matching tier for `cart_qty`.
///
/// Tiers are treated as minimum thresholds: the highest tier whose `min_quantity`
/// is <= `cart_qty` wins.  Returns `None` when `cart_qty` is below all tier
/// minimums, regardless of `open_ended`.
fn find_volume_tier<'a>(tiers: &'a [VolumeTier], cart_qty: u64, _open_ended: bool) -> Option<&'a VolumeTier> {
    if tiers.is_empty() {
        return None;
    }

    // Sort order is ascending by spec, but guard against unsorted input.
    let matching = tiers.iter().filter(|t| cart_qty >= t.min_quantity);
    let best = matching.max_by_key(|t| t.min_quantity);

    if best.is_some() {
        return best;
    }

    None
}

/// Calculate VOLUME_DISCOUNT candidates for a bundle.
///
/// Each matching product in the cart gets a per-unit discount based on the
/// highest qualifying tier.  Returns `None` when no tier matches any product.
fn calculate_volume_discount(
    bundle_settings: &MetafieldBundleConfig,
    bundle_lines: &[BundleLineInfo],
    bundle_name: &str,
) -> Option<ProductDiscountCandidate> {
    let raw_tiers = bundle_settings.volume_tiers.as_ref()?;

    let tier_config: VolumeTierConfig = match serde_json::from_value(raw_tiers.clone()) {
        Ok(c) => c,
        Err(e) => {
            log!("[RadiusDiscount] Failed to parse volume_tiers: {}", e);
            return None;
        }
    };

    if tier_config.tiers.is_empty() {
        return None;
    }

    if bundle_settings.discount_value < 0.0 {
        return None;
    }

    // Aggregate cart qty per product across all bundle lines.
    let mut product_qty: HashMap<String, u64> = HashMap::new();
    for bl in bundle_lines {
        if let Some(ref pid) = bl.product_id {
            let qty = *bl.line.quantity();
            if qty <= 0 {
                continue;
            }
            *product_qty.entry(pid.clone()).or_insert(0) += qty as u64;
        }
    }

    let mut targets: Vec<ProductDiscountCandidateTarget> = Vec::new();
    let mut total_discount_amount: f64 = 0.0;

    for bl in bundle_lines {
        let pid = match bl.product_id.as_ref() {
            Some(p) => p,
            None => continue,
        };

        let cart_qty = match product_qty.get(pid) {
            Some(&q) => q,
            None => continue,
        };

        let tier = match find_volume_tier(&tier_config.tiers, cart_qty, tier_config.open_ended) {
            Some(t) => t,
            None => continue,
        };

        if tier.discount < 0.0 {
            continue;
        }

        // Cap percentage at 100% to prevent over-discount
        if tier_config.discount_type == "PERCENTAGE" && tier.discount > 100.0 {
            log!("[RadiusDiscount] Volume tier percentage exceeds 100%: {}", tier.discount);
            continue;
        }

        let raw_qty = *bl.line.quantity();
        if raw_qty <= 0 {
            continue;
        }
        let line_qty = raw_qty as u64;
        let unit_price = bl.line.cost().amount_per_quantity().amount().0;

        let line_discount = match tier_config.discount_type.as_str() {
            "PERCENTAGE" => unit_price * (tier.discount / 100.0) * line_qty as f64,
            "FIXED_AMOUNT" => tier.discount * line_qty as f64,
            _ => {
                log!("[RadiusDiscount] Unknown volume discount_type: {}", tier_config.discount_type);
                continue;
            }
        };

        total_discount_amount += line_discount;

        targets.push(ProductDiscountCandidateTarget::CartLine(CartLineTarget {
            id: bl.line.id().clone(),
            quantity: Some(line_qty as i32),
        }));
    }

    if targets.is_empty() {
        return None;
    }

    // Apply max discount cap if configured.
    let capped_discount = if let Some(max_d) = bundle_settings.max_discount_amount {
        if max_d > 0.0 && total_discount_amount > max_d {
            log!(
                "[RadiusDiscount] Volume discount capped from {:.2} to {:.2}",
                total_discount_amount,
                max_d
            );
            max_d
        } else {
            total_discount_amount
        }
    } else {
        total_discount_amount
    };

    if capped_discount <= 0.0 {
        return None;
    }

    let value = ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
        amount: Decimal(capped_discount),
        applies_to_each_item: None,
    });

    Some(ProductDiscountCandidate {
        targets,
        message: Some(bundle_name.to_string()),
        value,
        associated_discount_code: None,
    })
}

/// Shared helper: build a ProductDiscountCandidate from pre-computed targets and totals.
fn build_bxgy_candidate(
    bundle_settings: &MetafieldBundleConfig,
    targets: Vec<ProductDiscountCandidateTarget>,
    reward_total: f64,
    total_reward_qty: i32,
    bundle_name: &str,
) -> Option<ProductDiscountCandidate> {
    if targets.is_empty() {
        return None;
    }

    if bundle_settings.discount_value < 0.0 {
        return None;
    }

    // Cap percentage at 100% to prevent over-discount
    if bundle_settings.discount_type == "PERCENTAGE" && bundle_settings.discount_value > 100.0 {
        log!("[RadiusDiscount] BXGY percentage exceeds 100%: {}", bundle_settings.discount_value);
        return None;
    }

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
            let amount = bundle_settings.discount_value * total_reward_qty as f64;
            (
                amount,
                ProductDiscountCandidateValue::FixedAmount(ProductDiscountCandidateFixedAmount {
                    amount: Decimal(bundle_settings.discount_value),
                    applies_to_each_item: Some(true),
                }),
            )
        }
        "CUSTOM_PRICE" => {
            let deal_count = if total_reward_qty > 0 { total_reward_qty } else { 1 };
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

    Some(ProductDiscountCandidate {
        targets,
        message: Some(bundle_name.to_string()),
        value: final_value,
        associated_discount_code: None,
    })
}

/// Calculate BXGY discount candidates for a bundle.
/// Returns Some(candidate) if discount should apply, None to skip.
fn calculate_bxgy_discount(
    bundle_settings: &MetafieldBundleConfig,
    bundle_lines: &[BundleLineInfo],
    bundle_name: &str,
) -> Option<ProductDiscountCandidate> {
    let qty_map = bundle_settings.product_quantities.as_ref();
    let variant_roles = bundle_settings.variant_roles.as_ref();

    // BOGO quantities
    let buy_qty = bundle_settings.buy_quantity.unwrap_or(1);
    let get_qty = bundle_settings.get_quantity.unwrap_or(1);
    if buy_qty <= 0 || get_qty <= 0 {
        return None;
    }
    let items_per_deal = match buy_qty.checked_add(get_qty) {
        Some(v) if v > 0 => v,
        _ => return None,
    };

    // When variant_roles is set, use variantId for TRIGGER/REWARD classification.
    // This handles same-product BOGO with different variants (e.g., Buy Blue / Get Black).
    if let Some(vr) = variant_roles {
        let trigger_lines: Vec<&BundleLineInfo> = bundle_lines
            .iter()
            .filter(|bl| {
                bl.variant_id
                    .as_ref()
                    .and_then(|vid| vr.get(vid))
                    .map(|r| r == "TRIGGER")
                    .unwrap_or(false)
            })
            .collect();
        let reward_lines: Vec<&BundleLineInfo> = bundle_lines
            .iter()
            .filter(|bl| {
                bl.variant_id
                    .as_ref()
                    .and_then(|vid| vr.get(vid))
                    .map(|r| r == "REWARD")
                    .unwrap_or(false)
            })
            .collect();

        if reward_lines.is_empty() {
            return None;
        }

        // Each variant is a separate cart line — count total qty per role
        let total_trigger: i32 = trigger_lines.iter().map(|bl| *bl.line.quantity()).sum();
        let total_reward: i32 = reward_lines.iter().map(|bl| *bl.line.quantity()).sum();
        let deal_count = std::cmp::min(total_trigger / buy_qty, total_reward / get_qty);

        if deal_count < 1 {
            return None;
        }

        let mut targets: Vec<ProductDiscountCandidateTarget> = Vec::new();
        let mut reward_total: f64 = 0.0;
        let mut total_reward_qty: i32 = 0;

        for bl in &reward_lines {
            let qty_to_discount = std::cmp::min(
                match safe_mul(deal_count, get_qty) { Some(v) => v, None => continue },
                *bl.line.quantity(),
            );
            if qty_to_discount <= 0 { continue; }
            reward_total += bl.line.cost().amount_per_quantity().amount().0 * qty_to_discount as f64;
            total_reward_qty += qty_to_discount;
            targets.push(ProductDiscountCandidateTarget::CartLine(CartLineTarget {
                id: bl.line.id().clone(),
                quantity: Some(qty_to_discount),
            }));
        }

        if targets.is_empty() {
            return None;
        }

        return build_bxgy_candidate(
            bundle_settings,
            targets,
            reward_total,
            total_reward_qty,
            bundle_name,
        );
    }

    // Standard path: classify by productId using product_roles
    let roles = bundle_settings.product_roles.as_ref()?;

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

    // Calculate deal count
    let deal_count: i32 = if is_same_product {
        // Same product: sum all quantities across lines, divide by items_per_deal
        let total_qty: i32 = reward_lines.iter().map(|bl| *bl.line.quantity()).sum();
        total_qty / items_per_deal
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

    // For same-product: track remaining discountable qty across lines
    let mut remaining_reward_qty = match safe_mul(deal_count, get_qty) {
        Some(v) => v,
        None => return None,
    };

    for bl in &reward_lines {
        let qty_to_discount = if is_same_product {
            // Distribute deal_count * get_qty across lines, capped by each line's qty
            let qty = std::cmp::min(remaining_reward_qty, *bl.line.quantity());
            remaining_reward_qty -= qty;
            qty
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

    // Cap percentage at 100% to prevent over-discount
    if bundle_settings.discount_type == "PERCENTAGE" && bundle_settings.discount_value > 100.0 {
        log!("[RadiusDiscount] BXGY percentage exceeds 100%: {}", bundle_settings.discount_value);
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

    // Limit cart configs to prevent DoS via crafted cart attributes
    if cart_configs.len() > 50 {
        log!(
            "[RadiusDiscount] Too many bundle configs in cart attribute: {}",
            cart_configs.len()
        );
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

        // --- Route by bundle type ---
        let bundle_type = bundle_settings.bundle_type.as_deref().unwrap_or("");

        let is_bxgy = bundle_type == "BOGO" || bundle_type == "BUY_X_GET_Y";
        let is_volume = bundle_type == "VOLUME_DISCOUNT";

        // --- VOLUME_DISCOUNT: tier-based per-unit discount ---
        if is_volume {
            let vol_name = cart_config.bundle_name.as_deref().unwrap_or("Bundle");
            if let Some(candidate) =
                calculate_volume_discount(bundle_settings, &bundle_lines, vol_name)
            {
                candidates.push(candidate);
            }
            continue;
        }

        // Removed required_line_count check — it came from untrusted cart attribute.
        // Product presence is validated by complete_sets (from metafield product_quantities).

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
                0 // No products defined → no complete sets
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
                // Calculate the quantity to discount for this line.
                // Cap to the actual line quantity — when the same productId has multiple
                // variant lines (e.g. Blue + Black each qty=1), product_quantities sums
                // them to 2, but each individual line only holds 1 unit.
                let line_qty = *bl.line.quantity();
                let target_qty = if let Some(qty_map) = product_quantities {
                    bl.product_id
                        .as_ref()
                        .and_then(|pid| qty_map.get(pid))
                        .and_then(|expected_qty| safe_mul(complete_sets, *expected_qty))
                        .map(|qty| qty.min(line_qty))
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
                        // Cap to line_qty: when the same productId has multiple variant
                        // lines, product_quantities sums their quantities, but each line
                        // only holds its own units.
                        let discountable_qty = bl
                            .product_id
                            .as_ref()
                            .and_then(|pid| qty_map.get(pid))
                            .and_then(|expected_qty| safe_mul(complete_sets, *expected_qty))
                            .map(|qty| qty.min(line_qty))
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

        // Cap percentage at 100% to prevent over-discount
        if bundle_settings.discount_type == "PERCENTAGE" && bundle_settings.discount_value > 100.0 {
            log!("[RadiusDiscount] Percentage exceeds 100%: {}", bundle_settings.discount_value);
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    // ── Helpers ──────────────────────────────────────────────────────────────

    fn make_settings(product_quantities: Option<HashMap<String, i32>>) -> MetafieldBundleConfig {
        MetafieldBundleConfig {
            status: Some("ACTIVE".into()),
            discount_type: "PERCENTAGE".into(),
            discount_value: 10.0,
            free_shipping: None,
            min_order_value: None,
            max_discount_amount: None,
            discount_application: None,
            discounted_product_ids: None,
            product_quantities,
            product_variant_ids: None,
            main_product_id: None,
            bundle_type: None,
            buy_quantity: None,
            get_quantity: None,
            product_roles: None,
            variant_roles: None,
            volume_tiers: None,
        }
    }

    fn qty_map(pairs: &[(&str, i32)]) -> HashMap<String, i32> {
        pairs.iter().map(|(k, v)| (k.to_string(), *v)).collect()
    }

    fn variant_map(pairs: &[(&str, &str)]) -> HashMap<String, String> {
        pairs.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect()
    }

    // ── safe_mul ─────────────────────────────────────────────────────────────

    #[test]
    fn safe_mul_normal_values() {
        assert_eq!(safe_mul(3, 4), Some(12));
    }

    #[test]
    fn safe_mul_zero() {
        assert_eq!(safe_mul(0, 999), Some(0));
        assert_eq!(safe_mul(999, 0), Some(0));
    }

    #[test]
    fn safe_mul_exactly_max_quantity() {
        // 100 * 100 = 10_000 — at boundary, should pass
        assert_eq!(safe_mul(100, 100), Some(10_000));
    }

    #[test]
    fn safe_mul_one_above_max_quantity() {
        // 101 * 100 = 10_100 — above MAX_QUANTITY, should return None
        assert_eq!(safe_mul(101, 100), None);
    }

    #[test]
    fn safe_mul_i32_overflow() {
        assert_eq!(safe_mul(i32::MAX, 2), None);
    }

    #[test]
    fn safe_mul_large_product() {
        assert_eq!(safe_mul(10_000, 10_000), None);
    }

    #[test]
    fn safe_mul_one_factor() {
        assert_eq!(safe_mul(1, 10_000), Some(10_000));
    }

    // ── is_product_in_bundle ─────────────────────────────────────────────────

    #[test]
    fn product_in_qty_map_no_variant_restriction() {
        let settings = make_settings(Some(qty_map(&[("gid://shopify/Product/1", 2)])));
        assert!(is_product_in_bundle("gid://shopify/Product/1", None, &settings));
    }

    #[test]
    fn product_not_in_qty_map() {
        let settings = make_settings(Some(qty_map(&[("gid://shopify/Product/1", 2)])));
        assert!(!is_product_in_bundle("gid://shopify/Product/99", None, &settings));
    }

    #[test]
    fn product_matched_via_main_product_id() {
        let mut settings = make_settings(None);
        settings.main_product_id = Some("gid://shopify/Product/MAIN".into());
        assert!(is_product_in_bundle("gid://shopify/Product/MAIN", None, &settings));
    }

    #[test]
    fn main_product_id_does_not_match_other_product() {
        let mut settings = make_settings(None);
        settings.main_product_id = Some("gid://shopify/Product/MAIN".into());
        assert!(!is_product_in_bundle("gid://shopify/Product/OTHER", None, &settings));
    }

    #[test]
    fn product_in_qty_map_with_matching_variant() {
        let pid = "gid://shopify/Product/1";
        let vid = "gid://shopify/ProductVariant/42";
        let mut settings = make_settings(Some(qty_map(&[(pid, 1)])));
        settings.product_variant_ids = Some(variant_map(&[(pid, vid)]));
        assert!(is_product_in_bundle(pid, Some(vid), &settings));
    }

    #[test]
    fn product_in_qty_map_with_wrong_variant() {
        let pid = "gid://shopify/Product/1";
        let mut settings = make_settings(Some(qty_map(&[(pid, 1)])));
        settings.product_variant_ids = Some(variant_map(&[(pid, "gid://shopify/ProductVariant/42")]));
        // different variant in cart
        assert!(!is_product_in_bundle(pid, Some("gid://shopify/ProductVariant/99"), &settings));
    }

    #[test]
    fn product_in_qty_map_variant_required_but_none_provided() {
        let pid = "gid://shopify/Product/1";
        let mut settings = make_settings(Some(qty_map(&[(pid, 1)])));
        settings.product_variant_ids = Some(variant_map(&[(pid, "gid://shopify/ProductVariant/42")]));
        assert!(!is_product_in_bundle(pid, None, &settings));
    }

    #[test]
    fn product_in_qty_map_no_variant_restriction_ignores_variant_arg() {
        // variant_ids map exists but doesn't include this product → no variant restriction
        let pid = "gid://shopify/Product/1";
        let other = "gid://shopify/Product/2";
        let mut settings = make_settings(Some(qty_map(&[(pid, 1)])));
        settings.product_variant_ids = Some(variant_map(&[(other, "gid://shopify/ProductVariant/99")]));
        // pid is in qty map, not in variant_ids map → passes without variant check
        assert!(is_product_in_bundle(pid, None, &settings));
    }

    #[test]
    fn empty_qty_map_returns_false() {
        let settings = make_settings(Some(HashMap::new()));
        assert!(!is_product_in_bundle("gid://shopify/Product/1", None, &settings));
    }

    #[test]
    fn no_qty_map_no_main_id_returns_false() {
        let settings = make_settings(None);
        assert!(!is_product_in_bundle("gid://shopify/Product/1", None, &settings));
    }

    // ── find_volume_tier ─────────────────────────────────────────────────────

    fn make_tiers() -> Vec<VolumeTier> {
        vec![
            VolumeTier { min_quantity: 10, discount: 10.0 },
            VolumeTier { min_quantity: 15, discount: 15.0 },
            VolumeTier { min_quantity: 20, discount: 20.0 },
            VolumeTier { min_quantity: 21, discount: 25.0 },
        ]
    }

    #[test]
    fn volume_tier_basic_match_first_tier() {
        let tiers = make_tiers();
        let tier = find_volume_tier(&tiers, 10, false).expect("should match");
        assert_eq!(tier.discount as u32, 10);
    }

    #[test]
    fn volume_tier_higher_tier_match() {
        let tiers = make_tiers();
        let tier = find_volume_tier(&tiers, 20, false).expect("should match");
        assert_eq!(tier.discount as u32, 20);
    }

    #[test]
    fn volume_tier_max_tier_at_21() {
        let tiers = make_tiers();
        let tier = find_volume_tier(&tiers, 21, false).expect("should match");
        assert_eq!(tier.discount as u32, 25);
    }

    #[test]
    fn volume_tier_no_match_below_first_tier_not_open_ended() {
        let tiers = make_tiers();
        let result = find_volume_tier(&tiers, 5, false);
        assert!(result.is_none());
    }

    #[test]
    fn volume_tier_below_first_tier_open_ended_returns_first() {
        let tiers = make_tiers();
        // qty below all tier minimums should return None even when open_ended
        let tier = find_volume_tier(&tiers, 5, true);
        assert!(tier.is_none());
    }

    #[test]
    fn volume_tier_above_last_min_open_ended() {
        let tiers = make_tiers();
        // qty 50 is above all tiers — should still return the highest tier
        let tier = find_volume_tier(&tiers, 50, true).expect("should match");
        assert_eq!(tier.min_quantity, 21);
    }

    #[test]
    fn volume_tier_above_last_min_not_open_ended() {
        let tiers = make_tiers();
        // qty 50 > last min_quantity (21) — last tier still applies (floors, not ranges)
        let tier = find_volume_tier(&tiers, 50, false).expect("should match");
        assert_eq!(tier.min_quantity, 21);
    }

    #[test]
    fn volume_tier_empty_tiers_returns_none() {
        let result = find_volume_tier(&[], 10, true);
        assert!(result.is_none());
    }

    // ── find_volume_tier: percentage vs fixed amount (logic check) ───────────

    #[test]
    fn volume_tier_discount_percentage_value() {
        // Tier at min_qty=10 gives 10% off.  Cart qty=12 → matches first tier.
        // At unit_price=100.0: expected line discount = 100 * 0.10 * 12 = 120.0
        let tiers = vec![VolumeTier { min_quantity: 10, discount: 10.0 }];
        let tier = find_volume_tier(&tiers, 12, false).unwrap();
        let unit_price = 100.0_f64;
        let line_qty = 12_u64;
        let line_discount = unit_price * (tier.discount / 100.0) * line_qty as f64;
        assert!((line_discount - 120.0).abs() < 0.001);
    }

    #[test]
    fn volume_tier_discount_fixed_amount_value() {
        // Tier at min_qty=10 gives $5 off per unit.  Cart qty=3 → no match (< 10).
        // Cart qty=10 → tier applies: discount = 5.0 * 10 = 50.0
        let tiers = vec![VolumeTier { min_quantity: 10, discount: 5.0 }];
        let tier = find_volume_tier(&tiers, 10, false).unwrap();
        let line_qty = 10_u64;
        let line_discount = tier.discount * line_qty as f64;
        assert!((line_discount - 50.0).abs() < 0.001);
    }

    #[test]
    fn volume_tier_no_match_returns_no_discount() {
        let tiers = vec![VolumeTier { min_quantity: 10, discount: 5.0 }];
        let result = find_volume_tier(&tiers, 3, false);
        // qty=3 < min_quantity=10, open_ended=false → no tier
        assert!(result.is_none());
    }
}
