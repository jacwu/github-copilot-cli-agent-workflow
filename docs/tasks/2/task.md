# Issue #2 Design — Create a Travel Website

## Background

The product requirements define a travel website where visitors can discover destinations, search and filter destination content, learn about the platform, and create personalized trip plans after signing in. The repository-level design already establishes the intended stack and architecture: Next.js 15 with the App Router, Tailwind CSS with shadcn/ui, SQLite with Drizzle ORM, and NextAuth.js for credential-based authentication.

This issue represents the initial end-to-end product design for the travel website. Because the repository currently contains planning artifacts only, this document translates the high-level product and architecture documents into an issue-level MVP design that can guide implementation work across scaffold, data, API, and UI tasks.

## Goal

Define a practical MVP design for a full-stack travel website that:

- lets visitors browse destinations with rich imagery and metadata;
- supports search, filtering, sorting, and detail viewing for destinations;
- allows users to register, sign in, and manage their own trips;
- presents an about page that explains the platform mission; and
- stays consistent with the repository-wide technical design and coding standards.

## Non-Goals

The following are explicitly out of scope for this issue’s MVP design:

- booking flights, hotels, or third-party travel inventory;
- online payments, checkout flows, or invoicing;
- social features such as comments, likes, follows, or public itineraries;
- maps-heavy experiences requiring external map SDK integration in the first version;
- multi-language support, CMS tooling, or admin dashboards;
- advanced recommendation engines or AI itinerary generation.

## Current State

The repository currently provides the product documents (`docs/requirements.md`, `docs/design.md`, and `docs/tasks.md`) plus automation for the staged AI workflow, but no application source code has been generated yet. The issue-level design therefore needs to assume a greenfield implementation while remaining faithful to the established project conventions.

From the shared documents, the current architectural baseline is:

- frontend and backend unified in a Next.js 15 App Router application;
- UI implemented with Tailwind CSS and shadcn/ui using a light, airy travel aesthetic;
- SQLite as the persistence layer with Drizzle ORM for schema and queries;
- NextAuth.js credentials-based authentication with JWT sessions;
- destination seed data and locally served image assets;
- Vitest for backend-focused unit testing in later implementation stages.

## Proposed Design

### 1. Product Scope and User Flows

The MVP should support four primary user journeys.

#### 1.1 Visitor destination discovery

Visitors land on the destination browsing experience and can:

- view a grid of destination cards with image, name, country, category, price level, and rating;
- search by keyword;
- filter by region and category;
- further narrow results by price range, season, and popularity/rating;
- open a destination detail page for a fuller description and travel context.

#### 1.2 User authentication

Visitors can register with email, password, and display name, then sign in and sign out securely. Session state should drive protected navigation and access to trip management routes.

#### 1.3 Trip planning

Authenticated users can:

- create a trip with title and optional date range;
- add destinations as ordered stops;
- reorder or remove stops;
- update trip metadata and stop-level dates/notes;
- view only their own trips and trip details.

#### 1.4 About page

Visitors can access an about page that explains the platform mission, story, and value proposition in a visually polished but content-light format.

### 2. Application Architecture

The application should follow the repository design directly.

#### 2.1 Runtime model

- Use Next.js 15 App Router for both pages and API routes.
- Prefer Server Components by default.
- Use Client Components only for interactive UI such as filters, trip editing controls, and authentication forms.
- Fetch data directly from database access modules in Server Components when rendering server-side pages.
- Reserve API routes for browser-driven mutations, authenticated operations, and client-side fetch cases.

#### 2.2 Route structure

The route model should align with the repository design document:

- `/` redirects to `/destinations`
- `/login`
- `/register`
- `/destinations`
- `/destinations/[id]`
- `/trips`
- `/trips/[id]`
- `/about`
- `/api/auth/register`
- `/api/auth/[...nextauth]`
- `/api/destinations`
- `/api/destinations/[id]`
- `/api/trips`
- `/api/trips/[id]`
- `/api/trips/[id]/stops`
- `/api/trips/[id]/stops/[stopId]`

The extra nested delete route for stop removal is worth preserving even though the base design table lists it separately; it keeps mutation boundaries explicit and predictable.

### 3. Data Model

The database model should reuse the four entities already defined in `docs/design.md`.

#### 3.1 Core tables

- `users`
  - stores identity, credential hash, optional avatar, and created timestamp;
- `destinations`
  - stores destination metadata, categorization, pricing signal, rating, seasonality, and local image path;
- `trips`
  - stores a user-owned trip container with title, dates, and lifecycle status;
- `trip_stops`
  - stores ordered associations between trips and destinations, including optional notes and stop-specific dates.

#### 3.2 Ownership and integrity rules

- `users.id -> trips.user_id` is a one-to-many ownership boundary.
- `trips.id -> trip_stops.trip_id` is a one-to-many containment boundary.
- `destinations.id -> trip_stops.destination_id` enables itinerary composition from catalog content.
- Every trip query or mutation must enforce user ownership at the data access layer and again at the API boundary.
- Stop reordering should rely on `sort_order` values scoped to a single `trip_id`.

#### 3.3 Data representation notes

- Dates should be persisted as ISO-like text values, matching the repository design.
- Ratings and price levels are display-oriented values, not transactional guarantees.
- Destination images should be referenced by local static asset path so the UI remains stable even if original external CDN links change.

### 4. Authentication Design

Authentication should use NextAuth.js with a credentials provider and JWT-backed sessions, as specified in the shared design.

#### 4.1 Registration

`POST /api/auth/register` creates a new user after validating:

- required `email`, `password`, and `name`;
- unique email address;
- password policy suitable for an MVP baseline.

Passwords should be hashed before persistence and never stored or echoed in raw form.

#### 4.2 Login and session usage

- NextAuth credentials login verifies email/password against the stored hash.
- Session payload should include the user identifier needed for trip ownership checks and navbar state.
- Protected routes (`/trips`, `/trips/[id]`, and trip APIs) should require an authenticated session and return a consistent unauthorized response when absent.

### 5. Destination Discovery Design

#### 5.1 Destination list page

The destination listing should be the primary landing experience.

Key elements:

- hero or heading area introducing destination exploration;
- search input for free-text matching against destination name, country, and description;
- filter controls for region and category;
- range/select controls for price level and sorting;
- paginated or incrementally loaded results grid;
- empty-state messaging when no results match filters.

#### 5.2 Destination detail page

The detail page should emphasize the travel decision-making information most relevant to the requirements:

- large hero image;
- name, country, and category summary;
- descriptive content;
- rating, best season, and price-level summary;
- optional geography details if latitude/longitude are present;
- clear CTA for authenticated users to incorporate the destination into trip planning in later implementation steps.

#### 5.3 Query behavior

`GET /api/destinations` should support composable query parameters from the design document:

- `q`
- `region`
- `category`
- `price_min`
- `price_max`
- `sort`
- `page`
- `limit`

The implementation should treat unspecified filters as optional and return a stable response envelope containing `data`, `total`, `page`, and `limit`.

### 6. Trip Planning Design

#### 6.1 Trip list page

The trips index should present the signed-in user’s saved trips with:

- trip title;
- date range;
- status;
- stop count or compact destination preview;
- CTA to create a new trip.

#### 6.2 Trip detail and editing page

The trip detail page should combine trip metadata and itinerary editing in one focused screen.

Core editing actions:

- update title and trip dates;
- add a destination as a new stop;
- view stops in current order;
- reorder stops;
- update stop dates/notes;
- remove a stop;
- delete the entire trip when needed.

The UI can start with a simple form-and-list editor rather than drag-and-drop interactions. If richer interactions are desired later, they can be layered on without changing the underlying API shape.

#### 6.3 API behavior

Trip APIs should return only the current user’s resources.

- `GET /api/trips` returns all trips for the signed-in user.
- `POST /api/trips` creates a new trip in `draft` status.
- `GET /api/trips/[id]` returns the trip plus its ordered stops.
- `PUT /api/trips/[id]` updates mutable trip fields.
- `DELETE /api/trips/[id]` removes the trip and associated stops.
- `POST /api/trips/[id]/stops` appends a new stop.
- `PUT /api/trips/[id]/stops` performs bulk reorder and/or stop updates.
- `DELETE /api/trips/[id]/stops/[stopId]` removes an individual stop.

Validation rules should include:

- trip dates cannot invert start/end order when both are provided;
- stop dates should fit logically within the trip window when both windows are set;
- stop mutation requests must reference destinations that exist;
- reorder payloads must only include stops belonging to the specified trip.

### 7. UI and Experience Design

The visual language should directly follow the “Light & Airy Vacation Style” from `docs/design.md`.

#### 7.1 Layout principles

- scenic imagery should be a first-class visual element;
- whitespace should separate content blocks generously;
- cards should use large radii and soft shadows rather than hard borders;
- the navbar should support a subtle glass effect over page imagery or light backgrounds;
- Ocean Teal should remain the primary accent for buttons, active filters, and links.

#### 7.2 Shared components

The shared component layer should prioritize:

- `Navbar`
- `DestinationCard`
- `SearchBar`
- filter controls
- trip editor sections
- reusable empty-state and loading-state patterns

This keeps the MVP consistent while leaving room to introduce more specialized components later.

### 8. Seed Data and Asset Strategy

The shared design document already specifies a 30-destination seed catalog across beach, mountain, city, and countryside categories. This issue-level design should preserve that as the default data baseline because it is large enough to validate:

- search relevance;
- filter combinations;
- pagination behavior;
- trip-stop selection variety;
- visual consistency across multiple image-heavy cards.

Images should be downloaded during seed execution and stored locally under `public/images/destinations/`, while the database stores only local filenames/paths. This reduces runtime dependency on third-party image hosts.

### 9. Testing and Quality Expectations for Later Stages

Although implementation is out of scope for this design stage, the design should support the repository’s TDD and unit-testing requirements.

The later implementation should include tests for:

- registration validation and duplicate-email handling;
- credentials authentication behavior;
- destination query filtering, sorting, and pagination logic;
- trip ownership enforcement;
- trip CRUD behavior;
- stop addition, reorder, update, and deletion validation.

To keep those tests maintainable, business logic should be factored into focused modules instead of being embedded entirely inside route handlers.

## Implementation Plan

1. Scaffold the Next.js 15 application structure, Tailwind setup, and shared layout/navigation primitives according to the repository-wide design.
2. Configure SQLite and Drizzle ORM, including connection setup, schema definition, and migration workflow.
3. Define the `users`, `destinations`, `trips`, and `trip_stops` tables with the relationships and constraints described above.
4. Implement authentication foundations with NextAuth credentials flow and a registration endpoint.
5. Seed the destination catalog and local image assets so the application has stable sample content.
6. Build destination data access and API routes supporting search, filtering, sorting, detail lookup, and pagination.
7. Build the destination list and detail pages using the established visual style and shared UI components.
8. Implement authenticated trip APIs with strict ownership checks and itinerary stop management.
9. Build the trip list and trip detail/editing pages with a simple, reliable editor flow.
10. Add the about page and finish shared navigation/session affordances.
11. Validate the implementation with unit tests covering authentication, destination querying, trip management, and data validation boundaries.

