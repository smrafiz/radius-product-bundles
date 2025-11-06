import { ApiType, pluckConfig, preset } from "@shopify/api-codegen-preset";
import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "https://shopify.dev/admin-graphql-direct-proxy/2025-10",
    documents: ["./lib/db/repositories/**/*.graphql"],
    generates: {
        "./lib/gql/": {
            preset: "client",
            plugins: [],
        },
        "./shared/types/admin.generated.d.ts": {
            preset,
            presetConfig: {
                apiType: ApiType.Admin,
            },
        },
    },
};

export default config;
