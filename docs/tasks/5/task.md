# Task 1 Design: Initialize Project Scaffold and Global UI Style Configuration

## Background

Task 1 establishes the frontend foundation for the travel website described in `docs/requirements.md` and `docs/design.md`. The repository-level design calls for a Next.js 15 App Router application with TypeScript, Tailwind CSS, and shadcn/ui, while the product direction specifies a "Light & Airy Vacation Style" built around Ocean Teal, light backgrounds, generous spacing, large rounded corners, and soft shadows.

This issue is the first implementation task, so its output must create a reliable project baseline that future tasks can extend without needing to revisit styling primitives or initial framework setup. Because the current repository does not yet contain an application scaffold, the design must cover both the technical bootstrapping and the initial global design system choices.

## Goal

Create the initial application scaffold and shared visual foundation so that subsequent tasks can build pages and components on top of a consistent, ready-to-use stack.

Specifically, this task should:

- initialize a Next.js 15 project using the App Router with TypeScript and npm;
- enable Tailwind CSS as the default styling layer;
- integrate shadcn/ui with CSS-variable-based theming;
- define global theme tokens that encode the "Light & Airy Vacation Style";
- establish Ocean Teal as the single primary accent across interactive states;
- set default radius, shadow, spacing, and typography choices that match the repository design.

## Non-Goals

- Implementing destination, authentication, trip, or about page features.
- Building backend routes, database integration, or authentication logic.
- Completing all future shared components beyond the minimum scaffold needed for shadcn/ui and global styling.
- Finalizing brand copy, production imagery, or page-specific layouts.
- Introducing dark mode or a theme switcher in this task.

## Current State

The repository currently contains planning and automation artifacts (`docs/`, workflow-related files, and scripts) but no application scaffold yet. There is no `package.json`, no `src/` directory, and no existing Next.js or Tailwind configuration to extend.

Relevant repository-level constraints and expectations:

- `docs/design.md` defines the target stack as Next.js 15, Tailwind CSS, shadcn/ui, and TypeScript.
- The UI must follow the "Light & Airy Vacation Style" with Ocean Teal as the main accent color, light neutral backgrounds, large card radii, and soft floating shadows.
- The project structure in `docs/design.md` assumes an App Router codebase rooted under `src/`.
- The coding standards require strict TypeScript, App Router conventions, and npm-based dependency management.

Because the application does not exist yet, this task must produce a clean baseline rather than refactor existing code.

## Proposed Design

### 1. Scaffold the application with Next.js App Router defaults

Initialize the app using the standard npm-based Next.js setup with:

- Next.js 15;
- React 19-compatible defaults used by the current Next.js release;
- TypeScript in strict mode;
- App Router enabled;
- `src/` directory enabled;
- import aliasing for `@/*`.

This gives future tasks a standard file structure aligned with `docs/design.md` and avoids custom project layout decisions early in the implementation.

### 2. Use Tailwind CSS as the global styling foundation

Tailwind should be configured as the default styling system for layout, typography, spacing, state styles, and utility composition. The global CSS entry point should define the design tokens that Tailwind and shadcn/ui consume.

The styling approach should favor:

- utility-first page construction;
- CSS custom properties for theme tokens;
- minimal bespoke CSS beyond tokens, resets, and a few global base styles.

This keeps the system flexible for later component work while still centralizing the aesthetic rules in one place.

### 3. Integrate shadcn/ui in CSS-variable mode

shadcn/ui should be initialized in the standard way so future tasks can add components without reworking aliases or token definitions. The setup should include:

- `components.json` configured for the Next.js App Router project;
- aliases that match the repository conventions (`@/components`, `@/lib`, etc.);
- the shared `cn` utility in `src/lib/utils.ts`;
- CSS-variable-based color tokens so shadcn/ui components inherit the site theme automatically.

The intent is not to install every shadcn/ui component in this task. Instead, the task should create the integration layer so future tasks can add components on demand with no theming drift.

### 4. Define a light-only global theme centered on Ocean Teal

The theme should use semantic tokens rather than hard-coded utility colors throughout components. In practice, the implementation should define CSS variables for at least:

- `background`
- `foreground`
- `card`
- `card-foreground`
- `popover`
- `popover-foreground`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `muted`
- `muted-foreground`
- `accent`
- `accent-foreground`
- `border`
- `input`
- `ring`
- `radius`

Color direction:

- `primary`: Ocean Teal, used for primary buttons, links, key highlights, active states, and focus accents.
- `primary-foreground`: a very light foreground to maintain strong contrast on teal surfaces.
- `background`: white or near-white.
- `secondary` / `muted`: soft gray-white or sandy-neutral surfaces for layered sections.
- `border`: subtle neutral borders, used sparingly because the visual style relies more on shadow and separation than heavy outlines.
- `accent`: should remain in the same Ocean Teal family rather than introducing a second competing brand color.

This preserves the repository-wide requirement that Ocean Teal act as the sole primary visual identity.

### 5. Encode the "Light & Airy Vacation Style" in base tokens

To make the design system reusable, the style guidance from `docs/design.md` should be translated into reusable defaults:

- **Large radii**: set the global radius token to support `rounded-2xl` / `rounded-3xl`-style surfaces as the norm for cards, inputs, dialogs, and panels.
- **Soft shadows**: define shadow presets that feel elevated and calm rather than dense or harsh. Default cards should use subtle ambient depth, with slightly stronger hover elevation where needed later.
- **Breathing room**: establish generous container and section spacing through layout defaults and Tailwind usage conventions.
- **Minimal borders**: prefer low-contrast borders plus shadows instead of heavy strokes.
- **Clean typography**: keep the default sans-serif stack from Next.js (Geist or equivalent) and let whitespace, weight, and imagery carry the tone.

This task should configure primitives, not page-specific polish. The outcome should make it easy for later tasks to produce a consistent aesthetic using normal utilities.

### 6. Add a minimal application shell for immediate validation

Since later feature routes do not exist yet, Task 1 should include only the minimal shell needed to prove the scaffold is wired correctly. The shell should consist of:

- root layout with global stylesheet import and base font configuration;
- app metadata placeholder appropriate for the travel product;
- a temporary root page or starter surface that exercises the configured theme tokens and confirms the app renders successfully.

Although `docs/design.md` eventually expects `/` to redirect to `/destinations`, that redirect should not be forced in this task if the destination route has not been created yet. A temporary root page is a safer scaffold choice for the initial setup and can be replaced once destination browsing is implemented.

### 7. Tailwind and token extensions

The Tailwind configuration should be extended only where it improves consistency across future tasks:

- map Tailwind theme colors to CSS variables;
- map border radius values to the shared `--radius` token;
- define a small set of custom shadows if the default Tailwind shadows do not adequately match the softer aesthetic;
- keep the configuration minimal and semantic so future components can use standard Tailwind and shadcn/ui patterns.

This avoids over-designing the system while still giving the project a recognizable visual baseline.

### 8. Dependency boundaries

This task should install only the dependencies required for the scaffold and UI foundation:

- Next.js / React / TypeScript baseline packages;
- Tailwind CSS and supporting PostCSS tooling if required by the chosen initialization flow;
- shadcn/ui prerequisites;
- lightweight utility dependencies commonly required by shadcn/ui (for example, class merging helpers).

Database, authentication, testing, and feature-specific packages should remain in later tasks unless they are required by the default scaffold.

## Implementation Plan

1. Initialize the application with Next.js App Router, TypeScript, `src/` layout, npm, and Tailwind-enabled defaults.
2. Verify strict TypeScript settings and import aliases align with repository conventions.
3. Initialize shadcn/ui using the standard Next.js configuration and CSS-variable theme mode.
4. Create the shared utility layer required by shadcn/ui integration (notably the class name merge helper).
5. Define global CSS tokens for the light theme, using Ocean Teal as the only primary accent and soft neutrals for surfaces/backgrounds.
6. Extend Tailwind theme values only as needed for semantic color access, large radii, and soft shadow presets.
7. Implement a minimal root layout and temporary starter page that demonstrates the configured typography, spacing, colors, radius, and shadows.
8. Confirm the scaffold builds and that the base UI renders with the intended theme primitives before handing off to later tasks.
