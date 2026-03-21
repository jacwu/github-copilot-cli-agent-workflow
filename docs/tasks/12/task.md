# Task 1: Initialize Project Scaffold and Global UI Style Configuration

## Background

The product requirements define a full-stack travel website that will rely heavily on a polished, image-forward frontend experience for destination discovery, trip planning, authentication, and brand storytelling. The repository-level technical design standardizes on Next.js 15 with the App Router, TypeScript, Tailwind CSS, and shadcn/ui, and it explicitly sets a "Light & Airy Vacation Style" as the visual foundation for the application.

Issue #12 is the first implementation task and establishes the baseline project scaffold plus the global design system decisions that later feature work will inherit. Because subsequent tasks will build pages, forms, cards, navigation, and authenticated flows on top of this foundation, the scaffold and theme configuration must be consistent, reusable, and opinionated enough to avoid visual drift.

## Goal

Create a working application foundation with:

- Next.js 15 App Router project scaffolding
- Strict TypeScript configuration
- Tailwind CSS v4 setup (the default for Next.js 15)
- shadcn/ui integration
- Vitest testing framework configuration
- Global style tokens and theme variables that encode the "Light & Airy Vacation Style"
- A reusable UI baseline centered on Ocean Teal as the single primary brand color, light backgrounds, large radii, and soft shadows

The output of this task should make future UI work straightforward by defining where configuration lives, how theme tokens are expressed, and what default styling conventions later tasks should follow.

## Non-Goals

- Implementing destination, trip, authentication, or about-page feature logic
- Building production-ready page content beyond minimal scaffold verification surfaces
- Designing database, ORM, or API logic (Task 2 and Task 3)
- Finalizing detailed component implementations for all future screens
- Introducing multiple branded accent colors beyond the single primary Ocean Teal direction
- Dark mode implementation (the token structure should accommodate it later, but only the light theme is required)
- Performing implementation-time visual fine-tuning that is better validated after real screens exist

## Current State

The repository currently contains only planning and documentation files — no source code, `package.json`, or configuration files exist yet. This is a greenfield scaffold.

Key repository-level constraints already established in `docs/design.md`:

- **Frontend stack**: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Testing**: Vitest with co-located `*.test.ts` test files (design.md §8)
- **Typography**: modern sans-serif (Inter or Geist)
- **Visual language**: light gray-white backgrounds, generous whitespace, large rounded corners, soft shadows, selective glassmorphism
- **UI conventions**: `rounded-2xl` / `rounded-3xl`, `shadow-sm` to `shadow-xl` on hover, Ocean Teal as primary action color
- **Project structure**: source rooted under `src/` with `src/app/`, `src/components/ui/`, `src/lib/`, `src/db/`, `src/types/`
- **Package manager**: npm exclusively (AGENTS.md)

Key environment facts:

- **Node.js 24** is available (v24.14.0, npm 11.9.0)
- **`create-next-app` latest is v16.x** — must pin to `create-next-app@15` to get Next.js 15 as required by design.md
- **`shadcn` CLI** is available and supports Tailwind CSS v4
- The current `.gitignore` contains Python-centric entries and is missing Next.js-specific patterns (`.next/`, `out/`, etc.)

## Proposed Design

### 1. Scaffold the application with Next.js 15

Initialize the project using `npx create-next-app@15` with explicit flags to ensure the correct configuration:

```bash
npx create-next-app@15 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

This produces:
- `package.json` with Next.js 15, React 19, Tailwind CSS v4
- `tsconfig.json` with `@/*` path alias pointing to `src/*`
- `src/app/layout.tsx` and `src/app/page.tsx`
- `src/app/globals.css` with Tailwind v4 directives
- `next.config.ts`
- ESLint configuration for Next.js
- `public/` directory

After scaffolding, enforce strict TypeScript by setting `"strict": true` in `tsconfig.json` (if not already set by the template).

**Import alias**: The `@/*` alias maps to `src/*`, enabling clean imports like `import { cn } from "@/lib/utils"` throughout the codebase.

### 2. Update .gitignore for Next.js

The existing `.gitignore` contains Python-centric patterns. It must be updated to include Next.js and Node.js patterns:

- `.next/` — Next.js build output
- `out/` — static export output
- `node_modules/` (already present)
- `.env*.local` — local environment overrides
- Keep existing entries that are still relevant

### 3. Configure Vitest for testing

Per `docs/design.md` §8, the project uses **Vitest** as the testing framework with co-located test files (`*.test.ts` pattern).

Install Vitest and related dependencies:

```bash
npm install --save-dev vitest @vitejs/plugin-react
```

Create `vitest.config.ts` at the project root:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Add a `"test"` script to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

This ensures the TDD workflow required by AGENTS.md is available from the first task onward.

### 4. Initialize shadcn/ui

Run `npx shadcn@latest init` to integrate shadcn/ui. The init process will:

- Detect the existing Tailwind CSS v4 setup
- Create `src/lib/utils.ts` with the `cn()` helper (combining `clsx` and `tailwind-merge`)
- Create `components.json` configuration file
- Set up CSS variables in `src/app/globals.css`

Configuration choices for the init:

- **Style**: "default" (clean, minimal — lets the custom theme shine)
- **Base color**: "slate" (will be overridden with custom Ocean Teal tokens)
- **CSS variables**: yes
- **Import alias for components**: `@/components`
- **Import alias for utils**: `@/lib/utils`

After init, the generated `components.json` should reference `src/` paths and the `@/*` alias so future `npx shadcn@latest add <component>` commands place files correctly.

### 5. Establish theme tokens with CSS custom properties

The core design decision is converting the repository-wide visual guidance into a stable token system expressed as CSS custom properties in `src/app/globals.css`. Tailwind CSS v4 and shadcn/ui both consume CSS variables natively, making this the natural integration point.

#### Token definitions

The following semantic tokens must be defined in the `:root` scope (light theme). Values use the HSL format consistent with shadcn/ui conventions:

| Token | HSL Value | Purpose |
|---|---|---|
| `--background` | `0 0% 100%` | App background — pure white |
| `--foreground` | `210 11% 15%` | Default text — very dark slate |
| `--card` | `0 0% 100%` | Card surface — white |
| `--card-foreground` | `210 11% 15%` | Card text |
| `--popover` | `0 0% 100%` | Popover surface |
| `--popover-foreground` | `210 11% 15%` | Popover text |
| `--primary` | `174 62% 33%` | **Ocean Teal** — the sole brand color |
| `--primary-foreground` | `0 0% 100%` | Text on primary — white |
| `--secondary` | `210 20% 96%` | Subtle surface — pale gray-blue |
| `--secondary-foreground` | `210 11% 25%` | Text on secondary |
| `--muted` | `210 20% 96%` | Muted surface — matches secondary |
| `--muted-foreground` | `210 11% 45%` | Muted text — medium gray |
| `--accent` | `174 40% 93%` | Light teal tint for hover/highlight |
| `--accent-foreground` | `174 62% 20%` | Text on accent |
| `--destructive` | `0 72% 51%` | Error/destructive actions |
| `--destructive-foreground` | `0 0% 100%` | Text on destructive |
| `--border` | `214 20% 91%` | Borders — faint, low-contrast |
| `--input` | `214 20% 91%` | Input borders |
| `--ring` | `174 62% 33%` | Focus ring — Ocean Teal |
| `--radius` | `1rem` | Base radius (16px, supports rounded-2xl usage) |

The `--primary` value of `174 62% 33%` produces an Ocean Teal approximately `#209090` — a deep, saturated teal that provides good contrast on white backgrounds and reads clearly as the brand color. The `--accent` uses a desaturated, very light tint of the same hue for hover states and subtle highlights.

#### Design rationale

- **Single primary color**: Ocean Teal is the only saturated brand color, preventing visual competition
- **Neutral secondary/muted**: Pale slate tones keep surfaces airy without introducing competing hues
- **Accent derived from primary**: A light teal tint (not a different color) ensures visual cohesion
- **High-contrast foreground**: Near-black text on white backgrounds for readability
- **Faint borders**: Low-contrast border color supports the soft, floating aesthetic
- **Focus ring = primary**: Keeps interactive feedback consistent with the brand

### 6. Encode the "Light & Airy Vacation Style" in component defaults

The design system should intentionally bias toward a bright, spacious interface:

#### Background and surfaces

- App background: pure white (`--background`)
- Alternating section surfaces: pale gray (`--secondary`)
- Cards/popovers: white with soft shadows

#### Shape language

- Base radius token (`--radius: 1rem`) supports `rounded-2xl` (1rem = 16px) as the common card/button form
- `rounded-3xl` (1.5rem) reserved for hero cards, image panels, and prominent containers
- Avoid sharp corners in foundational components

#### Depth and shadows

- Default cards and panels: `shadow-sm` (soft, subtle elevation)
- Hover states: deepen to `shadow-md` or `shadow-lg` for floating effect
- Borders: faint and low-contrast when needed — prefer shadow-based separation

#### Glassmorphism preparation

Per design.md, the top navigation bar and floating labels will use `backdrop-blur-md` with semi-transparent backgrounds. The theme tokens support this pattern, but specific glassmorphism components are deferred to later tasks.

### 7. Tailwind CSS v4 theme integration

Tailwind CSS v4 uses a CSS-first configuration approach via the `@theme` directive in CSS files, replacing the traditional `tailwind.config.ts` file. The shadcn/ui init process will set up the base integration, but the theme should be extended to include:

- Semantic color mappings from the CSS custom properties (e.g., `--color-background`, `--color-primary`)
- Shared radius token(s) exposed as Tailwind utilities
- Soft shadow presets for the airy visual language

After configuration, the following utility classes should work correctly:
- `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`
- `bg-card`, `bg-secondary`, `bg-accent`, `bg-muted`
- `border-border`, `ring-ring`
- `rounded-2xl`, `rounded-3xl` (Tailwind built-ins aligned with `--radius`)
- `shadow-sm`, `shadow-md`, `shadow-lg` (default Tailwind shadows are sufficient)

### 8. Global typography and page shell

The scaffold should include a minimal global baseline:

- **Font**: Geist Sans (the Next.js 15 default via `next/font/local` or `next/font/google`). The create-next-app template ships with Geist configured, which aligns with design.md's "Inter/Geist is sufficient" guidance
- **Document defaults**: Background and foreground colors applied to `<body>` from theme tokens
- **Text rendering**: Antialiasing enabled (`antialiased` class on body)
- **Root layout**: A clean `src/app/layout.tsx` that applies the font, background, and foreground, ready for future route segments to nest into

The root `page.tsx` should show a minimal placeholder confirming the theme is active (e.g., displaying the project name with primary-colored text on the white background). This page will be replaced by later tasks.

### 9. Prepare environment file pattern

Create a `.env.example` file at the project root documenting expected environment variables. For Task 1, this is minimal:

```
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Later tasks (database, auth) will add their own variables. The `.env.example` file serves as documentation; actual secrets go in `.env.local` (which is gitignored by Next.js defaults).

### 10. Directory structure after Task 1

```
travel-website/                          (project root)
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css                  # Tailwind v4 directives + CSS theme variables
│   │   ├── layout.tsx                   # Root layout with font + theme applied
│   │   └── page.tsx                     # Minimal placeholder page
│   ├── components/
│   │   └── ui/                          # shadcn/ui generated components (empty for now)
│   └── lib/
│       └── utils.ts                     # cn() helper from shadcn/ui init
├── .env.example                         # Environment variable documentation
├── .gitignore                           # Updated with Next.js patterns
├── components.json                      # shadcn/ui configuration
├── next.config.ts                       # Next.js configuration
├── package.json                         # Dependencies and scripts
├── package-lock.json                    # Lockfile (must be committed)
├── tsconfig.json                        # TypeScript configuration (strict)
├── vitest.config.ts                     # Vitest testing configuration
├── docs/                                # Existing documentation (unchanged)
├── AGENTS.md                            # Existing (unchanged)
└── README.md                            # Existing (unchanged)
```

## Implementation Plan

### Step 1: Initialize Next.js 15 scaffold

Run `npx create-next-app@15` with the flags specified in §1. This creates the core project structure, installs Next.js 15, React 19, and Tailwind CSS v4.

Verify: `npm run build` succeeds, `npm run dev` starts the dev server.

### Step 2: Update .gitignore

Merge Next.js patterns (`.next/`, `out/`, `.env*.local`) into the existing `.gitignore`. Remove Python-specific entries that are no longer relevant but keep entries that don't conflict.

### Step 3: Enforce strict TypeScript

Confirm `tsconfig.json` has `"strict": true`. If the template didn't set it, add it. Verify `npm run build` still succeeds under strict mode.

### Step 4: Install and configure Vitest

Install `vitest` and `@vitejs/plugin-react` as dev dependencies. Create `vitest.config.ts` with the `@` alias and co-located test file pattern. Add `test` and `test:watch` scripts to `package.json`.

Verify: `npm test` runs without errors (0 tests found is acceptable at this stage).

### Step 5: Initialize shadcn/ui

Run `npx shadcn@latest init` with the configuration choices from §4. This creates `components.json`, `src/lib/utils.ts`, and updates `src/app/globals.css` with CSS variable definitions.

Verify: `components.json` exists, `src/lib/utils.ts` exports `cn()`, and `npm run build` succeeds.

### Step 6: Customize theme tokens

Replace the default shadcn/ui CSS variable values in `src/app/globals.css` with the Ocean Teal-based tokens defined in §5. Ensure the Tailwind v4 `@theme` block maps semantic colors correctly.

Verify: The dev server renders with Ocean Teal as the primary color, white backgrounds, and the correct font.

### Step 7: Configure root layout and placeholder page

Update `src/app/layout.tsx` to apply the Geist font, antialiasing, and theme background/foreground to the body. Update `src/app/page.tsx` with a minimal placeholder that demonstrates the theme is working (e.g., project name in primary color, a brief message on a white background).

Verify: `npm run dev` shows the themed placeholder page at localhost:3000.

### Step 8: Create .env.example

Add `.env.example` with the minimal documented variables for Task 1.

### Step 9: Write a scaffold smoke test

Create a minimal test file (e.g., `src/lib/utils.test.ts`) that verifies the `cn()` utility works correctly. This confirms:
- Vitest is properly configured
- The `@` import alias resolves
- The TDD workflow is functional

Verify: `npm test` passes with at least one test.

### Step 10: Final validation

Run full validation to ensure the scaffold is stable:
- `npm run build` — production build succeeds
- `npm run lint` — no lint errors
- `npm test` — all tests pass

## Acceptance Criteria

1. **Next.js 15**: `package.json` shows `next` version in the 15.x range
2. **TypeScript strict**: `tsconfig.json` contains `"strict": true`
3. **Tailwind CSS v4**: Tailwind directives present in `globals.css`, utility classes functional
4. **shadcn/ui**: `components.json` exists, `cn()` helper available at `@/lib/utils`
5. **Ocean Teal theme**: `--primary` CSS variable set to Ocean Teal HSL value; page renders with correct brand color
6. **Light backgrounds**: `--background` set to white; page has airy, bright appearance
7. **Large radii**: `--radius` set to `1rem`
8. **Vitest**: `npm test` executes successfully with at least one passing test
9. **Build passes**: `npm run build` completes without errors
10. **Lint passes**: `npm run lint` completes without errors
11. **Import alias**: `@/*` resolves to `src/*` in both application code and tests
12. **File structure**: `src/app/`, `src/components/ui/`, and `src/lib/` directories exist
