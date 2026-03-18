# Radius Product Bundles - Shopify App

A comprehensive Shopify app for creating and managing product bundles with advanced analytics, automation, and customer management features. Built with Next.js 15, TypeScript, and Shopify Polaris.

## 🚀 Overview

Radius Product Bundles is a powerful Shopify application that enables merchants to create, manage, and optimize product bundles. The app provides a complete suite of tools including bundle creation, analytics dashboard, customer management, A/B testing, automation workflows, and pricing rules.

## ✨ Key Features

### 📦 Bundle Management

- **Multiple Bundle Types**: Support for various bundle configurations and types
- **Advanced Product Selection**: Enhanced modal with intelligent filtering and search
- **Real-time Preview**: Live bundle preview with drag-and-drop reordering
- **Bundle Templates**: Pre-built templates for quick bundle creation

### 📊 Analytics & Dashboard

- **Real-time Metrics**: Track bundle performance, revenue, and conversion rates
- **Revenue Analytics**: Detailed revenue tracking and forecasting
- **Performance Insights**: Bundle efficiency and optimization recommendations
- **Custom Reports**: Generate detailed reports for business intelligence

### 🎯 Customer Management

- **Customer Segmentation**: Advanced customer grouping and targeting
- **Purchase History**: Track customer bundle purchase patterns
- **Personalization**: Tailored bundle recommendations based on customer behavior

### 🧪 A/B Testing

- **Bundle Testing**: Test different bundle configurations and pricing
- **Performance Comparison**: Compare metrics across test variants
- **Statistical Analysis**: Data-driven insights for optimization

### ⚙️ Automation & Integrations

- **Workflow Automation**: Automated bundle creation and management
- **Third-party Integrations**: Connect with external tools and services
- **Event-driven Actions**: Trigger actions based on customer behavior

### 💰 Pricing Rules

- **Dynamic Pricing**: Flexible pricing strategies for bundles
- **Discount Management**: Advanced discount rules and conditions
- **Price Optimization**: AI-driven pricing recommendations

### 🛠️ Settings & Configuration

- **App Configuration**: Comprehensive app settings and preferences
- **Theme Integration**: Seamless integration with Shopify themes
- **Permission Management**: Role-based access control

## 🏗️ Tech Stack

### Frontend

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Shopify Polaris
- **Styling**: Tailwind CSS 4.1
- **State Management**: Zustand 5.0
- **Animations**: @dnd-kit for drag-and-drop functionality

### Backend & Data

- **Runtime**: Node.js
- **Database**: PostgreSQL with Prisma ORM 6.14
- **GraphQL**: Apollo Client 3.13
- **API**: Shopify Admin API
- **Authentication**: Shopify App Bridge 4.2

### Development Tools

- **Package Manager**: pnpm
- **Code Generation**: GraphQL Code Generator 5.0
- **Type Safety**: TypeScript 5.9
- **Linting**: ESLint 9
- **Formatting**: Prettier 3.6

### Shopify Integration

- **Shopify CLI**: 3.83
- **Shopify API**: 11.14
- **App Bridge**: React integration for embedded apps
- **Webhooks**: Real-time data synchronization

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Shopify CLI
- PostgreSQL database
- Shopify Partner account

### 1. Clone the Repository

```bash
git clone <repository-url>
cd radius-product-bundles
```

### 2. Install Dependencies

```bash
# Install root dependencies
pnpm install

# Install web dependencies
cd web
pnpm install
```

### 3. Environment Setup

```bash
# Copy environment files
cp .env.example .env
cp web/.env.example web/.env

# Configure your environment variables
# DATABASE_URL, SHOPIFY_API_KEY, SHOPIFY_API_SECRET, etc.
```

### 4. Database Setup

```bash
# Generate Prisma client
cd web
pnpm run prepare

# Run database migrations
pnpm run prisma:migrate init

# (Optional) Open Prisma Studio
pnpm run prisma:studio
```

### 5. GraphQL Code Generation

```bash
# Generate TypeScript types from GraphQL schema
pnpm run graphql-codegen
```

## 🚀 Development Commands

### Starting Development Server

```bash
# Start the development server
pnpm run dev

# Alternative: Using Shopify CLI
shopify app dev
```

### Database Commands

```bash
# Generate Prisma client
pnpm run prepare

# Create and apply migrations
pnpm run prisma:migrate <migration-name>

# Push schema changes without migration
pnpm run prisma:push

# Pull schema from database
pnpm run prisma:pull

# Open Prisma Studio
pnpm run prisma:studio

# Reset database
npx prisma migrate reset
```

### GraphQL & Code Generation

```bash
# Generate GraphQL types
pnpm run graphql-codegen

# Watch for GraphQL changes (development)
pnpm run graphql-codegen --watch
```

### Build & Deployment

```bash
# Build for production
pnpm run build

# Deploy to Shopify (production)
shopify app deploy

# Generate production build
npm run build
```

## 📁 Example Project Structure

```
radius-product-bundles/
├── web/                          # Main Next.js application
│   ├── app/                      # Next.js 15 App Router
│   │   ├── dashboard/           # Analytics dashboard
│   │   ├── bundles/             # Bundle management
│   │   │   ├── create/          # Bundle creation wizard
│   │   │   └── [id]/            # Bundle details/editing
│   │   ├── customers/           # Customer management
│   │   ├── analytics/           # Advanced analytics
│   │   ├── ab-testing/          # A/B testing suite
│   │   ├── automation/          # Workflow automation
│   │   ├── pricing-rules/       # Pricing management
│   │   ├── integrations/        # Third-party integrations
│   │   ├── templates/           # Bundle templates
│   │   ├── settings/            # App configuration
│   │   └── api/                 # API routes
│   ├── components/              # Reusable UI components
│   ├── lib/                     # Utilities and configurations
│   │   ├── stores/              # Zustand state stores
│   │   ├── gql/                 # GraphQL client setup
│   │   └── queries/             # GraphQL queries & fragments
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   ├── prisma/                  # Database schema and migrations
│   └── providers/               # React context providers
├── extension/                   # Shopify theme extensions (if any)
└── docs/                        # Documentation
```

## 🔧 Key Configuration Files

### Shopify App Configuration

- **Access Scopes**: `read_customers`, `read_orders`, `read_products`, `write_products`, `write_price_rules`
- **App Type**: Embedded app with direct API access
- **Webhooks**: Real-time synchronization with Shopify data

---
- update ci/cd

Built with ❤️ by [RadiusTheme](https://radiustheme.com)
