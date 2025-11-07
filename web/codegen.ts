import { CodegenConfig } from "@graphql-codegen/cli";
import { ApiType, preset } from "@shopify/api-codegen-preset";

const config: CodegenConfig = {
    schema: "https://shopify.dev/admin-graphql-direct-proxy/2025-10",
    documents: ["./lib/graphql/schema/**/*.graphql"],
    generates: {
        "./lib/graphql/generated/": {
            preset: "client",
            plugins: [],
        },
        "./shared/types/generated/admin.generated.d.ts": {
            preset,
            presetConfig: {
                apiType: ApiType.Admin,
            },
        },
    },
};

export default config;
