# Task 1: Initialize Project Scaffold and Global UI Style Configuration

## Background

The travel website requires a consistent frontend foundation before feature work begins. The repository-level requirements describe a content-rich travel product with destination discovery, trip planning, authentication, and an about page, while the technical design specifies Next.js 15 with App Router, TypeScript, Tailwind CSS, and shadcn/ui as the primary UI stack.

Issue #15 focuses on establishing that foundation so all future pages and components inherit the intended visual language from the start. In particular, the repository-wide visual direction calls for a "Light & Airy Vacation Style" built around Ocean Teal as the primary accent, light neutral backgrounds, generous spacing, large radii, and soft shadows.

## Goal

Create the initial project scaffold and global UI styling configuration for a Next.js + TypeScript + Tailwind CSS application, with shadcn/ui integrated and theme tokens configured to enforce the shared Light & Airy Vacation Style across the app.

## Non-Goals

- Building feature pages such as destinations, trips, login, register, or about.
- Implementing backend APIs, database access, authentication flows, or seed data.
- Designing per-component variants beyond the global primitives needed for future work.
- Finalizing copy, imagery, or page-specific layout decisions.
- Introducing additional accent colors that compete with Ocean Teal as the primary visual identity.

## Current State

The issue context defines the desired stack and style direction, but the task itself is the starting point for the frontend foundation. Based on the repository-wide design, the target stack and conventions are already known:

- Framework: Next.js 15 with App Router.
- Language: TypeScript in strict mode.
- Styling: Tailwind CSS.
- Component system: shadcn/ui.
- UI direction: Light backgrounds, Ocean Teal primary accent, large rounded corners, soft shadows, and an airy visual rhythm.

At this stage, the key design concern is not feature behavior but ensuring the scaffold and theme configuration are set up so subsequent tasks can build consistently on top of them without repeated style rework.

## Proposed Design

### 1. Application scaffold

Initialize the project as a standard Next.js 15 App Router application using npm, with TypeScript enabled from the beginning. The base scaffold should align with the repository-level structure in `src/app`, `src/components`, and `src/lib` so later tasks can add feature modules without structural churn.

Key scaffold decisions:

- Use `src/`-based layout to match the repository technical design.
- Keep App Router defaults such as `layout.tsx`, `page.tsx`, and global stylesheet entry points.
- Configure TypeScript strict mode immediately to enforce the repository coding standard.
- Keep the initial scaffold minimal and focused on shared infrastructure, not placeholder product pages.

### 2. Tailwind CSS as the global styling layer

Tailwind should be configured as the primary styling mechanism for both application code and shadcn/ui components. The configuration should support app directories under `src/` and any generated shadcn/ui component files.

Tailwind setup should cover:

- Content paths that include app, components, and supporting source folders.
- Theme extension points for colors, border radius, shadows, and other reusable tokens.
- Global CSS entry with Tailwind layers and theme variable definitions.
- Compatibility with shadcn/ui token usage, especially semantic color tokens backed by CSS custom properties.

### 3. Global theme tokens for the Light & Airy Vacation Style

The visual system should be expressed through semantic CSS variables and Tailwind theme mappings rather than hard-coded colors inside individual components. This makes the design reusable across all future UI work and matches how shadcn/ui is typically themed.

#### Color system

Ocean Teal should be the single primary brand/action color used for interactive emphasis, including buttons, links, focus states, selection states, and highlighted controls. Supporting backgrounds should remain very light and neutral so destination imagery and content can stand out.

Recommended token intent:

- `primary`: Ocean Teal for main calls to action and active states.
- `primary-foreground`: high-contrast foreground for text/icons on teal surfaces.
- `background`: near-white or very light gray-white base.
- `card` / `popover`: white or slightly lifted neutral surfaces.
- `muted`, `accent`, `secondary`: pale neutral or softly tinted surfaces that do not compete with the primary brand color.
- `border` / `input`: subtle low-contrast neutrals.
- `ring`: Ocean Teal-aligned focus ring for consistent accessibility cues.

This preserves the requirement that Ocean Teal is the sole primary color while still allowing neutral support tokens for structure and readability.

#### Shape system

Large rounded corners are a core part of the desired aesthetic. The theme should bias shared surfaces toward `rounded-2xl` and `rounded-3xl`, especially cards, panels, dialogs, and major action surfaces.

Recommended approach:

- Define the base design token radius high enough that default component shapes feel soft and welcoming.
- Preserve smaller radii only where appropriate for compact controls or nested UI.
- Ensure shadcn/ui primitives inherit the configured radius token instead of requiring repeated per-instance overrides.

#### Elevation system

Shadows should communicate softness and lightness rather than heavy separation. Prefer subtle depth at rest and a slightly stronger floating effect on interactive hover states.

Recommended approach:

- Establish a soft default shadow for cards and elevated surfaces.
- Use a stronger but still diffused shadow for hover/focus emphasis.
- Avoid sharp borders and harsh shadow contrast except where needed for accessibility.

### 4. shadcn/ui integration strategy

shadcn/ui should be integrated early so future tasks can build on a shared component base that already respects the global theme. The integration should configure the component generator to use the project’s Tailwind setup, TypeScript aliases, and CSS variable-based theming.

Important design choices:

- Use the modern shadcn/ui setup aligned with Tailwind and App Router.
- Configure the component alias paths to match the repository’s intended `src/` structure.
- Ensure generated components consume semantic tokens (`primary`, `background`, `border`, etc.) instead of direct palette values.
- Treat shadcn/ui as the baseline component library, with future custom components composed on top of it rather than re-implementing primitives.

### 5. Global base styles

The global stylesheet should establish the shared visual baseline for the entire app. This includes body background, text color, smoothing, selection styling, and default surface behavior so the app feels cohesive even before feature-specific components are built.

Base styling should include:

- Light page background with readable foreground text.
- Ocean Teal selection/focus styling.
- Smooth default transitions where appropriate for UI polish.
- Optional global utility classes or layer-based base rules for reusable card/surface behavior if they remain small and clearly foundational.

### 6. Consistency and extensibility considerations

This issue should optimize for future reuse. The scaffold and token system should allow later tasks to build destination cards, filters, trip editors, auth forms, and navigation with minimal bespoke styling.

To support that:

- Prefer semantic theme tokens over page-local styling decisions.
- Centralize brand and surface values in one place.
- Keep configuration aligned with shadcn/ui conventions to reduce maintenance burden.
- Ensure the chosen token names and aliases are flexible enough for future dark mode or theme expansion, even if only the light theme is implemented now.

## Implementation Plan

1. Initialize the project with Next.js 15 App Router, TypeScript, and Tailwind CSS using npm, ensuring the structure matches the repository design (`src/app`, shared source directories, and strict TypeScript configuration).
2. Configure Tailwind content paths and theme extensions for semantic colors, large radius tokens, and soft shadow tokens required by the Light & Airy Vacation Style.
3. Add global CSS variables and base styles that define the light theme, including Ocean Teal as the sole primary accent and neutral backgrounds/surfaces.
4. Integrate shadcn/ui with project aliases and CSS-variable-based theming so generated components inherit the shared tokens automatically.
5. Validate that the initial scaffold supports future component work without page-level styling duplication, and note any implementation-time adjustments needed if generated shadcn/ui defaults require token remapping.
