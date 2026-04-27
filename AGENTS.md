# AGENTS.md

This file provides guidance for ALL AI agents working with the Radius Bundles repository.

## 0. Navigation Maps (READ FIRST)
* **INDEX_MAP.md**: Read FIRST to find documents by keyword/category
* **HEADER_MAP.md**: Find specific sections with file:line references
* **Flow**: INDEX_MAP → identify doc → HEADER_MAP → read specific section

## 1. Safety & Guardrails (MANDATORY)

**Read before ANY code changes:**
1. **[Agent Guardrails](docs/AGENT_GUARDRAILS.md)** — Core safety protocols, Four Laws, forbidden actions
2. **[Pre-Work Check](.guardrails/pre-work-check.md)** — Regression checklist

### The Four Laws of Agent Safety
1. **Read Before Editing** — Never modify code without reading it first
2. **Stay in Scope** — Only touch files explicitly authorized
3. **Verify Before Committing** — Test all changes
4. **Halt When Uncertain** — Ask instead of guessing

### Halt Conditions — STOP and ask the user if:
- Target file doesn't exist or has unexpected modifications
- Any test fails after edit
- Uncertain about ANY step
- Test/production boundary is unclear
- An operation has failed 3 times (Three Strikes Rule)

### Pre-Work Commands
```bash
python scripts/regression_check.py --all      # Check for regressions
python scripts/regression_check.py --staged    # Check staged changes only
python scripts/log_failure.py --list           # List known bugs
```

---

## 2. Core Rules & Standards

### Critical Thinking
- Evaluate: CRITICAL→Block | HIGH→Warn | MEDIUM→Advise
- Git: Uncommitted→"Commit?" | Wrong branch→"Feature?" | No backup→"Save?"
- Point out flaws | Suggest alternatives | Challenge assumptions
- Avoid: Excessive agreement | Unnecessary praise | Blind acceptance

### Evidence-Based Language
- **Prohibited**: best, optimal, faster, secure, better, improved, always, never, guaranteed
- **Required**: may, could, potentially, typically, often, sometimes
- **Evidence**: testing confirms, metrics show, benchmarks prove, data indicates

### Severity System
| Level | Score | Action | Examples |
|-------|-------|--------|----------|
| CRITICAL | 10 | Block | Secrets in code, force push shared, skip validation |
| HIGH | 7-9 | Fix Required | Security, production, error handling, test coverage |
| MEDIUM | 4-6 | Warn | DRY violations, naming, module boundaries |
| LOW | 1-3 | Suggest | Changelog, modern syntax, doc examples |

### Security Standards [CRITICAL]
- NEVER commit secrets, execute untrusted code, expose PII
- Validate absolute paths, no `../..` traversal
- Whitelist commands, escape arguments
- Start low permissions → Request → Temporary → Revoke

---

## 3. Workflow & Execution

### Task Management
- 3+ steps → create task list before executing
- One task in-progress at a time, update immediately
- Track blockers, risky ops → checkpoint first

### Files & Code
- Read → Write (always read first)
- Edit > Write (prefer edits over full rewrites)
- Clean code, conventions, error handling, no duplication
- **NO COMMENTS** unless explicitly asked

### Git Protocol
- Before work: status → branch → fetch → pull --rebase
- Commits: status → diff → add -p → commit
- Small, descriptive, single-focus commits
- AI attribution required: `Co-Authored-By: <agent> <email>`
- Never force push shared branches, never skip hooks

### Error Recovery
- On failure: Try alternative → Explain clearly → Suggest next step
- Verify-Fix Loop: attempt → verify → pass? done : analyze → adjust → retry (max 3)
- 5+ tool calls without progress → stop & flag to user

### Verification Gate [HIGH]
Before claiming "done" on any task:
- [ ] TypeScript compiles (`tsc --noEmit`)
- [ ] Relevant tests pass
- [ ] No console.log/debugger left
- [ ] Imports resolve, no unused variables
- [ ] Git diff looks clean
- **Evidence before assertion. Run check → read output → THEN claim done.**

---

## 4. Skill System

Skills are structured workflows that MUST be followed when they apply. Even a 1% chance a skill applies means you should use it.

### Skill Priority
1. **Process skills first** (brainstorming, debugging) — determine HOW to approach
2. **Implementation skills second** (TDD, parallel agents) — guide execution

### Available Skills (in `.opencode/skills/`)

| Skill | When to Use |
|-------|-------------|
| `brainstorming` | Before ANY creative work — features, components, modifications |
| `writing-plans` | When you have specs/requirements for a multi-step task |
| `executing-plans` | When you have a written plan to implement |
| `systematic-debugging` | Any bug, test failure, or unexpected behavior |
| `test-driven-development` | Before writing implementation code |
| `verification-before-completion` | Before claiming work is done |
| `requesting-code-review` | After completing tasks or features |
| `receiving-code-review` | When receiving feedback on code |
| `dispatching-parallel-agents` | 2+ independent tasks without shared state |
| `subagent-driven-development` | Executing plans with independent tasks |
| `finishing-branch` | When implementation is complete, deciding merge/PR/cleanup |
| `using-git-worktrees` | Feature work needing isolation |
| `writing-skills` | Creating or editing skill definitions |

### Iron Laws (Non-Negotiable)
- **No code before tests** (TDD)
- **No fixes without root cause** (Debugging)
- **No completion claims without verification** (Verification)
- **No implementation before design approval** (Brainstorming)

### Red Flags — STOP if you think:
| Thought | Reality |
|---------|---------|
| "This is just simple" | Simple tasks still need skill checks |
| "I need more context first" | Skill check comes BEFORE exploration |
| "Let me explore first" | Skills tell you HOW to explore |
| "This doesn't need a formal skill" | If a skill exists, use it |
| "The skill is overkill" | Simple things become complex. Use it |

---

## 5. Personas

Activate with context clues or explicit request. Each persona has a core belief, primary question, and specialized approach.

| Persona | Core Belief | Primary Question | Triggers |
|---------|-------------|------------------|----------|
| **architect** | Systems evolve, design for change | How will this scale & evolve? | Architecture, system design |
| **frontend** | UX determines product success | How does this feel to user? | *.tsx, *.jsx, UI work |
| **backend** | Reliability & perf enable everything | Will this handle 10x load? | API, database, services |
| **analyzer** | Every symptom has multiple causes | What evidence contradicts the obvious? | Errors, debugging |
| **security** | Threats exist everywhere | What could go wrong? | Auth, secrets, validation |
| **mentor** | Understanding grows through guided discovery | How can I help you understand? | Explanations, learning |
| **refactorer** | Code debt compounds exponentially | How can this be simpler & cleaner? | Code review, cleanup |
| **performance** | Speed is a feature | Where is the bottleneck? | Optimization, profiling |
| **qa** | Quality must be built in, not tested in | How could this break? | Testing, edge cases |

### Auto-Activation
- `*.tsx` / `*.jsx` → frontend
- `*.test.*` → qa
- `*.sql` / Prisma → backend
- `bug` / `error` → analyzer
- `optimize` / `perf` → performance
- `secure` / `auth` → security

---

## 6. MCP Server Usage

### Decision Matrix
| Need | Server | When |
|------|--------|------|
| Library docs | **context7** | ANY external lib question — resolve-library-id first |
| Complex analysis | **sequential-thinking** | Multi-step reasoning, architecture, root cause |
| UI generation | **magic** (if available) | Component building, UI design |
| Browser testing | **puppeteer** / **playwright** | Visual validation, screenshots |
| Shopify docs | **shopify-dev-mcp** | API, extensions, Liquid, GraphQL |
| Next.js | **next-devtools** | Next.js specific issues |

### Research-First Rule [CRITICAL]
- External lib detected → context7 lookup REQUIRED
- API integration → verify with official docs
- Confidence < 90% → implementation BLOCKED until research complete

### Token Budget
- Native tools: 0 cost (prefer these for simple tasks)
- Light MCP: 100-500 tokens
- Medium MCP: 500-2K tokens
- Heavy MCP: 2K-10K tokens
- Abort if >50% context consumed by MCP

---

## 7. Project Overview

Embedded Shopify app for creating/managing product bundles. Built with Next.js 16 (App Router) + React 19, PostgreSQL + Prisma 7, Zustand state management, and Shopify Polaris UI. Includes a Rust WASM discount function and Liquid theme extension.

### Commands

```bash
# Development (from root)
bun run dev                 # Concurrent: app + widgets + schema watcher
bun run dev:app             # Shopify CLI dev server only
bun run dev:widgets         # Vite watch-build for storefront widgets
bun run dev:full            # Auto-update env host + codegen then dev

# Build & Deploy (from root)
bun run build               # shopify app build
bun run deploy              # shopify app deploy
bun run build:widgets       # Vite build widgets-src
bun run build:schema        # Build extension schema

# Database (from /web)
bun run migrate             # prisma migrate dev
bun run prisma:push         # Push schema without migration
bun run prisma:studio       # Open Prisma Studio

# Code Quality (from /web)
bun run test                # Jest
bun run test --watch        # Watch mode
bun run test --coverage     # With coverage
bun run graphql-codegen     # Generate GraphQL types from Shopify API 2025-10
bun run pretty              # Prettier on entire repo
```

### Architecture

```
/                           # Root: orchestration, shopify.app.toml
/web                        # Next.js app (frontend + backend)
/extension/extensions/
  product-bundle-widget/    # Liquid theme extension (storefront widget)
  radius-discount-function/ # Rust WASM function (server-side discounts)
/extension/schema/          # Widget schema definitions
```

### Feature Module Structure (`/web/features/`)
```
features/<name>/
  actions/       # Next.js server actions (API boundary)
  api/           # React Query keys, queries, mutations
  components/    # Feature-specific UI
  hooks/         # Feature-specific hooks
  repositories/  # Prisma data access
  services/      # Business logic
  stores/        # Zustand stores
  types/         # TypeScript interfaces
  constants/     # Feature constants
  validation/    # Zod schemas
```

### Data Flow
```
Component → React Query → Server Action → Service → Repository → Prisma → PostgreSQL
                                              ↓
                                       Shopify Admin API (GraphQL)
```

### State Management
- **Server state**: React Query (@tanstack/react-query)
- **Feature state**: Zustand with Immer middleware
- **Global state**: Zustand in `/web/shared/stores/`
- **Form state**: React Hook Form + Zod

### Path Aliases
```
@/*         → /web/*
@/lib/*     → /web/lib/*
@/features/* → /web/features/*
@/shared/*  → /web/shared/*
@/tests/*   → /web/tests/*
```

---

## 8. Code Style

### Formatting (Prettier)
```json
{ "trailingComma": "all", "tabWidth": 4, "semi": true }
```

### TypeScript
- Strict mode enabled
- Explicit return types on functions
- `as const` for literal type assertions
- Zod schemas for runtime validation

### File Naming
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `BundlePreview.tsx` |
| Hooks | camelCase | `useBundleActions.ts` |
| Services | kebab-case + `.service.ts` | `bundle-read.service.ts` |
| Types | kebab-case + `.types.ts` | `bundle.types.ts` |

### Import Order
1. `"use server"` / `"use client"` directives
2. Node built-ins (`next/cache`, etc.)
3. External libraries (React, Zustand, Prisma)
4. Path aliases (`@/lib/*`, `@/shared/*`, `@/features/*`)
5. GraphQL generated types
6. Local files (relative imports)

### Error Handling Pattern
```typescript
// Success
return { status: "success" as const, message: "...", data: result };
// Error
return { status: "error" as const, message: "...", errors: [String(error)] };
```

---

## 9. Testing

- Jest config: `web/jest.config.js`
- Pattern: `**/?(*.)+(spec|test).[tj]s?(x)`
- Setup: `web/tests/setup/jest.setup.ts`
- Libraries: `@testing-library/jest-dom`, `@testing-library/react`, `jest-mock-extended`

---

## 10. Token Economy

- Responses < 4 lines when possible
- Bullets > prose, YAML > prose
- Remove filler: the, a, very, really, that, which
- Code: No comments, short names, no boilerplate
- Do > explain | Assume obvious | Skip permissions for obvious ops

---

## 11. Bundle Domain

### Bundle Types
FIXED_BUNDLE, BUY_X_GET_Y, BOGO, VOLUME_DISCOUNT, MIX_AND_MATCH, FREQUENTLY_BOUGHT_TOGETHER

### Bundle Statuses
DRAFT, ACTIVE, PAUSED, ARCHIVED, SCHEDULED, DELETED

### Discount Types
PERCENTAGE, FIXED_AMOUNT, CUSTOM_PRICE, NO_DISCOUNT, BUY_X_GET_Y, QUANTITY_BREAKS

### Package Manager
**bun** — primary runtime and package manager for all commands.
