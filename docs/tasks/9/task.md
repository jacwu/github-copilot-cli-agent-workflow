# Task 1: Initialize Project Scaffold and Global UI Style Configuration

## Background

This task establishes the frontend foundation for the travel website described in `docs/requirements.md` and `docs/design.md`. The product uses Next.js 15 with the App Router, TypeScript, Tailwind CSS, and shadcn/ui, while presenting a consistent "Light & Airy Vacation Style" centered on Ocean Teal, light layered backgrounds, oversized radii, and soft elevation.

Because this is the first development task in `docs/tasks.md`, decisions made here shape every subsequent page, component, and interaction. A well-defined scaffold and theme system are necessary so later destination, authentication, trip, and about-page work can reuse shared primitives instead of reinventing styling locally.

## Goal

Initialize the application scaffold and global UI styling system so the repository supports:

- a strict TypeScript Next.js 15 App Router project structure
- Tailwind CSS configured as the primary styling mechanism
- shadcn/ui integrated as the component primitive layer
- global design tokens implementing the "Light & Airy Vacation Style"
- Vitest configured as the unit testing framework
- shared utility and alias conventions that future tasks can build on safely

## Non-Goals

This task does not design or implement feature-complete product flows. In particular, it does not include:

- authentication logic, routes, or forms beyond placeholder scaffold decisions
- destination listing/detail business UI beyond what is needed to confirm global theme wiring
- database, ORM, API, or seed-data implementation
- final marketing copy, imagery, or production-ready page content
- advanced theming modes such as dark mode or multi-brand palettes

## Current State

The repository currently contains project documentation (`docs/`), CI/CD workflows (`.github/`), automation scripts (`scripts/`), and project metadata (`AGENTS.md`, `PLAN.md`, `README.md`). There is no committed Next.js application scaffold, frontend source tree, or frontend configuration files such as `package.json`, `tsconfig.json`, `next.config.*`, or `components.json`.

The existing `.gitignore` includes `node_modules/` but lacks Next.js-specific entries (`.next/`, `out/`, etc.).

This task is a greenfield application bootstrap. The design defines the expected folder layout, package choices, baseline configuration, testing setup, and the minimum shared app shell required for later tasks.

## Proposed Design

### 1. Bootstrap the application with Next.js 15, TypeScript, and Tailwind CSS

Initialize a new npm-managed Next.js 15 project using the App Router and a `src/` directory layout. TypeScript strict mode must be enabled per AGENTS.md coding standards.

**Important — Tailwind CSS version**: `create-next-app` with Next.js 15 may scaffold Tailwind CSS v4, which uses a CSS-based configuration model (`@import "tailwindcss"` with `@theme` directives) instead of the v3 JavaScript-based `tailwind.config.ts`. The implementation must work with whichever version `create-next-app` provides. Key differences to be aware of:

- **Tailwind v4**: no `tailwind.config.ts`; theme is configured via `@theme` blocks in CSS; PostCSS uses `@tailwindcss/postcss`
- **Tailwind v3**: uses `tailwind.config.ts` and `postcss.config.mjs` with the `tailwindcss` plugin

shadcn/ui detects the Tailwind version during `npx shadcn@latest init` and configures itself accordingly.

The scaffold should include:

- `src/app/` for route segments and root layout
- `src/components/` for app components
- `src/components/ui/` for shadcn/ui-generated primitives
- `src/lib/` for shared utilities such as `cn`
- `public/` for static assets

A `src/` layout is required because `docs/design.md` already models the app under `src/app`, `src/components`, `src/db`, and `src/lib`.

### 2. Standardize package and configuration choices

Use npm exclusively. The scaffold should produce at least:

- `package.json` and `package-lock.json`
- `tsconfig.json` with `strict: true` and `@/*` path alias pointing to `src/*`
- `next.config.ts` (TypeScript config preferred per coding standards)
- Tailwind/PostCSS configuration appropriate for the installed version
- `components.json` for shadcn/ui
- `vitest.config.ts` for the test framework

Configuration constraints:

- `@/` path alias rooted at `src/`
- TypeScript strict mode enabled
- App Router (not Pages Router)
- ESLint: accept the default configuration provided by `create-next-app`; no custom rules needed for this task
- No custom theming framework beyond Tailwind CSS and shadcn/ui

**`.gitignore` update**: append Next.js-specific entries to the existing `.gitignore`:

```
# Next.js
.next/
out/
next-env.d.ts
```

### 3. Integrate shadcn/ui as the shared component primitive layer

Install and initialize shadcn/ui early so all future UI work builds from a consistent base.

Run `npx shadcn@latest init` with these settings:

- Style: **Default** (not "New York")
- CSS variables: **enabled** (required for the token-based theming approach)
- Tailwind CSS version: auto-detected
- Base color: override with Ocean Teal after initialization
- `@/` import alias: use `@/components`, `@/lib`, etc.

This generates `components.json`, `src/lib/utils.ts` (with the `cn` class-merging helper), and CSS variable scaffolding in `globals.css`.

Add a minimal starter set of UI primitives:

- `button` — needed across nearly all future pages
- `card` — destination cards, trip cards
- `input` — search bars, forms

Additional components (`badge`, `separator`, `dialog`, etc.) should be added by future tasks as needed. The configuration must be complete enough that `npx shadcn@latest add <component>` works without revisiting global setup.

### 4. Implement the global visual system with CSS variables

Express the "Light & Airy Vacation Style" as CSS custom properties in the global stylesheet, wired into Tailwind/shadcn usage.

#### Concrete color reference values

"Ocean Teal" maps to the Tailwind `teal` scale. The primary reference point is **teal-600** (`#0D9488`, approximately HSL 175 84% 32%). The full scale for reference:

| Token role | Target shade | Hex | Approximate HSL |
|---|---|---|---|
| Primary (buttons, links, key actions) | teal-600 | #0D9488 | 175 84% 32% |
| Primary hover | teal-700 | #0F766E | 175 77% 26% |
| Primary foreground (text on primary) | white | #FFFFFF | 0 0% 100% |
| Primary light tint (badges, highlights) | teal-50 | #F0FDFA | 166 76% 97% |
| Ring / focus | teal-400 | #2DD4BF | 170 72% 50% |

These values are reference targets. The exact CSS variable format (HSL, OKLCH, or raw hex) depends on the shadcn/ui version installed. The implementation should override shadcn/ui's generated defaults to match these targets.

#### Required theme tokens

The global theme must define CSS custom properties for at least:

- `--background` / `--foreground` — page-level defaults
- `--card` / `--card-foreground` — card surfaces
- `--primary` / `--primary-foreground` — Ocean Teal action color
- `--secondary` / `--secondary-foreground` — kept neutral (sandy beige or light gray)
- `--muted` / `--muted-foreground` — subdued text and surfaces
- `--accent` / `--accent-foreground` — hover highlights, kept close to primary or neutral
- `--border` / `--input` / `--ring` — soft, low-contrast values
- `--radius` — set to a value that biases toward `rounded-2xl` feel (at least `1rem`)
- `--destructive` / `--destructive-foreground` — standard error/delete color (red)

Palette rules:

- Ocean Teal is the **only** primary/action color
- Neutral backgrounds stay close to white, `slate-50`, or `gray-50`
- Supporting neutrals are soft and low-contrast
- `--secondary` should use a warm neutral (sandy beige per `docs/design.md`) rather than a competing accent
- Unused shadcn token slots should stay neutral

### 5. Encode the "Light & Airy Vacation Style" into default UI conventions

#### Border radius

- Cards, panels, dialogs, and major containers: `rounded-2xl` (16px)
- Hero surfaces and standout sections: `rounded-3xl` (24px)
- Small controls (buttons, inputs): inherit shadcn defaults with the global `--radius` token biasing larger
- The `--radius` CSS variable should be set to at least `1rem` so shadcn components automatically use larger radii

#### Shadows and borders

- Cards and floating surfaces: subtle shadows at rest (`shadow-sm` or equivalent)
- Hover states: modest elevation increase (`shadow-md` to `shadow-lg`)
- Borders: low-contrast, secondary to shadow-based separation
- Future glassmorphism (per `docs/design.md`): navbar and floating labels will use `backdrop-blur-md` — the scaffold should not introduce conflicting styles

#### Spacing and layout feel

- Generous section spacing (e.g., `py-12` to `py-16` between sections)
- Constrained content widths for readability (`max-w-7xl` centered)
- Light background layering rather than dense boxed layouts
- Typography: use the default Next.js font (Inter or Geist Sans) — both are modern sans-serif fonts that align with `docs/design.md`

### 6. Establish the root app shell and baseline global stylesheet

Create the minimum app-shell work needed to prove the styling system is wired correctly:

- `src/app/layout.tsx` — root layout with global font setup, `<html lang="en">`, and body classes applying `bg-background text-foreground` plus the `antialiased` font smoothing class
- `src/app/globals.css` — Tailwind imports (v3 `@tailwind` directives or v4 `@import "tailwindcss"`) followed by CSS variable definitions in `:root`
- `src/app/page.tsx` — minimal placeholder page that renders at least one themed heading and one shadcn/ui `Button` component to visually verify the theme

The initial root page does not need real product functionality. Its purpose is to verify that:

- the project builds without errors
- global styles load correctly
- typography, spacing, radii, and shadows render as intended
- shadcn/ui primitives inherit the global token system

### 7. Set up Vitest as the testing framework

`docs/design.md` mandates Vitest as the exclusive test framework. AGENTS.md requires TDD for all implementation tasks. This scaffold must include a working Vitest configuration so future tasks can write tests immediately.

Install as dev dependencies:

- `vitest`
- `@vitejs/plugin-react` (for JSX transform in tests if needed)
- `@testing-library/react` and `@testing-library/jest-dom` (for component testing in later tasks)

Create `vitest.config.ts` at the project root:

- Configure the `@/` path alias to match `tsconfig.json`
- Set the test environment to `jsdom` for future component tests
- Include `src/**/*.test.ts` and `src/**/*.test.tsx` as the test file pattern
- Co-locate test files with source files per `docs/design.md` convention (`*.test.ts` naming)

Write a minimal smoke test for the `cn()` utility function in `src/lib/utils.test.ts` to confirm the test pipeline works end-to-end.

Add a `"test"` script to `package.json` (e.g., `"test": "vitest run"`).

### 8. Recommended file-level layout

The following file layout is the target baseline for this task:

```text
.
├── package.json
├── package-lock.json
├── components.json
├── next.config.ts
├── postcss.config.mjs          # content depends on Tailwind version
├── tailwind.config.ts           # only if Tailwind v3; absent in v4
├── tsconfig.json
├── vitest.config.ts
├── public/
└── src/
    ├── app/
    │   ├── globals.css          # Tailwind imports + CSS variable tokens
    │   ├── layout.tsx           # root layout with font + body classes
    │   └── page.tsx             # minimal placeholder verifying theme
    ├── components/
    │   └── ui/
    │       ├── button.tsx       # shadcn/ui Button
    │       ├── card.tsx         # shadcn/ui Card
    │       └── input.tsx        # shadcn/ui Input
    └── lib/
        ├── utils.ts             # cn() helper
        └── utils.test.ts        # smoke test for cn()
```

File naming follows AGENTS.md conventions: Next.js convention files (`page.tsx`, `layout.tsx`) keep framework defaults; shadcn/ui generated files keep their default names; utility modules use `kebab-case.ts`.

### 9. Styling token strategy

Prefer semantic tokens over raw Tailwind color utilities:

- Define core colors as CSS variables in `globals.css`
- Map shadcn/ui and Tailwind usage to those variables
- Consume semantic utility classes: `bg-background`, `text-foreground`, `bg-primary`, `text-primary-foreground`, `text-muted-foreground`, etc.
- Reserve one-off raw color utilities (`text-teal-600`, `bg-slate-50`) for rare exceptions only

This approach keeps the theme maintainable and allows future visual refinements without mass component edits.

### 10. Risks and mitigation

#### Risk: Tailwind v4 configuration model differs from v3

The task.md and implementation must handle both models. `create-next-app` and `shadcn init` handle version detection automatically. The implementation should not hard-code assumptions about which config files exist. Mitigation: follow generator output, then override theme tokens in `globals.css` regardless of Tailwind version.

#### Risk: default shadcn/ui theme feels too neutral or generic

Mitigation: override the generated CSS variable defaults with the Ocean Teal palette immediately after initialization, especially `--primary`, `--radius`, and surface contrast values. Do not accept shadcn defaults for these tokens.

#### Risk: later tasks introduce inconsistent spacing and radius choices

Mitigation: set `--radius` to a large value (≥ `1rem`) so shadcn components default to larger corners. Establish semantic patterns in the root page that later tasks can reference.

#### Risk: `.gitignore` missing Next.js entries causes accidental commits

Mitigation: update `.gitignore` early in the implementation to include `.next/`, `out/`, and `next-env.d.ts` before the first build generates those artifacts.

#### Risk: Vitest and Next.js module resolution conflict

Mitigation: configure `vitest.config.ts` with the same `@/` path alias used in `tsconfig.json`. Use `@vitejs/plugin-react` only if JSX tests are needed. Keep the initial test simple (pure function) to validate the pipeline without requiring full React rendering.

## Implementation Plan

1. **Update `.gitignore`**: append Next.js-specific entries (`.next/`, `out/`, `next-env.d.ts`) to the existing file before any scaffold work.

2. **Initialize Next.js 15 project**: run `create-next-app` with TypeScript, Tailwind CSS, App Router, and `src/` directory layout using npm. Accept ESLint defaults. Generate `package.json`, `tsconfig.json`, `next.config.ts`, and Tailwind/PostCSS config files.

3. **Verify TypeScript strict mode and path aliases**: confirm `tsconfig.json` has `"strict": true` and `"@/*"` mapped to `"./src/*"`. Adjust if the generator produced different defaults.

4. **Initialize shadcn/ui**: run `npx shadcn@latest init` with CSS variables enabled and the default style. Then add the `button`, `card`, and `input` components. This generates `components.json`, `src/lib/utils.ts`, and `src/components/ui/*.tsx` files.

5. **Override global CSS variables**: edit `src/app/globals.css` to replace the default shadcn color palette with Ocean Teal primary values, light neutral backgrounds, warm neutral secondary, soft borders, and a large `--radius` (≥ `1rem`). Ensure the token set covers all required slots (background, foreground, card, primary, secondary, muted, accent, border, input, ring, radius, destructive).

6. **Wire the root app shell**: configure `src/app/layout.tsx` with the global font, `bg-background text-foreground antialiased` body classes, and proper `<html>` attributes. Create a minimal `src/app/page.tsx` that renders themed content (heading + Button) to visually verify the theme.

7. **Set up Vitest**: install `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, and `@testing-library/jest-dom` as dev dependencies. Create `vitest.config.ts` with `jsdom` environment and `@/` path alias. Add `"test": "vitest run"` to `package.json`.

8. **Write smoke test**: create `src/lib/utils.test.ts` with a basic test for the `cn()` utility function to confirm the test pipeline works.

9. **Validate**: run `npm run build` to confirm the scaffold compiles, and `npm test` to confirm the test pipeline passes. Fix any issues.

10. **Leave subsequent tasks** to build on this foundation for database setup, authentication, destination browsing, trips, and about-page content.
