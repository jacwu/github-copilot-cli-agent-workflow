# Task 1: Initialize Project Scaffold and Global UI Style Configuration

## Background

The product requirements define a full-stack travel website that will rely heavily on a polished, image-forward frontend experience for destination discovery, trip planning, authentication, and brand storytelling. The repository-level technical design standardizes on Next.js 15 with the App Router, TypeScript, Tailwind CSS, and shadcn/ui, and it explicitly sets a "Light & Airy Vacation Style" as the visual foundation for the application.

Issue #12 is the first implementation task and establishes the baseline project scaffold plus the global design system decisions that later feature work will inherit. Because subsequent tasks will build pages, forms, cards, navigation, and authenticated flows on top of this foundation, the scaffold and theme configuration must be consistent, reusable, and opinionated enough to avoid visual drift.

## Goal

Create a technical design for initializing the application foundation with:

- Next.js 15 App Router project scaffolding
- Strict TypeScript configuration
- Tailwind CSS setup
- shadcn/ui integration
- Global style tokens and theme variables that encode the "Light & Airy Vacation Style"
- A reusable UI baseline centered on Ocean Teal as the single primary brand color, light backgrounds, large radii, and soft shadows

The output of this task should make future UI work straightforward by defining where configuration lives, how theme tokens are expressed, and what default styling conventions later tasks should follow.

## Non-Goals

- Implementing destination, trip, authentication, or about-page feature logic
- Building production-ready page content beyond minimal scaffold verification surfaces
- Designing database, ORM, or API logic
- Finalizing detailed component implementations for all future screens
- Introducing multiple branded accent colors beyond the single primary Ocean Teal direction
- Performing implementation-time visual fine-tuning that is better validated after real screens exist

## Current State

Based on the current repository contents, the project currently contains planning and requirements documentation but no existing issue-level task document for issue #12. The repository-level design already specifies the major frontend stack and visual style:

- Frontend stack: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
- Typography: modern sans-serif defaults such as Inter or Geist
- Visual language: light gray-white backgrounds, generous whitespace, large rounded corners, soft shadows, and selective glassmorphism
- UI conventions: `rounded-2xl` / `rounded-3xl`, `shadow-sm` to stronger hover elevation, and Ocean Teal as the primary action color

What is not yet specified at the issue level is how these requirements should be translated into concrete project bootstrap choices, configuration files, CSS variable definitions, shadcn theme alignment, and reusable layout conventions.

## Proposed Design

### 1. Scaffold the application with the repository-standard stack

Initialize the project as a Next.js 15 App Router application with TypeScript and Tailwind CSS enabled from the start. The scaffold should align with the repository-level structure described in `docs/design.md`, with the source rooted under `src/` and the app entrypoint living under `src/app/`.

Key bootstrap expectations:

- Use npm for dependency management
- Enable strict TypeScript settings
- Use App Router conventions rather than Pages Router
- Configure import aliasing for internal modules
- Ensure the default layout and stylesheet entrypoints are in place so later tasks can add pages and components without reworking foundational structure

This keeps Task 1 focused on platform readiness, not on feature delivery.

### 2. Establish theme tokens using CSS custom properties

The core design decision for this task is to convert the repository-wide visual guidance into a small, stable token system expressed as CSS custom properties in the global stylesheet. This is the best fit because:

- Tailwind and shadcn/ui both work well with CSS-variable-driven themes
- Global variables allow later tasks to reuse brand styling without duplicating utility combinations
- A tokenized approach makes the UI system scalable while staying simple for a small application

The theme should define semantic tokens rather than hard-coding brand colors directly in component code. At minimum, define tokens for:

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

These names align with shadcn/ui conventions, allowing generated components to inherit the intended design language immediately.

### 3. Encode the “Light & Airy Vacation Style” in the theme

The design system should intentionally bias toward a bright, spacious interface. The theme should apply the repository-level visual direction as follows:

#### Primary color

Ocean Teal is the only true primary brand color and should be used consistently for:

- Primary buttons
- Links and key navigation emphasis
- Focus rings
- Selected states
- Important interactive highlights

Avoid introducing competing saturated accent colors in the base theme. Secondary and accent tokens should remain subtle and mostly support surfaces, hover states, and section separation rather than competing with the primary color.

#### Background and surfaces

Global surfaces should use very light backgrounds to preserve the airy tone:

- App background: white or near-white
- Alternating section surfaces: pale gray or warm-neutral light tone
- Cards/popovers: white or slightly tinted light surface

This supports scenic media and content readability without making the interface feel dense.

#### Shape language

The default shape system should emphasize comfort and softness:

- Use a global base radius token large enough to support `rounded-2xl` as the common card/button form
- Reserve `rounded-3xl` for hero cards, image panels, and prominent containers
- Avoid sharp, boxy defaults in foundational components

#### Depth and shadows

The application should rely more on soft elevation than hard borders:

- Default cards and panels should have subtle shadows
- Hover states may deepen elevation modestly
- Borders should remain faint and low-contrast when needed for definition

This matches the repository guidance to create a floating, breathable interface.

### 4. Align Tailwind configuration with semantic design tokens

Tailwind should be configured to expose the CSS variables as semantic theme values rather than relying on scattered arbitrary values. The configuration should:

- Map semantic colors to the CSS custom properties
- Expose the shared radius token(s)
- Extend box shadows to include the soft, airy elevation levels expected by the design
- Include the standard content globs for `src/app`, `src/components`, and `src/lib` locations

This approach keeps utility classes expressive and consistent. Future work can use classes like `bg-background`, `text-foreground`, `bg-primary`, and `rounded-2xl` while inheriting the issue-defined visual system.

### 5. Configure shadcn/ui to inherit the global style system

shadcn/ui should be integrated as the reusable component baseline for future tasks. The integration should be configured so generated components use:

- The shared Tailwind theme
- The semantic CSS variables above
- A utility helper consistent with common shadcn setup
- A default style choice compatible with large radii and soft visual treatment

The design should prefer shadcn/ui as the primitive layer rather than building a parallel custom component foundation from scratch. This keeps the codebase aligned with the repository design and accelerates later tasks such as auth forms, nav, filters, and cards.

### 6. Provide a minimal global baseline for typography and page shell

Although issue #12 is not a feature implementation task, the scaffold should include a minimal global baseline so later pages feel coherent immediately. The design should account for:

- Applying the chosen sans-serif font globally
- Setting document background and foreground defaults from the theme tokens
- Enabling antialiasing and comfortable text rendering defaults
- Giving the root layout a clean page shell that future routes can build upon

This should remain intentionally minimal: enough to confirm the theme works, but not so specific that it constrains future page-specific composition.

### 7. Use a small set of reusable UI defaults

To prevent style inconsistency in later tasks, this issue should establish a few default conventions:

- Cards and content containers: rounded, light-surface, soft-shadow presentation
- Primary actions: Ocean Teal background with high-contrast foreground
- Secondary actions: low-contrast neutral surface
- Inputs: understated borders, prominent focus ring using the primary theme token
- Section spacing: generous padding and whitespace by default

These conventions are intentionally simple and broad. They are not a complete component library specification, but they provide a stable baseline for all subsequent frontend tasks.

### 8. Prepare for optional dark mode without making it part of the task scope

The repository-level documents do not require dark mode for this issue. The design should therefore optimize for a polished light theme first. However, because shadcn/ui and CSS variable theming naturally support multiple themes, the structure may be set up in a way that could accommodate dark mode later without forcing it now.

This means:

- Light theme is the only required, production-ready target for Task 1
- Theme variable naming should remain semantic so a dark variant can be added later if needed
- No additional dark-mode product design is required in this issue

## Implementation Plan

1. Initialize the Next.js 15 project scaffold with App Router, `src/` layout, strict TypeScript, and Tailwind CSS using npm.

2. Add and configure shadcn/ui so future tasks can generate and consume shared UI primitives consistently.

3. Define global CSS variables for semantic colors, radii, and interaction tokens in the global stylesheet, with Ocean Teal as the only primary brand color and with light backgrounds/surfaces as the default visual foundation.

4. Extend Tailwind configuration to consume the semantic CSS variables, shared radius values, and soft shadow presets needed for the airy visual language.

5. Apply a minimal root layout and typography baseline so default pages inherit the theme automatically.

6. Validate that the scaffold supports future work in `src/app`, `src/components`, and `src/lib` without further foundational restructuring.

7. Keep implementation intentionally narrow: only establish the platform and global UI styling baseline, leaving feature pages and business logic to later tasks.
