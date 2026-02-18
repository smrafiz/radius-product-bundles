/// <reference types="@shopify/app-bridge-types" />

// Register custom cacheLife profiles from next.config.js
declare module "next/cache" {
    export function cacheLife(profile: "dashboard" | "dashboard-long"): void;
}

import type {
    SAppNavAttributes,
    SAppWindowAttributes,
    UIModalAttributes,
    UINavMenuAttributes,
    UISaveBarAttributes,
    UITitleBarAttributes,
} from "@shopify/app-bridge-types";

type WithReactProps<T> = T & {
    children?: React.ReactNode;
    key?: React.Key;
    ref?: React.Ref<HTMLElement>;
};

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "s-app-window": WithReactProps<SAppWindowAttributes>;
            "s-app-nav": WithReactProps<SAppNavAttributes>;
            "ui-modal": WithReactProps<UIModalAttributes>;
            "ui-nav-menu": WithReactProps<UINavMenuAttributes>;
            "ui-save-bar": WithReactProps<UISaveBarAttributes>;
            "ui-title-bar": WithReactProps<UITitleBarAttributes>;
        }
    }
}

export {};
