import { ApiType, pluckConfig, preset } from "@shopify/api-codegen-preset";
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "https://shopify.dev/admin-graphql-direct-proxy/2024-10",
    documents: ["./lib/queries/**/*.graphql"],
    generates: {
        "./lib/gql/": {
            preset: "client",
            plugins: [],
        },
        "./types/admin.generated.d.ts": {
            preset,
            presetConfig: {
                apiType: ApiType.Admin,
            },
        },
    },
};

export default config;
