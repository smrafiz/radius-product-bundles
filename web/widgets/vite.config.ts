import { defineConfig } from "vite";
import path from "path";
import fs from "fs";

// Paths
const widgetSrcDir = path.resolve(__dirname, "src");
const assetOutputDir = path.resolve(
    __dirname,
    "../../extension/extensions/product-bundle-widget/assets",
);

const inputFiles = fs
    .readdirSync(widgetSrcDir)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".scss"))
    .reduce(
        (obj, file) => {
            const name = path.basename(file, path.extname(file));
            obj[name] = path.resolve(widgetSrcDir, file);
            return obj;
        },
        {} as Record<string, string>,
    );

export default defineConfig({
    root: widgetSrcDir,
    build: {
        outDir: assetOutputDir,
        emptyOutDir: true,
        assetsDir: ".",
        rollupOptions: {
            input: inputFiles,
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "[name]-[hash].js",
                assetFileNames: "[name].[ext]",
            },
            external: ["fsevents"],
        },
        cssCodeSplit: true,
    },
    css: {
        postcss: path.resolve(__dirname, "./postcss.config.mjs"),
    },
    resolve: {
        alias: {
            "@": widgetSrcDir,
        },
    },
});
