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
- Defining seed data, backend logic, or test suites for later tasks.

## Current State

The repository currently includes:

- `docs/requirements.md` with the product user stories.
- `docs/design.md` with the target stack, project structure, and visual design direction.
- `docs/tasks.md` with the task checklist.
- GitHub Actions and helper scripts for the staged AI workflow.

The repository does **not** currently include:

- `package.json` / `package-lock.json`
- `src/app` or `app` directory
- Tailwind configuration files
- shadcn/ui configuration
- shared UI utilities such as `src/lib/utils.ts`
- global CSS variables or design token definitions

Because of that gap, this task must be treated as a greenfield scaffold task rather than an incremental style tweak.

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
- Keep TypeScript strict mode enabled from the start.
- Use the default App Router conventions (`layout.tsx`, `page.tsx`) and Server Components by default.
- Set up import aliasing for `@/*` so later tasks can import shared modules consistently.
- Include only the minimum starter route content required to confirm the app boots and the global styles are applied.

### 2. Styling Foundation

The global styling system should encode the repo-wide visual guidance from `docs/design.md` into reusable Tailwind and CSS token defaults.

#### 2.1 Color strategy

Ocean Teal will be the single primary accent color. It should be mapped into the design-token layer so buttons, links, focus rings, selected states, and interactive emphasis all resolve to the same hue family.

The palette should prioritize:

- Primary: Ocean Teal
- Surface/background: white and very light slate/gray tones
- Foreground: dark slate text for readability
- Secondary/muted surfaces: pale neutral tones that support the airy feel without competing with the primary color
- Destructive: keep shadcn defaults or a restrained alert color for accessibility and future forms

The design should use CSS custom properties in `globals.css` as the source of truth for semantic tokens such as:

- `--background`
- `--foreground`
- `--card`
- `--card-foreground`
- `--popover`
- `--popover-foreground`
- `--primary`
- `--primary-foreground`
- `--secondary`
- `--secondary-foreground`
- `--muted`
- `--muted-foreground`
- `--accent`
- `--accent-foreground`
- `--border`
- `--input`
- `--ring`
- `--radius`

This keeps Tailwind utilities and shadcn/ui components aligned through semantic tokens instead of hard-coded hex values across the codebase.

#### 2.2 Radius and elevation strategy

To match the required friendly, breathable aesthetic:

- Global default radius token should be set large enough that base components feel soft by default.
- Cards, dialogs, sheets, and form containers should use `rounded-2xl` as the standard baseline.
- Larger showcase surfaces may use `rounded-3xl`.
- Borders should be visually de-emphasized in favor of subtle shadows.
- Shadow tokens should favor soft low-contrast elevation instead of dense dark drop shadows.

Where custom Tailwind utilities are needed, they should be added centrally so later tasks can reuse names such as a soft card shadow or elevated hover state instead of duplicating arbitrary shadow values.

#### 2.3 Typography and spacing

Use the default modern sans-serif path expected by the design document (for example Geist or Inter through Next.js font integration). The global layout should establish:

- Comfortable line-height for body text
- Spacious page padding and section spacing
- A max-width container pattern suitable for image-led content pages

These should be encoded through layout classes and reusable utility choices rather than ad hoc page-level styling.

### 3. Tailwind CSS Configuration

Tailwind should be configured as the core utility system for the application and extended only where it supports the design language.

Configuration responsibilities:

- Enable Tailwind scanning for `src/app`, `src/components`, and `src/lib`.
- Wire semantic color utilities to CSS variables using the standard shadcn-compatible theme extension pattern.
- Expose radius tokens based on `--radius` for `lg`, `md`, and `sm`, while still permitting direct `rounded-2xl` and `rounded-3xl` utility usage where the design calls for it.
- Add any project-specific box shadows only if needed to express the soft floating effect more clearly than the default Tailwind shadows.

The design should avoid over-customizing Tailwind at this stage. The goal is a thin configuration layer that supports the established theme and stays easy to maintain.

### 4. shadcn/ui Integration

shadcn/ui should be initialized early because it will supply most reusable UI primitives for future tasks.

Integration design:

- Use the shadcn CLI to generate its configuration and utility wiring.
- Configure output so generated components live in `src/components/ui`.
- Ensure the generated utility helper resolves to `src/lib/utils.ts`.
- Keep the chosen base style compatible with the light, airy visual direction; visual refinement should come primarily from the theme tokens rather than one-off component overrides.

Initial component generation can remain minimal in this task. The important part is that the project is ready to add buttons, inputs, cards, dialogs, and similar primitives without revisiting configuration later.

### 5. Global Layout Shell

A minimal global app shell should be defined so every future page inherits the same baseline behavior.

The root layout should provide:

- HTML language declaration
- Global font loading
- `body` classes for background, foreground, antialiasing, and minimum-height behavior
- A centered page wrapper with spacious vertical rhythm

The initial homepage does not need to implement product features. It only needs to serve as a visual smoke test proving that:

- the app renders successfully,
- the theme tokens are active,
- the typography and spacing look correct,
- shadcn/ui-ready styling conventions are in place.

### 6. File-Level Deliverables

The implementation for this design is expected to create or configure the following categories of files:

- Project bootstrap files: `package.json`, `package-lock.json`, `tsconfig.json`, `next.config.*`, `postcss.config.*`, ESLint defaults if generated by Next.js
- Tailwind/shadcn files: Tailwind config, shadcn config, `components.json` if used by the selected shadcn version
- App files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Shared utility file: `src/lib/utils.ts`

Exact filenames may vary slightly depending on the current Next.js and shadcn generators, but the implementation should preserve the architecture and conventions defined above.

### 7. Validation Expectations

When this design is implemented, the following should be true:

- The repository can install dependencies with npm and run the baseline Next.js app.
- TypeScript, Tailwind CSS, and the App Router all work together without manual follow-up setup.
- shadcn/ui can generate future components into the expected directories.
- A single semantic theme system controls global colors, radius, and interactive emphasis.
- The starter UI clearly reflects the "Light & Airy Vacation Style" instead of default framework styling.

## Implementation Plan

1. Bootstrap a new Next.js 15 app with TypeScript, App Router, `src/` directory support, and npm-managed dependencies.
2. Add and verify Tailwind CSS and PostCSS configuration using the standard Next.js-compatible setup.
3. Initialize shadcn/ui so generated components target `src/components/ui` and shared helpers target `src/lib/utils.ts`.
4. Define semantic CSS variables in `src/app/globals.css` for background, foreground, primary, accent, border, ring, and radius tokens, using Ocean Teal as the only primary brand color.
5. Extend Tailwind theme settings so semantic utilities and radius tokens resolve to the CSS variables.
6. Implement the root layout with font loading and global body/container styling aligned to the airy travel aesthetic.
7. Create a minimal starter page that visually exercises the configured theme without introducing feature-specific scope.
8. Validate that the scaffold runs successfully and that the resulting baseline is ready for Task 2 and later UI work.
