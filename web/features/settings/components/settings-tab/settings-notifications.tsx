"use client";

export function SettingsNotifications() {
    return (
        <s-section>
            <s-stack gap="base">
                <s-heading>
                    <div style={{ fontSize: "18px" }}>Notifications</div>
                </s-heading>
                <s-divider />
                <s-select
                    label="Notification frequency"
                    name="notification-frequency"
                >
                    <s-option value="immediately" selected>
                        Immediately
                    </s-option>
                    <s-option value="hourly">Hourly digest</s-option>
                    <s-option value="daily">Daily digest</s-option>
                </s-select>
                <s-choice-list
                    label="Notification types"
                    name="notifications-type"
                    multiple
                >
                    <s-choice value="new-order" selected>
                        New order notifications
                    </s-choice>
                    <s-choice value="low-stock">Low stock alerts</s-choice>
                    <s-choice value="customer-review">
                        Customer review notifications
                    </s-choice>
                    <s-choice value="shipping-updates">
                        Shipping updates
                    </s-choice>
                </s-choice-list>
            </s-stack>
        </s-section>
    );
}
