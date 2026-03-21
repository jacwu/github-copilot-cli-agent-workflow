# Task 1: Initialize Project Scaffold and Global UI Style Configuration

## Background

The travel website requires a consistent frontend foundation before feature work begins. The repository-level requirements describe a content-rich travel product with destination discovery, trip planning, authentication, and an about page, while the technical design specifies Next.js 15 with App Router, TypeScript, Tailwind CSS, and shadcn/ui as the primary UI stack.

Issue #15 focuses on establishing that foundation so all future pages and components inherit the intended visual language from the start. In particular, the repository-wide visual direction calls for a "Light & Airy Vacation Style" built around Ocean Teal as the primary accent, light neutral backgrounds, generous spacing, large radii, and soft shadows.

## Goal

Create the initial project scaffold and global UI styling configuration for a Next.js + TypeScript + Tailwind CSS application, with shadcn/ui integrated and theme tokens configured to enforce the shared Light & Airy Vacation Style across the app. Set up the Vitest testing framework so subsequent tasks can follow TDD from the start.

## Non-Goals

- Building feature pages such as destinations, trips, login, register, or about.
- Implementing backend APIs, database access, authentication flows, or seed data.
- Designing per-component variants beyond the global primitives needed for future work.
- Finalizing copy, imagery, or page-specific layout decisions.
- Introducing additional accent colors that compete with Ocean Teal as the primary visual identity.
- Implementing dark mode (only define the light theme; token structure should remain extensible).

## Current State

The repository currently contains only documentation (`docs/`), CI/automation scripts (`scripts/`, `.github/`), and project-level config files. There is **no application code**, no `package.json`, no `src/` directory, and no frontend tooling configured. This task creates everything from scratch.

Available runtime: Node.js v24, npm 11.

## Proposed Design

### 1. Application scaffold

Initialize the project in the repository root as a Next.js 15 App Router application using `npx create-next-app@latest`. The scaffolding command should enable TypeScript, Tailwind CSS, ESLint, the `src/` directory layout, and the App Router, while declining the Turbopack option to keep the build chain standard.

#### 1.1 Directory structure after scaffold

```
travel-website/  (repo root)
├── public/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with font + global CSS import
│   │   ├── page.tsx            # Minimal placeholder (replaced by later tasks)
│   │   └── globals.css         # Global styles + CSS variables
│   ├── components/
│   │   └── ui/                 # shadcn/ui generated components land here
│   ├── lib/
│   │   └── utils.ts            # cn() helper (clsx + tailwind-merge)
│   └── types/
│       └── index.ts            # Shared type definitions (empty initially)
├── components.json             # shadcn/ui configuration
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind theme extensions
├── postcss.config.mjs          # PostCSS config (Tailwind plugin)
├── tsconfig.json               # TypeScript config (strict mode)
├── vitest.config.ts            # Vitest configuration
├── package.json
└── package-lock.json
```

#### 1.2 Key scaffold decisions

- Use `src/`-based layout to match the repository technical design (`src/app`, `src/components`, `src/lib`, `src/types`).
- Configure TypeScript strict mode (`"strict": true` in `tsconfig.json`) immediately.
- Set up path aliases: `@/*` → `./src/*` in both `tsconfig.json` and Tailwind config.
- The root `page.tsx` contains a minimal placeholder page (not a production page). Later tasks will replace it with a redirect to `/destinations`.
- Preserve existing repository files (docs, scripts, .github) untouched.

### 2. Tailwind CSS configuration

Tailwind is configured as the primary styling mechanism. The `tailwind.config.ts` file extends the default theme with project-specific tokens.

#### 2.1 Content paths

```typescript
content: [
  "./src/**/*.{ts,tsx,mdx}",
]
```

#### 2.2 Theme extensions

```typescript
theme: {
  extend: {
    colors: {
      // Semantic tokens backed by CSS custom properties (HSL)
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    boxShadow: {
      soft: "0 2px 16px 0 rgba(0,0,0,0.06)",
      "soft-lg": "0 4px 24px 0 rgba(0,0,0,0.10)",
    },
  },
}
```

The `soft` and `soft-lg` shadow tokens provide the diffuse, airy elevation system. `shadow-soft` is for resting cards/surfaces; `shadow-soft-lg` is for hover/focus emphasis.

### 3. Global theme tokens (CSS custom properties)

All semantic colors are defined as HSL channel values (without the `hsl()` wrapper) in `:root` inside `globals.css`. This matches the shadcn/ui convention and allows Tailwind's opacity modifiers to work.

#### 3.1 Ocean Teal primary color

The primary Ocean Teal color: **HSL 174 60% 42%** (`#2baa9e` approximate). This produces a rich but not overpowering teal suitable for buttons, links, focus rings, and active states.

```
--primary: 174 60% 42%;
--primary-foreground: 0 0% 100%;
```

#### 3.2 Complete light theme token set

```css
:root {
  --background: 0 0% 100%;
  --foreground: 220 20% 14%;

  --card: 0 0% 100%;
  --card-foreground: 220 20% 14%;

  --popover: 0 0% 100%;
  --popover-foreground: 220 20% 14%;

  --primary: 174 60% 42%;
  --primary-foreground: 0 0% 100%;

  --secondary: 210 20% 96%;
  --secondary-foreground: 220 20% 20%;

  --muted: 210 20% 96%;
  --muted-foreground: 220 10% 46%;

  --accent: 174 30% 94%;
  --accent-foreground: 174 60% 30%;

  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;

  --border: 220 13% 91%;
  --input: 220 13% 91%;
  --ring: 174 60% 42%;

  --radius: 1rem;
}
```

Design rationale for key choices:
- **`--background: 0 0% 100%`**: Pure white base keeps pages clean and airy per design.md's "minimalist white" direction.
- **`--accent: 174 30% 94%`**: A very pale teal tint for subtle highlighted surfaces (e.g., hover rows) that hints at the primary without competing.
- **`--ring: 174 60% 42%`**: Focus ring matches primary Ocean Teal for consistent accessibility cues.
- **`--radius: 1rem`** (16px): This is the shadcn/ui `lg` radius. The `md` and `sm` radii derive from it. Cards and major surfaces should use `rounded-2xl` (1rem) or `rounded-3xl` (1.5rem) directly via Tailwind classes.

### 4. shadcn/ui integration

#### 4.1 Initialization

Run `npx shadcn@latest init` with these choices:
- Style: **New York** (cleaner, more refined aesthetic matching the airy style)
- Base color: **Slate** (neutral, non-competing with Ocean Teal)
- CSS variables: **Yes**

This generates `components.json` and installs required dependencies (`tailwind-merge`, `clsx`, `class-variance-authority`, `lucide-react`).

#### 4.2 Expected `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

#### 4.3 `src/lib/utils.ts`

The `cn()` utility combines `clsx` and `tailwind-merge` for conditional class composition:

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

#### 4.4 No components installed yet

No shadcn/ui components (Button, Card, etc.) are added in this task. Later tasks install them on demand. This task only sets up the generator configuration and theming foundation.

### 5. Global base styles

The `globals.css` file establishes the visual baseline on top of the CSS variable definitions.

#### 5.1 Tailwind layers

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### 5.2 Base layer overrides

```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
}
```

These ensure:
- All borders default to the `--border` token color.
- Body uses the light background and foreground tokens.
- Font smoothing is applied globally for crisp text.

#### 5.3 Typography

Use the Next.js default font (Geist Sans / Geist Mono, or Inter as fallback). The root `layout.tsx` should import and apply the font via `next/font/google` or `next/font/local`. No custom font installation is required.

### 6. Vitest testing setup

The repository coding standards require TDD and Vitest for all tests. This task configures Vitest so it is ready for use by subsequent tasks.

#### 6.1 Dependencies

Install as dev dependencies: `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.

#### 6.2 `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

#### 6.3 `src/test-setup.ts`

```typescript
import "@testing-library/jest-dom/vitest";
```

#### 6.4 npm scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

### 7. Smoke test

Write a minimal test to validate the scaffold works end to end.

#### 7.1 `src/app/page.test.tsx`

A basic test that imports the root page component and verifies it renders without crashing. This serves as:
- Proof that the Vitest + React Testing Library + path alias setup works.
- A TDD anchor for the scaffold task.

### 8. Consistency and extensibility considerations

- All color values are centralized in CSS variables in `globals.css`. No hard-coded colors in components.
- The token naming follows shadcn/ui conventions exactly, so any `npx shadcn@latest add <component>` will work without remapping.
- The `--radius` base token plus Tailwind's `rounded-2xl`/`rounded-3xl` classes give implementers both a default and explicit large-radius options.
- The `shadow-soft` / `shadow-soft-lg` Tailwind utilities replace the design.md's `shadow-sm` → `shadow-xl` progression with purpose-built tokens.
- Token structure is dark-mode-ready: adding a `.dark` selector block with alternate HSL values in the future requires no structural changes.
- The `accent` token uses a pale teal tint to subtly reinforce the Ocean Teal identity without competing with `primary`.

## Implementation Plan

1. **Initialize Next.js project**: Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-turbopack --import-alias "@/*"` in the repo root. Verify `package.json`, `tsconfig.json`, and `next.config.ts` are created. Confirm TypeScript strict mode is enabled.

2. **Create supporting directories**: Ensure `src/components/ui/`, `src/lib/`, and `src/types/` directories exist. Create `src/types/index.ts` as an empty file. Create `src/lib/utils.ts` placeholder (will be replaced by shadcn init).

3. **Integrate shadcn/ui**: Run `npx shadcn@latest init` with New York style, Slate base color, and CSS variables enabled. Verify `components.json` is created and `src/lib/utils.ts` contains the `cn()` helper.

4. **Configure global CSS variables**: Edit `src/app/globals.css` to define the complete light theme token set (section 3.2) with Ocean Teal as primary. Add base layer overrides for body and border defaults (section 5.2).

5. **Extend Tailwind config**: Edit `tailwind.config.ts` to add `shadow-soft` and `shadow-soft-lg` custom shadow tokens (section 2.2). Verify semantic color tokens and border-radius tokens are properly configured (shadcn init may have already added these).

6. **Set up Vitest**: Install `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom` as dev dependencies. Create `vitest.config.ts` and `src/test-setup.ts`. Add `test` and `test:watch` scripts to `package.json`.

7. **Write smoke test**: Create `src/app/page.test.tsx` that imports and renders the root page component. Verify the test passes with `npm test`.

8. **Validate build**: Run `npm run build` to confirm the scaffold compiles without errors. Run `npm run lint` to confirm no linting issues.
