# Task 1 Technical Design: Initialize Project Scaffold and Global UI Style Configuration

## Background

Issue #18 is the first implementation-oriented task for the travel website. The repository-level requirements define a full-stack travel product built on Next.js, TypeScript, Tailwind CSS, and shadcn/ui, while the technical design document establishes a "Light & Airy Vacation Style" centered on Ocean Teal, light backgrounds, large rounded corners, and soft shadows.

At the moment, the repository contains workflow and product documentation but no application scaffold, frontend source tree, package manifest, or styling configuration. This task therefore needs to establish the baseline application structure and shared design tokens that later tasks will build on for destination browsing, authentication, trip planning, and the about page.

## Goal

Create the initial application foundation for the travel website by defining how the project will be scaffolded with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui, and by specifying a reusable global style system that encodes the product's visual language.

The outcome of this task should make later feature work start from a consistent baseline instead of reintroducing style or setup decisions on a per-page basis.

## Non-Goals

- Implementing any business features such as authentication, destination browsing, trip planning, or the about page.
- Completing database, ORM, or API route setup beyond what is necessary to keep the scaffold aligned with the intended architecture.
- Building finished product screens beyond a minimal starter route and layout shell needed to validate the scaffold.
- Finalizing brand illustration assets, production copy, or feature-specific UI components.
- Defining seed data or backend logic for later tasks.

## Current State

The repository currently includes:

- `docs/requirements.md` with the product user stories.
- `docs/design.md` with the target stack, project structure, and visual design direction.
- `docs/tasks.md` with the task checklist.
- GitHub Actions workflows and helper scripts for the staged AI agent workflow.

The repository does **not** currently include:

- `package.json` / `package-lock.json`
- `src/app` or `app` directory
- Tailwind CSS configuration files
- shadcn/ui configuration (`components.json`)
- Shared UI utilities such as `src/lib/utils.ts`
- Global CSS variables or design token definitions
- Any TypeScript, PostCSS, or Next.js configuration files

The available runtime environment provides **Node.js v24** and **npm 11**. These are recent versions; the implementation should verify that the chosen Next.js and tooling versions are compatible during the bootstrap step and pin known-good versions if necessary.

Because of the above gap, this task must be treated as a greenfield scaffold task rather than an incremental style tweak.

## Proposed Design

### 1. Application Scaffold

Initialize a Next.js 15 application using the App Router with TypeScript enabled and npm as the package manager. The source code should follow the repository-level design document and live under `src/`.

Planned baseline structure:

```text
src/
  app/
    favicon.ico
    globals.css
    layout.tsx
    page.tsx
  components/
    ui/
  lib/
    utils.ts
```

Key scaffold decisions:

- Use `src/app` instead of a root-level `app` directory to match the project structure defined in `docs/design.md`.
- Keep TypeScript strict mode enabled from the start (`"strict": true` in `tsconfig.json`).
- Use the default App Router conventions (`layout.tsx`, `page.tsx`) and Server Components by default.
- Set up import aliasing for `@/*` mapping to `src/*` so later tasks can import shared modules consistently.
- Include only the minimum starter route content required to confirm the app boots and the global styles are applied.
- The initial `next.config.ts` (TypeScript format, the Next.js 15 default) should be kept minimal with no custom overrides beyond what is needed for correctness.

### 2. Styling Foundation

The global styling system should encode the repo-wide visual guidance from `docs/design.md` into reusable Tailwind and CSS token defaults.

#### 2.1 Color strategy

Ocean Teal will be the single primary accent color. It should be mapped into the design-token layer so buttons, links, focus rings, selected states, and interactive emphasis all resolve to the same hue family.

The palette should prioritize:

- **Primary**: Ocean Teal — used for buttons, links, filter highlights, and key actions per `docs/design.md`.
- **Surface/background**: White and very light slate/gray tones (`bg-slate-50` / `bg-gray-50` range) to keep pages clean and airy, as specified in the design doc.
- **Foreground**: Dark slate text for readability.
- **Secondary/muted surfaces**: Sandy beige and pale warm neutral tones that support the airy feel without competing with the primary color. The design doc explicitly calls for "sandy beige and light gray-white for backgrounds and content sections".
- **Accent**: Should resolve to Ocean Teal or a closely related tint so accent-colored surfaces remain cohesive with the primary.
- **Destructive**: Keep shadcn defaults or a restrained alert red for accessibility and future form validation.

The design should use CSS custom properties in `globals.css` as the source of truth for semantic tokens. The following tokens must be defined (values in HSL format for shadcn/ui compatibility):

- `--background`, `--foreground`
- `--card`, `--card-foreground`
- `--popover`, `--popover-foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--muted`, `--muted-foreground`
- `--accent`, `--accent-foreground`
- `--destructive`, `--destructive-foreground`
- `--border`, `--input`, `--ring`
- `--radius`
- `--chart-1` through `--chart-5` (if required by the installed shadcn/ui version)

This keeps Tailwind utilities and shadcn/ui components aligned through semantic tokens instead of hard-coded hex values across the codebase.

**Concrete color guidance** (HSL approximations — implementation should tune for visual balance):

| Token | Light theme direction |
|---|---|
| `--primary` | Ocean Teal ≈ `175 70% 35%` (deep teal for interactive elements) |
| `--primary-foreground` | White or near-white for contrast on teal |
| `--background` | Pure white `0 0% 100%` |
| `--foreground` | Dark slate ≈ `220 15% 15%` |
| `--secondary` | Sandy beige ≈ `35 40% 92%` |
| `--secondary-foreground` | Dark neutral for legibility on beige |
| `--muted` | Light gray ≈ `210 15% 96%` |
| `--accent` | Lighter teal tint ≈ `175 55% 93%` |
| `--border` | Very light gray ≈ `220 10% 90%` |
| `--ring` | Ocean Teal matching `--primary` |
| `--radius` | `1rem` (16 px — large enough for a soft default) |

These are starting points. The implementer should confirm visual coherence by rendering the smoke-test page and adjust values until the overall feel matches "Light & Airy Vacation Style".

Only the light theme is required for this task. A dark theme is **not** in scope and should not be defined.

#### 2.2 Radius and elevation strategy

To match the required friendly, breathable aesthetic:

- Global default radius token (`--radius`) should be set to `1rem` so that base shadcn/ui components feel soft by default.
- Cards, dialogs, sheets, and form containers should use `rounded-2xl` (1 rem) as the standard baseline.
- Larger showcase surfaces (hero sections, image panels) may use `rounded-3xl` (1.5 rem).
- Borders should be visually de-emphasized in favor of subtle shadows.
- Shadow tokens should favor soft low-contrast elevation. The design doc specifies: `shadow-sm` at rest elevating to `shadow-xl` on hover. Custom Tailwind utilities should be added where the default shadow scale is insufficient:
  - A `shadow-card` utility for the standard soft card elevation.
  - A `shadow-card-hover` utility for the interactive hover lift effect.

#### 2.3 Typography and spacing

Use the Geist font family through `next/font/google` or the `geist` npm package, as expected by the design document ("Next.js default Inter/Geist is sufficient"). The global layout should establish:

- Comfortable line-height for body text (default Tailwind `leading-normal` or `leading-relaxed`).
- Spacious page padding — at least `px-4 sm:px-6 lg:px-8` responsive pattern.
- A max-width container pattern (`max-w-7xl mx-auto`) suitable for image-led content pages.
- Vertical section spacing of at least `py-12` to maintain the generous whitespace called for by the design doc.

These should be encoded through layout classes and reusable utility choices rather than ad hoc page-level styling.

#### 2.4 Glassmorphism preparation

The design doc calls for a "semi-transparent frosted glass effect (`backdrop-blur-md`)" on the top navigation bar and floating labels over images. While this task does not build the navbar, the global stylesheet should ensure the necessary Tailwind utilities (`backdrop-blur-md`, `bg-white/80` or similar) work out of the box. No custom CSS is needed — Tailwind includes these utilities natively — but the implementer should verify they are available in the configured Tailwind setup.

### 3. Tailwind CSS Configuration

Tailwind should be configured as the core utility system for the application, extended only where it supports the design language.

**Important version note**: `create-next-app` with Next.js 15 may install either Tailwind CSS v3 or v4 depending on the generator version. The configuration approach differs significantly:

- **Tailwind CSS v3** uses a `tailwind.config.ts` JavaScript/TypeScript file with `content`, `theme.extend`, and plugins. PostCSS config is managed via `postcss.config.mjs`.
- **Tailwind CSS v4** uses a CSS-first configuration approach with `@theme` and `@import` directives inside `globals.css`. There is no separate `tailwind.config.ts`.

The implementation should accept whichever version the generator installs and configure accordingly. The design requirements (semantic color tokens, radius tokens, custom shadows) can be expressed in either system.

Configuration responsibilities regardless of Tailwind version:

- Ensure Tailwind scanning covers `src/app`, `src/components`, and `src/lib` (explicit in v3 `content` array; automatic in v4).
- Wire semantic color utilities to CSS variables using the standard shadcn-compatible theme extension pattern.
- Expose radius tokens based on `--radius` for `lg`, `md`, and `sm`, while still permitting direct `rounded-2xl` and `rounded-3xl` utility usage where the design calls for it.
- Add project-specific box shadows (`shadow-card`, `shadow-card-hover`) to express the soft floating effect.

The design should avoid over-customizing Tailwind at this stage. The goal is a thin configuration layer that supports the established theme and stays easy to maintain.

### 4. shadcn/ui Integration

shadcn/ui should be initialized early because it will supply most reusable UI primitives for future tasks.

Integration design:

- Use `npx shadcn@latest init` to generate the configuration and utility wiring. When prompted, select options that align with: New York style (or default), `src/components/ui` output path, `src/lib/utils.ts` utility path, and CSS variables for colors.
- Configure output so generated components live in `src/components/ui`.
- Ensure the generated `cn()` utility helper resolves to `src/lib/utils.ts` and correctly merges Tailwind classes using `clsx` and `tailwind-merge`.
- Keep the chosen base style compatible with the light, airy visual direction; visual refinement should come primarily from the theme tokens rather than one-off component overrides.
- The resulting `components.json` should be committed so future `npx shadcn@latest add <component>` commands work without re-initialization.

No shadcn/ui components need to be generated in this task. A `Button` component may optionally be added as a quick integration smoke test, but it is not required. The important part is that the project is ready to add buttons, inputs, cards, dialogs, and similar primitives without revisiting configuration later.

### 5. Testing Foundation

Per `docs/design.md` section 8, the project uses **Vitest** as its testing framework. This task should install and configure Vitest so later tasks have a working test runner from the start.

Setup responsibilities:

- Install `vitest` and `@testing-library/react` (with `@testing-library/jest-dom` for matchers) as dev dependencies.
- Create a minimal `vitest.config.ts` that resolves the `@/*` path alias and integrates with React/Next.js (using `@vitejs/plugin-react` or equivalent).
- Add an `npm test` script to `package.json` that runs `vitest run`.
- Write at least one minimal test to confirm the test runner works — for example, a unit test for the `cn()` utility function in `src/lib/utils.ts`, or a simple assertion that a module can be imported. This validates the test toolchain without introducing feature-specific test scope.

Test files should be co-located with source files and follow the `*.test.ts` naming convention, per `docs/design.md` section 8.

### 6. Global Layout Shell

A minimal global app shell should be defined so every future page inherits the same baseline behavior.

The root layout (`src/app/layout.tsx`) should provide:

- `<html lang="en">` language declaration.
- Global font loading via `next/font` (Geist Sans and optionally Geist Mono).
- `body` classes for background color, foreground color, antialiasing (`antialiased`), and minimum-height behavior (`min-h-screen`).
- Metadata including a suitable `<title>` and `<meta name="description">`.

The root layout should **not** include a navigation bar, footer, or other structural chrome at this stage — those belong to later tasks.

The initial homepage (`src/app/page.tsx`) does not need to implement product features. It should serve as a visual smoke test proving that:

- the app renders successfully,
- the Ocean Teal primary color is active and visible,
- the typography and spacing look correct,
- the large border radius and soft shadow aesthetic are demonstrable,
- shadcn/ui-ready styling conventions are in place.

A simple centered card or hero section with a heading, a short tagline, and a styled element (e.g., a teal-accented container) is sufficient. Note: in the final product, `/` redirects to `/destinations` per `docs/design.md`, but for this task a static smoke-test page is appropriate since the destinations feature does not exist yet.

### 7. File-Level Deliverables

The implementation for this design is expected to create or configure the following files:

| Category | Files |
|---|---|
| Project bootstrap | `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs` (if Tailwind v3), ESLint config (`eslint.config.mjs` for Next.js 15 flat config) |
| Tailwind / shadcn | `tailwind.config.ts` (if Tailwind v3), `components.json` |
| App source | `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/favicon.ico` |
| Shared utilities | `src/lib/utils.ts` |
| Components directory | `src/components/ui/` (empty or with optional Button) |
| Testing | `vitest.config.ts`, `src/lib/utils.test.ts` (minimal smoke test) |

Exact filenames may vary depending on the installed generator versions (e.g., Tailwind v4 removes `tailwind.config.ts` and `postcss.config.mjs`). The implementation should preserve the architecture and conventions defined above regardless of generator output.

### 8. Validation Expectations

When this design is implemented, the following should be verifiable:

1. `npm install` succeeds without errors.
2. `npm run dev` starts the Next.js dev server and the homepage renders correctly.
3. `npm run build` completes without TypeScript or build errors.
4. `npm test` runs Vitest and all tests pass.
5. TypeScript strict mode is enabled and the codebase compiles cleanly.
6. shadcn/ui can generate future components via `npx shadcn@latest add <component>` into `src/components/ui/`.
7. The semantic theme system (CSS variables) controls global colors, radius, and interactive emphasis — changing `--primary` in `globals.css` should propagate everywhere.
8. The starter UI clearly reflects the "Light & Airy Vacation Style" (Ocean Teal accent, soft rounded corners, airy whitespace) instead of default framework styling.

## Implementation Plan

1. **Bootstrap the Next.js app**: Run `npx create-next-app@latest` with TypeScript, App Router, `src/` directory, Tailwind CSS, and npm. Verify the app boots with `npm run dev`. Confirm TypeScript strict mode is enabled in `tsconfig.json`; enable it if the generator did not.
2. **Initialize shadcn/ui**: Run `npx shadcn@latest init` configured for `src/components/ui` output, `src/lib/utils.ts` utility path, and CSS variables. Verify `components.json` is created and `src/lib/utils.ts` contains the `cn()` helper.
3. **Define the semantic color palette**: Replace the default CSS variables in `src/app/globals.css` with the Ocean Teal–based palette described in section 2.1. Remove any dark-theme block — only the light theme is in scope. Ensure `--radius` is set to `1rem`.
4. **Extend Tailwind theme** (if Tailwind v3) or **adjust CSS `@theme` block** (if Tailwind v4): Wire semantic utilities and add custom `shadow-card` / `shadow-card-hover` tokens. Verify radius tokens resolve correctly.
5. **Implement the root layout**: Configure Geist font loading, apply background/foreground/antialiasing body classes, and set metadata. Keep the layout minimal — no navbar or footer.
6. **Create the smoke-test homepage**: Build a simple static page that exercises the configured theme — Ocean Teal accent, rounded corners, soft shadows, spacious typography. Confirm visual correctness.
7. **Set up Vitest**: Install testing dependencies, create `vitest.config.ts`, add the `test` script, and write a minimal test (e.g., for `cn()`).
8. **Validate the scaffold end-to-end**: Run `npm run build` and `npm test` to confirm the project compiles and tests pass. Verify that `npx shadcn@latest add button` (or similar) can generate a component into the expected directory — then remove it if it was only used for validation.
