# Installation Guide

## Prerequisites

| Tool        | Version | Install                                                           |
| ----------- | ------- | ----------------------------------------------------------------- |
| Node.js     | ≥ 22.x  | [nodejs.org](https://nodejs.org/)                                 |
| pnpm        | ≥ 9.x   | `npm install -g pnpm`                                             |
| Bun         | ≥ 1.1.x | `curl -fsSL https://bun.sh/install \| bash`                       |
| Rust        | ≥ 1.85+ | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| Shopify CLI | latest  | `npm install -g @shopify/cli`                                     |
| PostgreSQL  | 15+     | [Neon](https://neon.tech/) (cloud) or local install               |

> **Note**: **pnpm** is used for package management (installing dependencies). **Bun** is used as the runtime for watching, bundling, and running scripts.

### Rust WASM Target

Required for building the discount function:

```bash
rustup target add wasm32-unknown-unknown
```

## 1. Clone & Install Dependencies

```bash
git clone https://github.com/radiustheme/radius-bundles.git
cd radius-bundles

# Root & web app dependencies
pnpm install
```

## 2. Configure Environment Variables

### Root `.env`

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Shopify Partner Dashboard → App → API credentials
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret

# Scopes (pre-configured, modify if needed)
SCOPES=read_locales,read_orders,read_products,read_themes,write_app_proxy,write_discounts,write_files,write_products,write_publications

# App config
APP_NAME="Product Bundles"
APP_HANDLE="product-bundles47"
HOST=                           # Auto-set by Shopify CLI during dev
SHOPIFY_API_VERSION="2026-04"
POS_EMBEDDED=false
DIRECT_API_MODE="offline"
EMBEDDED_APP_DIRECT_API_ACCESS=true
AUTO_UPDATE_URL=true

# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Your dev store
DEV_STORE_URL="your-store.myshopify.com"

# Token encryption key — generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=
```

### Web `.env`

```bash
cp web/.env.example web/.env
```

Edit `web/.env`:

```env
# Same database URL as root
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
DIRECT_DATABASE_URL="${DATABASE_URL}"

# Your dev store domain
NEXT_PUBLIC_SHOP=your-store.myshopify.com

# Cron route protection — generate with:
#   node -e "console.log(crypto.randomUUID())"
CRON_SECRET=

# Token encryption key — generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
ENCRYPTION_KEY=
```

## 3. Set Up Database

```bash
cd web

# Generate Prisma client
bun prepare

# Push schema to database (creates all tables)
bun prisma:push

cd ..
```

> **Tip**: Use `bun prisma:studio` to visually inspect your database.

## 4. Configure Shopify App

### Create App in Partner Dashboard

1. Go to [Shopify Partners](https://partners.shopify.com/) → Apps → Create app
2. Choose "Create app manually"
3. Copy the **API key** and **API secret** into your `.env` (root)

### Generate `shopify.app.toml`

The TOML config is **auto-generated** from your `.env` values. Do not edit it manually.

```bash
bun run update:config
```

This runs `web/_developer/tomlWriter.ts` which reads your `.env` and writes `shopify.app.toml` to root, web, and extension directories. It also runs Prettier and deploys the config.

## 5. Generate GraphQL Types

```bash
cd web
bun graphql-codegen
cd ..
```

## 6. Build Discount Function (Rust → WASM)

```bash
cd extension/extensions/radius-discount-function
cargo build --target=wasm32-unknown-unknown --release
cd ../../..
```

This compiles the Rust discount function to WASM. The output is used by Shopify to calculate line-item and delivery discounts server-side.

## 7. Run Development Server

```bash
bun run dev
```

This starts concurrently:

- **Shopify CLI dev server** (Next.js app + tunnel)
- **Vite widget watcher** (storefront JS/CSS)
- **Schema watcher** (extension schema auto-rebuild)

On first run, Shopify CLI will:

1. Prompt you to log in to your Partner account
2. Ask you to select/create a dev store
3. Generate a tunnel URL and update your app URLs

Open the URL shown in the terminal to install the app on your dev store.

## 8. Deploy to Shopify

```bash
# Build everything
bun run build

# Deploy extensions and app config
bun run deploy
```

## Project Structure

```
/                                   # Root: scripts, shopify.app.toml
├── web/                            # Next.js 16 app (frontend + backend)
│   ├── app/                        # App Router pages & API routes
│   ├── features/                   # Feature modules (bundles, settings, analytics...)
│   ├── shared/                     # Shared components, hooks, utils
│   ├── prisma/                     # Schema & generated client
│   ├── widgets/                    # Built widget output
│       └── src/                    # Widget source (Vite)
│
├── extension/
    ├── extensions/
    │   ├── product-bundle-widget/  # Liquid theme extension
    │   └── radius-discount-function/ # Rust WASM discount function
    └── schema/                     # Widget schema definitions
```

## Common Commands

| Command                         | Description                               |
| ------------------------------- | ----------------------------------------- |
| `bun run dev`                   | Start full dev environment                |
| `bun run build`                 | Build app for deployment                  |
| `bun run deploy`                | Deploy to Shopify                         |
| `bun run update:config`         | Regenerate `shopify.app.toml` from `.env` |
| `bun run build:schema`          | Rebuild extension schema                  |
| `cd web && bun prisma:push`     | Run Prisma push                           |
| `cd web && bun prisma:pull`     | Run Prisma pull                           |
| `cd web && bun prepare`         | Regenerate prisma types                   |
| `cd web && bun migrate`         | Run Prisma migrations                     |
| `cd web && bun prisma:studio`   | Open database GUI                         |
| `cd web && bun graphql-codegen` | Regenerate GraphQL types                  |

## Troubleshooting

### `next build` fails with missing env vars

Expected in local dev without full Shopify context. Use `bun run dev` (via Shopify CLI) instead.

### Prisma client not found

Run `cd web && bun prepare` to regenerate the client.

### Rust/WASM build fails

Ensure the WASM target is installed: `rustup target add wasm32-unknown-unknown`

### Shopify CLI not detecting app

Run `bun run update:config` to regenerate `shopify.app.toml` from your `.env` values. Ensure `SHOPIFY_API_KEY` is set correctly.

### Port conflicts

Shopify CLI defaults to port 3000. Kill any existing processes or set a custom port via Shopify CLI flags.
