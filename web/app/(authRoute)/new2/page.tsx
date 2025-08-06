import { Page } from "@shopify/polaris";
import React from "react";

export default function NewPage() {
    return (
        <Page title="New">
            <div className="flex items-center justify-center gap-1 p-2 bg-slate-800 text-white rounded-lg mb-2 shadow-lg">
                <p className="font-medium text-[1rem]">
                    The app is installed on{" "}
                    <span className="font-bold">New 2</span>
                </p>
            </div>
        </Page>
    );
}
