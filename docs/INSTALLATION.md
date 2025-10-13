# 🚀 Installation & Setup Guide - Radius Product Bundles

Complete guide to set up the Radius Product Bundles Shopify app on your local development environment.

---

## 📋 Prerequisites

### Required Software

Install the following before proceeding:

| Software | Minimum Version | Installation |
|----------|----------------|--------------|
| **Node.js** | v20.0.0 or higher | [Download](https://nodejs.org/) |
| **Bun** | v1.0.0 or higher | [Download](https://bun.sh/) or `curl -fsSL https://bun.sh/install \| bash` |
| **pnpm** | v9.0.0 or higher | `npm install -g pnpm` or `corepack enable` |
| **Shopify CLI** | v3.83.0 or higher | `npm install -g @shopify/cli@latest` |
| **Git** | Latest | [Download](https://git-scm.com/) |

### Verify Installation

```bash
node --version    # Should show v20.0.0+
bun --version     # Should show v1.0.0+
pnpm --version    # Should show v9.0.0+
shopify version   # Should show 3.83.0+
git --version     # Should show 2.x.x+
```

### Required Accounts

1. **Shopify Partner Account** - [Create account](https://partners.shopify.com/signup)
2. **Development Store** - Create from Partner Dashboard (Apps → Development stores)
3. **Neon Database Account** - [Sign up at Neon.tech](https://neon.tech/) (Free tier available)

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
# Clone repository
git clone <repository-url>
cd radius-product-bundles

# Verify you're in the correct directory
ls -la
# You should see: pnpm-workspace.yaml, package.json, web/, extension/
```

### Step 2: Install All Dependencies

```bash
# Install all workspace dependencies (root, web, extensions)
pnpm install
```

This single command installs dependencies for all workspace packages defined in `pnpm-workspace.yaml`.

---

## 🗄️ Database Setup

### Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign up or log in
3. Click **Create Project**
4. Configure your project:
    - **Project name**: `radius-bundles`
    - **Region**: Select closest to your location
    - **PostgreSQL version**: 16 (default)
5. Click **Create Project**
6. Copy the **Connection String** from the dashboard

Your connection string looks like:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## 🔧 Configuration

### Step 1: Configure Root Environment

Create `.env` in **root directory**:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Shopify App Credentials
# Get these from: https://partners.shopify.com/organizations
SHOPIFY_API_KEY=                    # Leave empty for now
SHOPIFY_API_SECRET=                 # Leave empty for now

# Access Scopes (DO NOT MODIFY)
SCOPES=read_customers,read_orders,read_price_rules,read_products,read_themes,write_app_proxy,write_price_rules,write_products,write_script_tags

# App Configuration
APP_NAME="Product Bundles"
APP_HANDLE="product-bundles"        # Change if you want a unique handle
HOST=                                # Auto-filled by Shopify CLI
SHOPIFY_API_VERSION="2025-10"
POS_EMBEDDED=false
DIRECT_API_MODE="offline"
EMBEDDED_APP_DIRECT_API_ACCESS=true
AUTO_UPDATE_URL=true

# Database Connection (from Neon)
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Development Store
DEV_STORE_URL="your-store.myshopify.com"    # Replace with your dev store URL
```

### Step 2: Configure Web Environment

Create `.env` in **web/** directory:

```bash
cd web
cp .env.example .env
cd ..
```

Edit `web/.env`:

```env
# Database (same as root .env)
DATABASE_URL="postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require"
DIRECT_DATABASE_URL="${DATABASE_URL}"

# Shopify Store (for frontend)
NEXT_PUBLIC_SHOP=your-store.myshopify.com
```

### Step 3: Initialize Database

```bash
# Generate Prisma Client
cd web
bun run prepare

# Create database tables
bun run prisma:migrate init
# If prompted for migration name, just press Enter

# Verify database setup (optional)
bun run prisma:studio
# Opens browser at http://localhost:5555

cd ..
```

---

## 🏪 Install App in Development Store

### Step 1: Create or Link Shopify App

```bash
# From root directory
bun run dev:app
```

**First-time setup prompts:**

1. **Log in to Shopify**
   ```
   ? Log in to your Shopify account:
   > Yes
   ```
   Browser opens → Log in with Partner account

2. **Select Partner Organization**
   ```
   ? Which Partners organization is this work for?
   > Your Organization Name
   ```

3. **Create or Use App**
   ```
   ? Create this project as a new app on Shopify?
   > Yes, create it as a new app
   ```

   OR if you created app manually in Partner Dashboard:
   ```
   > No, connect it to an existing app
   ```

4. **App Name** (if creating new)
   ```
   ? App name:
   > Product Bundles
   ```

5. **Select Development Store**
   ```
   ? Which development store would you like to use?
   > your-store.myshopify.com
   ```

### Step 2: Install App

After setup completes:

1. **Shopify CLI opens your browser** to app installation URL
2. Click **Install app**
3. **Review permissions** and click **Install**
4. You're redirected to your app dashboard

**✅ Success!** Your app is now installed and running.

---

## 🚀 Running the Application

### Start Development Server

```bash
# From root directory
bun run dev
```

This command:
- ✅ Starts Next.js app (port 3000)
- ✅ Starts Shopify tunnel (Cloudflare)
- ✅ Watches and builds widgets
- ✅ Hot reloads on file changes

**Access your app:**
- **In Shopify Admin**: Apps → Product Bundles
- **Direct URL**: Check terminal for tunnel URL (e.g., `https://xyz.trycloudflare.com`)

### Alternative Commands

```bash
# Run only Shopify app with tunnel
bun run dev:app

# Build widgets separately
bun run dev:widgets
```

---

## ✅ Verification Checklist

Before you start developing, verify:

- [ ] All dependencies installed (`node_modules` exists in root and `web/`)
- [ ] `.env` files configured in root and `web/`
- [ ] Database connected (run `cd web && pnpm run prisma:studio`)
- [ ] Shopify CLI authenticated (`shopify whoami`)
- [ ] App installed in dev store
- [ ] App loads in Shopify Admin without errors
- [ ] No console errors in browser DevTools

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

```bash
# Clean install
rm -rf node_modules web/node_modules
pnpm install
```

### Issue: Database connection failed

```bash
# Test connection
cd web
npx prisma db push

# Verify your DATABASE_URL includes:
# ?sslmode=require at the end
```

### Issue: App won't load in Shopify

```bash
# Check Shopify CLI is running
bun run dev:app

# Verify tunnel URL is accessible
curl https://your-tunnel-url.trycloudflare.com

# Check browser console for App Bridge errors
```

### Issue: Port 3000 already in use

```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9

# Or specify different port
PORT=3001 bun run dev
```

### Issue: Prisma Client errors

```bash
cd web

# Regenerate Prisma Client
bun run prepare

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Issue: TypeScript errors after git pull

```bash
cd web

# Regenerate Prisma types
bun run prepare

# Regenerate GraphQL types
bun run graphql-codegen

# Clear Next.js cache
rm -rf .next
```

### Issue: Tunnel expires/disconnects

The Cloudflare tunnel expires after inactivity or a few hours:

```bash
# Simply restart
bun run dev:app
# New tunnel URL will be generated
```

---

## 📝 Important Notes

### Package Managers

- **pnpm** - For installing dependencies (workspace management)
- **Bun** - For running development scripts (faster execution)

```bash
# Install dependencies with pnpm
pnpm install

# Run scripts with bun
bun run dev
```

### Environment Files

- ⚠️ **Never commit `.env` files** - They contain sensitive credentials
- ✅ Use `.env.example` as template
- ✅ Both root and `web/` need separate `.env` files

### Database Migrations

```bash
# Create new migration
cd web
bun run prisma:migrate your_migration_name

# Development only (no migration file)
bun run prisma:push

# View database
bun run prisma:studio
```

### Updating Dependencies

```bash
# Update all workspace packages
pnpm update -r

# Update specific package
pnpm update <package-name> -r
```

### Development Store Limitations

- Maximum 100 products
- Test data only
- Resets every 30 days if unused
- Cannot process real payments

---

## 🎯 Next Steps

Now that your app is installed:

1. **Explore the Dashboard** - Navigate through different sections
2. **Create Your First Bundle** - Test bundle creation flow
3. **Check Prisma Studio** - View database structure at `localhost:5555`
4. **Read the Documentation** - Check project README and `/docs` folder
5. **Join the Team** - Connect with other developers

---

## 🆘 Getting Help

- **Shopify Docs**: [shopify.dev/docs](https://shopify.dev/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://www.prisma.io/docs)
- **pnpm Docs**: [pnpm.io](https://pnpm.io/)
- **Bun Docs**: [bun.sh/docs](https://bun.sh/docs)
- **Neon Docs**: [neon.tech/docs](https://neon.tech/docs)
- **Team Support**: Contact your team lead or check internal docs

---

**Happy Coding! 🚀**

Built with ❤️ by RadiusTheme