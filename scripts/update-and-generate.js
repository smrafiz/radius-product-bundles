#!/usr/bin/env node
// scripts/update-and-generate.js

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

class FullConfigUpdater {
    constructor() {
        this.envPath = path.join(process.cwd(), ".env");
        this.tomlPath = path.join(process.cwd(), "shopify.app.toml");
        this.currentHost = null;
    }

    cleanUrl(url) {
        if (!url) return null;
        url = url.replace(/\x1b\[[0-9;]*m/g, "");
        url = url.replace(/[│┤┐└┘┌┬├─┼┴┘┌┐│]/g, "");
        url = url.replace(/\/api\/proxy.*$/, "");
        url = url.replace(/\/+$/, "").split("?")[0].split("#")[0];
        return url.trim();
    }

    extractTunnelUrl(output) {
        const cleanOutput = output.replace(/\x1b\[[0-9;]*m/g, "");
        const patterns = [
            /Using URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
            /app_proxy.*?Using URL: (https:\/\/[^\s│┤┐└┘┌┬├─┼┴]+)/,
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

    updateEnv(newHost) {
        if (!fs.existsSync(this.envPath)) return;

        let content = fs.readFileSync(this.envPath, "utf8");

        // Update or add HOST and related variables
        const urlVars = {
            HOST: newHost,
            SHOPIFY_APP_URL: newHost,
            SHOPIFY_TUNNEL_URL: newHost,
            APP_URL: newHost,
            NEXT_PUBLIC_SHOPIFY_APP_URL: newHost,
        };

        for (const [varName, varValue] of Object.entries(urlVars)) {
            if (content.includes(`${varName}=`)) {
                content = content.replace(
                    new RegExp(`^${varName}=.*`, "m"),
                    `${varName}=${varValue}`,
                );
            } else {
                content += `\n${varName}=${varValue}`;
            }
        }

        fs.writeFileSync(this.envPath, content);
    }

    updateTomlFile(newHost) {
        if (!fs.existsSync(this.tomlPath)) {
            console.error("❌ shopify.app.toml not found");
            return;
        }

        let content = fs.readFileSync(this.tomlPath, "utf8");

        // Update application_url
        content = content.replace(
            /application_url\s*=\s*"[^"]*"/g,
            `application_url = "${newHost}"`,
        );

        // Update app_proxy url
        content = content.replace(
            /(\[app_proxy\][\s\S]*?)url\s*=\s*"[^"]*"/g,
            `$1url = "${newHost}/api/proxy"`,
        );

        // Update redirect_urls array
        content = content.replace(
            /redirect_urls\s*=\s*\[([\s\S]*?)\]/g,
            `redirect_urls = [
  "${newHost}/api/auth/callback",
  "${newHost}/api/auth/oauth/callback"
]`,
        );

        // Add header comment with timestamp
        const timestamp = new Date().toISOString();
        const header = `# Auto-updated with tunnel URL: ${newHost}\n# Updated at: ${timestamp}\n`;

        // Add header if not present
        if (!content.startsWith("# Auto-updated")) {
            content = header + content;
        } else {
            // Update existing header
            content = content.replace(
                /^# Auto-updated.*\n# Updated at:.*\n/m,
                header,
            );
        }

        fs.writeFileSync(this.tomlPath, content);
        console.log("✅ Updated shopify.app.toml");
    }

    deployToShopify() {
        console.log("🚀 Deploying configuration to Shopify...");

        const deployProcess = spawn("shopify", ["app", "deploy"], {
            stdio: "inherit",
            env: { ...process.env },
        });

        deployProcess.on("close", (code) => {
            if (code === 0) {
                console.log("✅ Successfully deployed to Shopify");
            } else {
                console.error("❌ Failed to deploy to Shopify");
            }
        });

        deployProcess.on("error", (error) => {
            console.error("❌ Deploy error:", error.message);
        });
    }

    updateAll(newHost) {
        if (this.currentHost === newHost) return;

        console.log(`\n🔄 Updating configuration with HOST: ${newHost}`);

        try {
            // 1. Update .env file
            this.updateEnv(newHost);
            console.log("✅ Updated .env");

            // 2. Update TOML file
            this.updateTomlFile(newHost);

            // 3. Deploy to Shopify
            setTimeout(() => {
                this.deployToShopify();
            }, 1000); // Small delay to ensure file is written

            this.currentHost = newHost;
            console.log(`🎉 Configuration updated successfully!\n`);
        } catch (error) {
            console.error("❌ Failed to update configuration:", error.message);
        }
    }

    startDev() {
        console.log("🚀 Starting development with full auto-update...\n");

        const bunProcess = spawn("bun", ["run", "dev"], {
            stdio: ["inherit", "pipe", "pipe"],
            env: { ...process.env, FORCE_COLOR: "0" },
        });

        let outputBuffer = "";

        const processOutput = (data) => {
            const output = data.toString();
            process.stdout.write(output);

            outputBuffer += output;

            const tunnelUrl = this.extractTunnelUrl(output);
            if (tunnelUrl) {
                this.updateAll(tunnelUrl);
            }
        };

        bunProcess.stdout.on("data", processOutput);
        bunProcess.stderr.on("data", processOutput);

        bunProcess.on("close", (code) => {
            console.log(`\n📝 Development server exited with code ${code}`);
        });

        process.on("SIGINT", () => {
            console.log("\n🛑 Shutting down...");
            bunProcess.kill("SIGINT");
            process.exit(0);
        });
    }
}

const updater = new FullConfigUpdater();
updater.startDev();
