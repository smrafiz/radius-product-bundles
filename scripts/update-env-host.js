#!/usr/bin/env node
// scripts/update-env-host.js

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

class EnvHostUpdater {
    constructor() {
        this.envPath = path.join(process.cwd(), "web", ".env");
        this.rootEnvPath = path.join(process.cwd(), ".env");
        this.currentHost = null;
    }

    // Clean URL to remove ANSI codes and extra paths
    cleanUrl(url) {
        if (!url) return null;

        // Remove ANSI color codes
        url = url.replace(/\x1b\[[0-9;]*m/g, "");

        // Remove any trailing characters like │, ┤, etc.
        url = url.replace(/[│┤┐└┘┌┬├─┼┴┘┌┐│]/g, "");

        // Remove /api/proxy if it exists
        url = url.replace(/\/api\/proxy.*$/, "");

        // Remove trailing slashes and query params
        url = url.replace(/\/+$/, "").split("?")[0].split("#")[0];

        return url.trim();
    }

    // Extract tunnel URL from Shopify CLI output
    extractTunnelUrl(output) {
        // Remove ANSI color codes from output first
        const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");

        const patterns = [
            /Using URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /App URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /Preview URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /Tunnel URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /└ Using URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /app_home.*?Using URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /app_proxy.*?Using URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /Forwarding.*?(https:\/\/[^.\s│┤┐└┘┌┬├─┼┴]*\.trycloudflare\.com)/,
            /Your tunnel is available at (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            // More specific patterns for trycloudflare
            /(https:\/\/[a-z-]+\.trycloudflare\.com)(?!\/api)/,
        ];

        for (const pattern of patterns) {
            const match = cleanOutput.match(pattern);
            if (match && match[1] && !match[1].includes("myshopify.com")) {
                const cleanedUrl = this.cleanUrl(match[1]);
                if (cleanedUrl && cleanedUrl.startsWith("https://")) {
                    return cleanedUrl;
                }
            }
        }
        return null;
    }

    // Parse existing .env file preserving comments and structure
    parseEnvFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return { lines: [], vars: {} };
        }

        const content = fs.readFileSync(filePath, "utf8");
        const lines = content.split("\n");
        const vars = {};

        lines.forEach((line) => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                const [key, ...valueParts] = trimmed.split("=");
                if (key && valueParts.length > 0) {
                    vars[key.trim()] = valueParts
                        .join("=")
                        .trim()
                        .replace(/^["']|["']$/g, "");
                }
            }
        });

        return { lines, vars };
    }

    // Update .env file preserving structure
    updateEnvFile(filePath, newHost) {
        const { lines, vars } = this.parseEnvFile(filePath);

        // Variables to add/update - make sure newHost is clean
        const cleanHost = this.cleanUrl(newHost);
        const urlVars = {
            HOST: cleanHost,
            SHOPIFY_APP_URL: cleanHost,
            SHOPIFY_TUNNEL_URL: cleanHost,
            APP_URL: cleanHost,
            NEXT_PUBLIC_SHOPIFY_APP_URL: cleanHost,
        };

        let updatedLines = [];
        let addedVars = new Set();

        // Process existing lines
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Check if this line contains a variable we want to update
            let updated = false;
            for (const [varName, varValue] of Object.entries(urlVars)) {
                if (trimmed.startsWith(`${varName}=`)) {
                    updatedLines.push(`${varName}=${varValue}`);
                    addedVars.add(varName);
                    updated = true;
                    break;
                }
            }

            if (!updated) {
                updatedLines.push(line);
            }
        }

        // Add any new variables that weren't in the original file
        let needsUrlSection = false;
        for (const [varName, varValue] of Object.entries(urlVars)) {
            if (!addedVars.has(varName)) {
                if (!needsUrlSection) {
                    updatedLines.push("");
                    updatedLines.push(
                        "# Auto-generated URLs (updated by dev script)",
                    );
                    needsUrlSection = true;
                }
                updatedLines.push(`${varName}=${varValue}`);
            }
        }

        // Write updated content
        fs.writeFileSync(filePath, updatedLines.join("\n"));
    }

    // Update environment files with new host
    updateEnvFiles(newHost) {
        const cleanHost = this.cleanUrl(newHost);

        if (!cleanHost || this.currentHost === cleanHost) return;

        try {
            // Update web/.env if it exists
            if (fs.existsSync(this.envPath)) {
                this.updateEnvFile(this.envPath, cleanHost);
                console.log(`✅ Updated ${this.envPath}`);
            }

            // Update root .env if it exists
            if (fs.existsSync(this.rootEnvPath)) {
                this.updateEnvFile(this.rootEnvPath, cleanHost);
                console.log(`✅ Updated ${this.rootEnvPath}`);
            }

            this.currentHost = cleanHost;
            console.log(`\n🎉 Environment updated with HOST: ${cleanHost}\n`);
        } catch (error) {
            console.error(`❌ Failed to update .env files:`, error.message);
        }
    }

    // Start bun run dev with host auto-update
    startDev() {
        console.log("🚀 Starting bun run dev with auto HOST update...\n");

        const bunProcess = spawn("bun", ["run", "dev"], {
            stdio: ["inherit", "pipe", "pipe"],
            env: { ...process.env, FORCE_COLOR: "0" }, // Disable colors to avoid ANSI codes
        });

        let outputBuffer = "";
        let foundInitialUrl = false;

        const processOutput = (data) => {
            const output = data.toString();
            process.stdout.write(output);

            outputBuffer += output;

            // Look for tunnel URL in the output
            const tunnelUrl = this.extractTunnelUrl(output);
            if (tunnelUrl && tunnelUrl !== this.currentHost) {
                this.updateEnvFiles(tunnelUrl);

                if (!foundInitialUrl) {
                    foundInitialUrl = true;
                    console.log(
                        "📝 Environment files updated! The new HOST URL is now available.",
                    );
                    console.log(
                        "   Your app will automatically use the new URL.\n",
                    );
                }
            }
        };

        bunProcess.stdout.on("data", processOutput);
        bunProcess.stderr.on("data", processOutput);

        bunProcess.on("close", (code) => {
            console.log(`\n📝 bun run dev exited with code ${code}`);
        });

        // Handle cleanup
        process.on("SIGINT", () => {
            console.log("\n🛑 Shutting down...");
            bunProcess.kill("SIGINT");
            process.exit(0);
        });

        return bunProcess;
    }
}

// Run if called directly
const updater = new EnvHostUpdater();
updater.startDev();

export default EnvHostUpdater;
