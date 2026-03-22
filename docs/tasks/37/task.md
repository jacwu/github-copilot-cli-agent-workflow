# Task 1: Initialize Project Scaffold and Global UI Style Configuration

## Background

Task 1 establishes the frontend foundation for the travel website described in `docs/requirements.md` and `docs/design.md`. The product will be built as a full-stack Next.js 15 application using the App Router, TypeScript, Tailwind CSS, and shadcn/ui, with all application code living under `travel-website/`.

The repository-level design also defines a "Light & Airy Vacation Style" as the global visual direction. That style emphasizes Ocean Teal as the single primary brand color, light neutral backgrounds, generous whitespace, large border radii, and soft shadows so destination imagery and future feature surfaces feel spacious and approachable. The design also calls for glassmorphism effects (frosted glass via `backdrop-blur-md`) on navigation and floating labels in later tasks, so the baseline setup must not strip these utilities.

Because subsequent tasks depend on a stable application shell, consistent design tokens, and a working test runner, this issue must define the initial scaffold, the global styling contract, and the testing infrastructure rather than only creating a bare framework app.

## Goal

Create the technical foundation for the `travel-website/` application so later tasks can build features on top of a consistent stack, visual system, and testing infrastructure.

This task should:

1. Initialize the Next.js + TypeScript + Tailwind CSS application structure.
2. Integrate shadcn/ui into that structure.
3. Define reusable global theme variables and baseline styles that implement the project's Light & Airy Vacation Style.
4. Configure Vitest as the unit testing framework (mandated by `docs/design.md` Section 8) so subsequent tasks can follow TDD from the start.

## Non-Goals

- Implement authentication, database, API routes, or seed data.
- Build destination, trip, or about page feature experiences beyond minimal placeholder shell needs.
- Finalize brand copy, imagery, or page-specific layouts.
- Introduce alternate visual themes or multiple primary colors.
- Create a full component library beyond the minimum shadcn/ui setup needed to support future tasks.
- Implement the glassmorphism navigation bar or any feature-specific components (those belong to later tasks).

## Current State

At the time of design, the repository contains the product-level planning documents and automation workflow files, but the `travel-website/` directory is not yet scaffolded as a Next.js application. It currently contains only a placeholder `AGENTS.md`, so there is no app router structure, package manifest, Tailwind configuration, global stylesheet, or shadcn/ui configuration in place.

This means Task 1 is responsible for the first real application bootstrap under `travel-website/`, and must define the project conventions, the baseline theme primitives, and the testing infrastructure that later tasks will reuse.

## Proposed Design

### 1. Application Initialization Scope

Initialize a Next.js 15 App Router project under `travel-website/` using npm, with TypeScript enabled in strict mode and the default React/Next.js build pipeline.

The generated scaffold should be aligned with the repository-level architecture in `docs/design.md`, including:

- App Router entry points under `travel-website/src/app/`
- Shared reusable components under `travel-website/src/components/`
- Shared helpers under `travel-website/src/lib/`
- Static assets under `travel-website/public/`

The initial scaffold should include the minimum files needed for a functioning app shell:

- `package.json` — project manifest with npm as the package manager
- `tsconfig.json` — TypeScript strict mode, with a `@/` path alias mapping to `src/`
- `next.config.ts` — Next.js configuration (TypeScript-based, the default for Next.js 15)
- `postcss.config.mjs` — PostCSS configuration for Tailwind CSS
- `src/app/globals.css` — global stylesheet with theme tokens
- `src/app/layout.tsx` — root layout with font and metadata
- `src/app/page.tsx` — minimal starter page
- `src/lib/utils.ts` — shared utility helper (`cn()` function)

ESLint should remain in its default Next.js configuration, providing baseline linting without custom overrides at this stage.

### 2. Tailwind CSS Baseline

Tailwind CSS v4 should be configured as the primary styling system for the application. The baseline configuration should support:

- App Router source paths under `src/`
- Utility-driven styling for layout, spacing, typography, radii, color, and elevation
- Design-token-driven usage through CSS custom properties, especially for semantic colors consumed by shadcn/ui
- Backdrop-blur and opacity utilities required for future glassmorphism effects (`backdrop-blur-md`, `bg-white/80`, etc.)

Tailwind should remain close to standard ecosystem conventions so future tasks can use common utility patterns without custom complexity. Where possible, project-specific theming should be expressed through CSS variables and Tailwind utility usage rather than an oversized custom Tailwind theme.

### 3. shadcn/ui Integration

Integrate shadcn/ui as the base UI component system for future feature work.

The setup should include:

- `components.json` — shadcn/ui configuration metadata specifying the "default" style, the component output path (`src/components/ui`), and the `@/` import alias
- `src/lib/utils.ts` — a shared `cn()` utility using `clsx` and `tailwind-merge` for conditional class name merging (the standard shadcn/ui pattern)
- Theme variables in the global stylesheet that satisfy shadcn/ui's semantic token expectations (see Section 4)
- The `@/` path alias in `tsconfig.json` mapping to `src/` so future generated components resolve correctly under `src/components/ui/`

This task does not need to generate a large set of UI components. However, the configuration must be complete enough that running `npx shadcn@latest add <component>` in later tasks works without reworking the project foundation.

### 4. Global Style Token Contract

Define the site's global design language through CSS custom properties in `src/app/globals.css`.

#### 4.1 Primary Color Strategy

Ocean Teal must be the only primary accent color used for interactive emphasis. A reference starting point for Ocean Teal is approximately `hsl(174, 62%, 47%)` / `#2DB5A0` — a medium-saturation teal that reads as calming and vacation-appropriate. The exact values should be tuned to satisfy WCAG AA contrast against white foregrounds and light backgrounds.

This token should drive:

- primary buttons and button states
- interactive highlights (active filters, links, focus-visible rings)
- selected or emphasized UI states
- key accents in future marketing and browsing surfaces

To preserve the repository-level style direction, the design should avoid introducing a competing accent palette. The `--primary` and `--primary-foreground` CSS variables must be set to Ocean Teal and its high-contrast companion (white). Supportive neutrals may be used for surfaces, borders, muted text, and shadows, but not as secondary action colors.

#### 4.2 Surface and Background Strategy

Global background styling should favor bright, low-contrast neutrals such as white and very light slate/gray values, consistent with the "Sandy beige and light gray-white" palette described in `docs/design.md`. These surfaces should create visual breathing room and make destination imagery feel prominent rather than boxed in.

Required semantic surface tiers (shadcn/ui CSS variables):

| Token | Purpose | Value direction |
|---|---|---|
| `--background` | App's primary canvas | Near white (e.g. `0 0% 100%`) |
| `--foreground` | Default text color | Dark slate/gray |
| `--card` | Elevated card surfaces | White or near white |
| `--card-foreground` | Card text | Dark slate/gray |
| `--popover` | Dropdown/popover surfaces | White |
| `--popover-foreground` | Popover text | Dark slate/gray |
| `--muted` | Subtle background sections | Very light neutral (sandy/slate) |
| `--muted-foreground` | De-emphasized text | Medium gray |
| `--border` | Border color | Soft low-contrast neutral |
| `--input` | Input borders | Soft low-contrast neutral |
| `--ring` | Focus ring color | Ocean Teal |
| `--accent` | Hover/active highlights | Very light teal tint |
| `--accent-foreground` | Text on accent surfaces | Dark slate |
| `--destructive` | Error/danger actions | Standard red |
| `--destructive-foreground` | Text on destructive surfaces | White |
| `--secondary` | Secondary surfaces | Very light neutral |
| `--secondary-foreground` | Text on secondary surfaces | Dark slate |

The `--muted` and `--secondary` tiers can incorporate warm sandy tones (e.g. very light beige) to reflect the vacation palette described in `docs/design.md`, while keeping contrast ratios accessible.

#### 4.3 Radius Strategy

Large radii are part of the project identity and should be codified in the base theme. The effective default component language should favor `rounded-2xl` and `rounded-3xl` over small, sharp corners.

This should be reflected by:

- setting a generous global `--radius` token (e.g. `0.75rem` or `1rem`) for shadcn/ui semantic usage, so generated components default to visibly rounded corners
- favoring large-radius styling (`rounded-2xl` / `rounded-3xl`) in starter shell surfaces such as containers, cards, and buttons
- avoiding inconsistent mixtures of tiny and oversized radii in the base layer

#### 4.4 Shadow Strategy

The application should prefer soft, airy elevation rather than hard borders, using Tailwind shadow utilities (`shadow-sm`, `shadow-md`, elevating to `shadow-xl` on hover) as described in `docs/design.md`.

The base style system should encourage:

- light default shadows for cards and floating surfaces
- slightly stronger hover elevation where appropriate
- restrained border usage paired with subtle shadows

If custom shadow values are introduced, they should remain soft and diffuse to match the vacation-oriented aesthetic.

### 5. Font Configuration

The root layout should configure the **Geist** font family (the Next.js 15 default via `next/font/google` or `geist` package) as the application's sans-serif typeface, consistent with the "modern sans-serif font" requirement in `docs/design.md`. The font should be applied to the `<body>` element via a CSS variable or class, and referenced in the global stylesheet as the base `font-family`.

### 6. Base Application Shell Styling

The initial root layout and starter page should demonstrate the global theme contract at a minimal level so future contributors can immediately see and reuse the intended visual language.

The starter shell should therefore incorporate:

- a light app background using the `--background` token
- readable default typography using the Geist font stack
- a centered content container with ample spacing
- at least one representative surface using large radii (`rounded-2xl` or `rounded-3xl`) and soft shadow treatment
- primary action styling (e.g. a styled element) that clearly reflects the Ocean Teal `--primary` token
- semantic class usage via `cn()` to demonstrate the intended styling pattern

This is not intended to be a complete homepage design. Its purpose is to verify that the scaffold, Tailwind, shadcn/ui tokens, and global style direction are wired together correctly.

### 7. Testing Infrastructure

Configure **Vitest** as the unit testing framework, as mandated by `docs/design.md` Section 8. The setup should include:

- `vitest` and `@vitejs/plugin-react` as dev dependencies
- A `vitest.config.ts` configuration file at the `travel-website/` root with path alias resolution matching `tsconfig.json` (i.e. `@/` → `src/`)
- A `"test"` script in `package.json` that runs `vitest run`
- A minimal smoke test (e.g. in `src/lib/utils.test.ts`) that verifies the `cn()` utility works correctly, confirming the test runner is operational

Test files should be co-located with source files in the same directory and follow the `*.test.ts` naming pattern, as specified in `docs/design.md` Section 8.

### 8. Accessibility and Maintainability Requirements

The global style system should be defined in a way that remains accessible and maintainable for later tasks.

Key expectations:

- Primary foreground/background combinations must preserve WCAG AA legible contrast (at minimum 4.5:1 for normal text).
- Focus-visible states should inherit the Ocean Teal accent via the `--ring` token rather than default browser-inconsistent colors.
- Theme tokens should be semantic (`--primary`, `--background`, `--muted`, etc.) instead of hard-coding raw colors throughout starter components.
- The scaffold should preserve strict TypeScript (`"strict": true`) and standard Next.js conventions so later tasks can extend it safely.
- The `@/` path alias must be consistently configured in both `tsconfig.json` and `vitest.config.ts` to avoid import resolution divergence.

### 9. Expected File-Level Outcomes

This task is expected to produce the following files under `travel-website/`:

| Category | Files |
|---|---|
| Project bootstrap | `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs` |
| Styling | `src/app/globals.css` (with full shadcn/ui token set) |
| App shell | `src/app/layout.tsx`, `src/app/page.tsx` |
| shadcn/ui support | `components.json`, `src/lib/utils.ts` (`cn()` helper) |
| Testing | `vitest.config.ts`, `src/lib/utils.test.ts` |
| Linting | `.eslintrc.json` or `eslint.config.mjs` (Next.js default) |
| Directories | `src/components/ui/` (empty, ready for future component generation), `public/` |

Exact generated filenames may vary slightly depending on the toolchain versions used, but the implementation should stay faithful to the project structure defined in `docs/design.md`.

## Implementation Plan

1. **Bootstrap the application** in `travel-website/` with Next.js 15, App Router, npm, TypeScript strict mode, Tailwind CSS, and ESLint. Configure the `@/` path alias to map to `src/` in `tsconfig.json`.
2. **Initialize shadcn/ui** with the `components.json` configuration, `cn()` utility in `src/lib/utils.ts` (using `clsx` + `tailwind-merge`), and path aliases aligned to the `src/` project structure.
3. **Define the global theme tokens** in `src/app/globals.css`, populating all shadcn/ui semantic CSS variables with values that encode the Light & Airy Vacation Style — Ocean Teal as `--primary`, light neutrals/sandy tones for surfaces, a generous `--radius` value, and the full token table from Section 4.2.
4. **Configure the Geist font** in the root layout and wire it into the global stylesheet as the base typeface.
5. **Style the starter shell** — apply the base theme in the root layout and a minimal starter page so the scaffold visibly exercises the configured tokens, large radii, light surfaces, soft shadows, and the `cn()` utility.
6. **Set up Vitest** — install dev dependencies, create `vitest.config.ts` with path alias resolution, add the `"test"` script to `package.json`, and write a smoke test for `cn()` in `src/lib/utils.test.ts`.
7. **Verify the scaffold** — confirm `npm run build` succeeds, `npm run test` passes, and `npm run lint` reports no errors, ensuring the foundation is ready for follow-on tasks without additional rework.
