import { createDefaultPreset } from "ts-jest";
import { pathsToModuleNameMapper } from "ts-jest";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { compilerOptions } = require("./tsconfig.json");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} */
export default {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
        prefix: "<rootDir>/",
    }),
    moduleFileExtensions: ["ts", "tsx", "js", "json"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
    testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
};