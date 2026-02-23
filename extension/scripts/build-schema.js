#!/usr/bin/env node

/**
 * Schema Builder for Product Bundle App Widgets
 *
 * Automatically reads all JSON files from schema folders and builds
 * schemas for corresponding extension blocks.
 */

const fs = require("fs");
const path = require("path");

// Paths
const ROOT_DIR = path.join(__dirname, "..");
const SCHEMA_DIR = path.join(ROOT_DIR, "schema");
const EXTENSIONS_DIR = path.join(ROOT_DIR, "extensions");

console.log("🔨 Building schemas...\n");

/**
 * Build schema for a single extension
 */
function buildSchemaForExtension(extensionName) {
    const configDir = path.join(SCHEMA_DIR, extensionName);
    const extensionDir = path.join(EXTENSIONS_DIR, extensionName);
    console.log(configDir, extensionDir);
    const blockFile = path.join(extensionDir, "blocks/app-block.liquid");

    // Check if the config directory exists
    if (!fs.existsSync(configDir)) {
        console.log(`⚠ Skipping ${extensionName} (no schema folder found)`);
        return false;
    }

    // Check if a block file exists
    if (!fs.existsSync(blockFile)) {
        console.log(`⚠ Skipping ${extensionName} (no app-block.liquid found)`);
        return false;
    }

    console.log(`📦 Processing ${extensionName}...`);

    try {
        // Read all JSON files from the config directory
        const configFiles = fs
            .readdirSync(configDir)
            .filter((file) => file.endsWith(".json"))
            .sort(); // Sort alphabetically for a consistent order

        if (configFiles.length === 0) {
            console.log(`  ⚠ No JSON files found in ${configDir}`);
            return false;
        }

        // Load all config files
        const allSettings = [];

        for (const configFile of configFiles) {
            const configPath = path.join(configDir, configFile);

            try {
                console.log(`  ✓ Loading ${configFile}`);
                const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

                if (Array.isArray(config)) {
                    allSettings.push(...config);
                } else {
                    console.log(`  ⚠ ${configFile} is not an array, skipping`);
                }
            } catch (err) {
                console.log(`  ❌ Error reading ${configFile}: ${err.message}`);
            }
        }

        console.log(`  📊 Loaded ${allSettings.length} settings`);

        // Create a schema object
        const schema = {
            name: "Radius Bundles",
            target: "section",
            settings: allSettings,
        };

        // Read existing liquid file
        let liquidContent = fs.readFileSync(blockFile, "utf8");

        // Find and replace schema section
        const schemaStart = liquidContent.indexOf("{% schema %}");
        const schemaEnd = liquidContent.indexOf("{% endschema %}");

        if (schemaStart === -1 || schemaEnd === -1) {
            throw new Error("Could not find {% schema %} tags in liquid file");
        }

        // Build a new schema section
        const newSchemaContent = `{% schema %}\n${JSON.stringify(schema, null, "\t")}\n{% endschema %}`;

        // Replace schema
        const beforeSchema = liquidContent.substring(0, schemaStart);
        const afterSchema = liquidContent.substring(
            schemaEnd + "{% endschema %}".length,
        );
        const newLiquidContent = beforeSchema + newSchemaContent + afterSchema;

        // Write back to the file
        fs.writeFileSync(blockFile, newLiquidContent, "utf8");

        console.log(`  ✅ Schema built successfully!`);
        console.log(`  📄 Updated: ${blockFile}\n`);

        return true;
    } catch (error) {
        console.error(`  ❌ Error building schema: ${error.message}\n`);
        return false;
    }
}

/**
 * Main execution
 */
try {
    // Check if the schema directory exists
    if (!fs.existsSync(SCHEMA_DIR)) {
        console.error(`❌ Schema directory not found: ${SCHEMA_DIR}`);
        process.exit(1);
    }

    // Get all schema folders
    const schemaFolders = fs
        .readdirSync(SCHEMA_DIR, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

    if (schemaFolders.length === 0) {
        console.log("⚠ No schema folders found");
        process.exit(0);
    }

    console.log(`Found ${schemaFolders.length} schema folder(s):\n`);

    // Build schema for each extension
    let successCount = 0;
    let failCount = 0;

    for (const folderName of schemaFolders) {
        const success = buildSchemaForExtension(folderName);
        if (success) {
            successCount++;
        } else {
            failCount++;
        }
    }

    // Summary
    console.log("═".repeat(50));
    console.log(`✅ Success: ${successCount}`);
    if (failCount > 0) {
        console.log(`❌ Failed: ${failCount}`);
    }
    console.log("═".repeat(50));

    if (failCount > 0) {
        process.exit(1);
    }
} catch (error) {
    console.error("❌ Fatal error:", error.message);
    process.exit(1);
}
