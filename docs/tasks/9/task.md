# Task 1: Initialize Project Scaffold and Global UI Style Configuration

## Background

This task establishes the frontend foundation for the travel website described in `docs/requirements.md` and `docs/design.md`. The product is expected to use Next.js 15 with the App Router, TypeScript, Tailwind CSS, and shadcn/ui, while presenting a consistent "Light & Airy Vacation Style" centered on Ocean Teal, light layered backgrounds, oversized radii, and soft elevation.

Because this is the first development task in `docs/tasks.md`, decisions made here will shape every subsequent page, component, and interaction. A well-defined scaffold and theme system are necessary so later destination, authentication, trip, and about-page work can reuse shared primitives instead of reinventing styling locally.

## Goal

Create a technical design for initializing the application scaffold and global UI styling system so the repository can support:

- a strict TypeScript Next.js 15 App Router project structure
- Tailwind CSS configured as the primary styling mechanism
- shadcn/ui integrated as the component primitive layer
- global design tokens implementing the "Light & Airy Vacation Style"
- shared utility and alias conventions that future tasks can build on safely

## Non-Goals

This task does not design or implement feature-complete product flows. In particular, it does not include:

- authentication logic, routes, or forms beyond placeholder scaffold decisions
- destination listing/detail business UI beyond what is needed to confirm global theme wiring
- database, ORM, API, or seed-data implementation
- final marketing copy, imagery, or production-ready page content
- advanced theming modes such as dark mode or multi-brand palettes

## Current State

A read-only repository check shows that the repository currently contains project documentation and automation assets, but no committed Next.js application scaffold, frontend source tree, or frontend configuration files such as `package.json`, `tsconfig.json`, `next.config.*`, `tailwind.config.*`, or `components.json`.

That means this task should be treated as a greenfield application bootstrap. The design should therefore define not just visual tokens, but also the expected folder layout, package choices, baseline configuration, and the minimum shared app shell required for later tasks.

## Proposed Design

### 1. Bootstrap the application with Next.js 15, TypeScript, and Tailwind CSS

The implementation should initialize a new npm-managed Next.js 15 project using the App Router and a `src/` directory layout. TypeScript strict mode must remain enabled to match repository standards.

The scaffold should include:

- `src/app/` for route segments and root layout
- `src/components/` for app components
- `src/components/ui/` for shadcn/ui-generated primitives
- `src/lib/` for shared utilities such as `cn`
- `public/` for static assets

A `src/` layout is preferred because the repository-level design document already models the app under `src/app`, `src/components`, `src/db`, and `src/lib`, and using that structure from the beginning prevents churn in later tasks.

### 2. Standardize package and configuration choices

The scaffold should use npm exclusively and create the standard project metadata and config files expected by a modern Next.js app. The design assumes the implementation will introduce at least:

- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `next.config.ts` or `next.config.mjs`
- Tailwind/PostCSS configuration compatible with the selected Next.js version
- `components.json` for shadcn/ui

Configuration should preserve repository conventions:

- path aliases should support `@/` imports rooted at `src/`
- TypeScript should stay in strict mode
- App Router conventions should be used instead of the Pages Router
- no custom theming framework should be added beyond Tailwind CSS and shadcn/ui

### 3. Integrate shadcn/ui as the shared component primitive layer

shadcn/ui should be installed and configured early so all future UI work is built from a consistent base instead of ad hoc utility-only markup. This task should establish the shadcn/ui baseline rather than a large component inventory.

The design expects:

- `components.json` configured to use the Tailwind setup and `@/` aliases
- `src/lib/utils.ts` added for shared utilities such as class merging
- a minimal initial primitive set for future tasks, starting with common building blocks such as `button`, `card`, `input`, and optionally `badge` or `separator`

The exact initial component list can remain small, but the configuration should be complete enough that future tasks can add additional shadcn components without revisiting global setup.

### 4. Implement the global visual system with CSS variables

The repository-level design defines the visual language clearly: Ocean Teal is the primary accent, backgrounds stay light and breathable, cards use large radii, and shadows are soft instead of border-heavy. To make those rules reusable, the implementation should express them as CSS custom properties in the global stylesheet and wire them into Tailwind/shadcn usage patterns.

The global theme should define tokens for at least:

- background and foreground
- surface/card background
- primary and primary-foreground
- muted and muted-foreground
- border/input/ring
- radius scale
- shadow recipes or reusable utility combinations

The palette should follow these rules:

- Ocean Teal is the only primary/action color
- neutral backgrounds should stay close to white, slate-50, or gray-50 equivalents
- supporting neutrals should be soft and low-contrast
- no secondary brand accent should compete with the primary color in this phase

Even if shadcn/ui exposes a broader token model, implementation should keep unused accent choices neutral so the visual hierarchy remains aligned with the design brief.

### 5. Encode the "Light & Airy Vacation Style" into default UI conventions

This task should not stop at defining colors. It should codify the baseline visual behavior expected across the app.

#### Border radius

Use large rounded corners by default:

- cards, panels, dialogs, and major containers should target `rounded-2xl`
- hero surfaces and standout sections may use `rounded-3xl`
- small controls can inherit shadcn defaults where appropriate, but the global radius token should bias components toward a softer, larger feel

#### Shadows and borders

The default presentation should favor soft elevation over strong outlines:

- cards and floating surfaces should use subtle shadows at rest
- hover states may increase elevation modestly
- borders should remain low-contrast and secondary to shadow-based separation

#### Spacing and layout feel

The root app shell should reinforce breathable layouts:

- generous section spacing
- constrained content widths for readability
- light background layering rather than dense boxed layouts
- typography defaults that work well with Inter/Geist-style sans-serif fonts

### 6. Establish the root app shell and baseline global stylesheet

Although this task is primarily about scaffold and theme, the design should include the minimum app-shell work needed to prove the styling system is wired correctly.

The implementation should therefore create or configure:

- `src/app/layout.tsx` with global font setup and body classes
- `src/app/globals.css` with Tailwind imports and CSS variables
- `src/app/page.tsx` as a minimal placeholder entry page or redirect-friendly starter surface

The initial root page does not need real product functionality. Its purpose is to verify that:

- the project builds
- global styles load correctly
- typography, spacing, radii, and shadows render as intended
- shadcn/ui primitives can inherit the global token system cleanly

### 7. Recommended file-level responsibilities

The following file layout is the preferred baseline for this task:

```text
.
├── package.json
├── package-lock.json
├── components.json
├── next.config.*
├── postcss.config.*
├── tsconfig.json
├── public/
└── src/
    ├── app/
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── components/
    │   └── ui/
    │       ├── button.tsx
    │       ├── card.tsx
    │       └── input.tsx
    └── lib/
        └── utils.ts
```

This stays intentionally small while creating the shared structure needed for future feature work.

### 8. Styling token strategy

Implementation should prefer semantic tokens instead of scattering raw Tailwind colors throughout components. The practical pattern is:

- define core colors as CSS variables in `globals.css`
- map shadcn/ui and Tailwind usage to those variables
- consume semantic utility classes such as `bg-background`, `text-foreground`, `bg-primary`, and `text-muted-foreground`
- reserve one-off raw color utilities for rare exceptions only

This approach keeps the theme maintainable and makes future visual refinements possible without mass component edits.

### 9. Risks and mitigation

#### Risk: default shadcn/ui theme feels too neutral or generic

Mitigation: override the theme variables during initial setup instead of accepting generator defaults, especially for primary, radius, and surface contrast.

#### Risk: later tasks introduce inconsistent spacing and radius choices

Mitigation: establish semantic wrapper patterns early in the root page and rely on shadcn primitives plus shared utility composition rather than page-local styling habits.

#### Risk: Tailwind and shadcn versions drift from Next.js 15 expectations

Mitigation: keep to standard generator-compatible configuration, avoid custom build tricks, and validate the initial scaffold with the repository's existing npm-based workflow.

## Implementation Plan

1. Initialize a new npm-based Next.js 15 application with TypeScript, App Router support, and Tailwind CSS, using a `src/` directory layout.

2. Configure TypeScript strict mode, `@/` path aliases, and baseline Next.js/Tailwind/PostCSS files so the project matches repository conventions.

3. Install and initialize shadcn/ui, generating `components.json`, `src/lib/utils.ts`, and a minimal starter set of UI primitives for reuse.

4. Define global CSS variables in `src/app/globals.css` for Ocean Teal primary styling, light neutral backgrounds, readable foregrounds, soft borders, large radii, and low-contrast shadow behavior.

5. Wire the root app shell through `src/app/layout.tsx` and a minimal `src/app/page.tsx` so the theme is visible and the scaffold can be validated visually and structurally.

6. Verify the scaffold builds successfully and that the starter page demonstrates the intended theme foundation without introducing feature-specific logic.

7. Leave subsequent product tasks to build on this foundation for authentication, destination browsing, trips, and about-page content.
