# Healthcare Provider Discovery Service

## Current Implementation Notes

- The backend now supports state-only searches by seeding the NPPES query with `postal_code` wildcard partitions instead of sending an invalid upstream `state`-only request.
- Broad searches are collected with a partition-aware strategy: split by provider type first, then recursively refine oversized branches with postal wildcard prefixes until each leaf query fits within the NPPES retrieval ceiling.
- If a fully refined branch still exceeds the upstream cap, the API returns the collected subset and reports the incomplete state explicitly through response metadata instead of silently truncating results.

# Story Statement

As a healthcare platform, I want to discover and collect healthcare provider information from the national NPI
registry by geographic location and specialty, and visualize the results through an intuitive web interface, so
that I can build a comprehensive provider directory for patient matching and network analysis.

# Background & Context

We are building a healthcare platform that needs to discover and aggregate provider information across
geographic regions. The National Provider Identifier (NPI) is a unique 10-digit identification number issued to
healthcare providers in the United States by the Centers for Medicare and Medicaid Services (CMS).

The NPPES (National Plan and Provider Enumeration System) NPI Registry provides a public API to search
and retrieve provider information. Your task is to build a service that can collect providers by location and
filter them by their taxonomy (specialty).

- **Base URL** : https://npiregistry.cms.hhs.gov/api/
- **Documentation** : https://npiregistry.cms.hhs.gov/api-page
- **Rate Limits** : No authentication required; be respectful of rate limits
- **Response Format** : JSON
- **Example API Call** : GET	https://npiregistry.cms.hhs.gov/api/?version=2.1&postal_code=90210&limit=

# Functional Requirements

Build a service using NestJS (housed in `apps/api/`) that provides the following capabilities:

**1. Provider Discovery by Location**
    - **Search by ZIP Code** : Retrieve all providers within a specified ZIP code
    - **Search by City/State** : Retrieve all providers in a city and state combination
    - **Search by State** : Retrieve providers across an entire state (with pagination handling)
    - Support for both Individual (Type 1) and Organization (Type 2) NPIs
**2. Taxonomy Filtering**
    - Filter providers by **taxonomy description** (e.g., "Dentist", "General Practice")
    - Allow combining location search with taxonomy filters
**3. Bulk Collection with Pagination**
    - Automatically handle API pagination to collect **all matching providers**
    - Support configurable batch sizes (API limit parameter)
    - Implement respectful rate limiting between requests
    - Track and report collection progress (total found, collected, remaining)

**4. Data Persistence**

- Save collected providers to JSON files
- File naming convention: providers_{location}_{taxonomy}_{timestamp}.json
- Store files in a configurable output directory


- Include collection metadata:
    - Search parameters used
    - Total providers found
    - Collection timestamp and duration
    - API version used
    - Pagination details

**5. Summary Statistics**

- Count of providers with multiple taxonomies
- Total providers by type (Individual vs Organization)
- Breakdown by primary taxonomy
- Provider count by city (if searching by state/ZIP)
- Count of providers with multiple taxonomies
- Top 10 most common specialties

# UI/UX Requirements

**1. Search Interface**

Build a search page that allows users to:

- **Location Input** :
    o Toggle between ZIP code, City/State, or State-only search
    o ZIP code input with validation (5-digit format)
    o City input with State dropdown (US states)
    o State-only dropdown for broader searches
- **Taxonomy Filter** :
    o Searchable dropdown/autocomplete for taxonomy descriptions
    o Option to enter taxonomy code directly
    o "Common Specialties" quick-select buttons (e.g., Dentist, Primary Care, Cardiology)
- **Search Controls** :
    o Search button with loading state
    o Clear/Reset button
    o Provider type filter (All, Individual only, Organization only)
**2. Results Display**

Build a results section that displays:

- **Results Summary Header** :
    o Total providers found
    o Search parameters used
    o Time taken to fetch
- **Provider List/Table** :
    o Sortable columns (Name, NPI, Specialty, City, State)
    o Pagination controls (10/25/50 per page)
    o Expandable rows to show full provider details
    o Individual vs Organization visual indicator (icon or badge)
- **Provider Card View** (alternative to table):
    o Toggle between table and card view


```
o Card showing: Name, NPI, Primary Specialty, Address, Phone
```
**3. Statistics Dashboard**

Build a statistics panel/section that displays:

- **Summary Cards** :
    o Total Providers (with Individual vs Organization breakdown)
    o Unique Specialties Count
    o Cities Covered
- **Charts/Visualizations** :
    o Pie/Donut chart: Provider Type distribution (Individual vs Organization)
    o Bar chart: Top 10 Specialties by provider count
    o Bar chart: Top 10 Cities by provider count (if applicable)
- **Taxonomy Breakdown Table** :
    o Taxonomy description
    o Taxonomy code
    o Provider count
    o Percentage of total
    o Sortable by count
**4. UI/UX Requirements**
- **Responsive Design** : Works on desktop and tablet (mobile is bonus)
- **Loading States** : Skeleton loaders or spinners during API calls
- **Error Handling** : User-friendly error messages for failed searches
- **Empty States** : Helpful message when no results found
- **Accessibility** : Basic a11y (labels, keyboard navigation, color contrast)
**5. Export Functionality**
- **Download JSON** : Button to download current results as JSON
- **Download CSV** (Bonus): Export results as CSV file

# Technical Requirements

**1. Technology Stack**

```
Backend
```
```
Category Technology
Runtime Bun 1.0+
Language TypeScript 5+
Framework NestJS
HTTP Client Axios (wrapped with axios-retry)
Validation class-validator + class-transformer
API Docs Swagger (auto-generated from DTOs)
Caching Redis (pub/sub, rate-limiting, cache)
Testing Jest
Linting ESLint 9 (flat config) + Prettier
```
```
Frontend (apps/web/)
```
```
Category Technology
Framework Next.js 14+ (App Router)
Language TypeScript 5+
Styling TailwindCSS + CVA (class-variance-authority) + Radix UI (shadcn-style)
Server State TanStack Query
Client State Zustand
Forms React Hook Form
URL State App Router / search params
Charts Recharts
Testing Jest + React Testing Library
Linting ESLint 9 (flat config) + Prettier
```
```
Shared
```
```
Category Technology
Monorepo Turborepo with Bun workspaces
Package Manager Bun
Shared Types @npi/contracts (packages/contracts)
Containerization Docker + Docker Compose (multi-stage builds)
CI/CD GitHub Actions → Render (API) + Vercel (Web)
```
**2. Project Structure**
```
npi-discovery-service/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── modules/<feature>/    # Feature-bounded modules
│   │   │   └── common/               # Decorators, guards, plugins, scheduler, pubsub
│   │   ├── test/
│   │   └── CLAUDE.md
│   └── web/                          # Next.js frontend
│       ├── src/
│       │   ├── app/                   # App Router route structure
│       │   ├── components/
│       │   │   ├── ui/                # Radix/shadcn primitives
│       │   │   └── <domain>/          # Feature-specific component slices
│       │   └── lib/
│       │       ├── auth/
│       │       ├── hooks/
│       │       └── stores/            # Zustand stores
│       └── CLAUDE.md
├── packages/
│   └── contracts/                     # @npi/contracts — shared TS types & schemas
│       └── CLAUDE.md
├── docker/                            # Docker Compose & infra config
├── infra/                             # Terraform deployment infrastructure
├── scripts/                           # Root automation scripts
├── .claude/                           # Agent instruction metadata
├── .agent/                            # Agent steering config
├── .github/                           # GitHub Actions workflows
├── turbo.json
├── CLAUDE.md                          # Root agent instructions
└── package.json                       # Bun workspace root
```
**3. Code Quality Standards**
    - **TypeScript Standards**
    - **Strict Mode** : Root base tsconfig enables `strict`, `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `noImplicitReturns`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `incremental` builds, `decorators` for Nest
    - **No Any** : Avoid `any` type; use proper typing or `unknown`
    - **Interfaces** : Interface preference enforced by ESLint (interfaces over type aliases)
    - **Type-Only Imports** : Use `import type` for type-only imports
    - **Enums** : Use enums or const objects for fixed values
    - **Type Guards** : Implement type guards where needed
    - **Linting** : ESLint 9 flat config with `@eslint/js`, `typescript-eslint` (recommended type-checked + stylistic), `eslint-plugin-import`, `eslint-config-prettier`. Key rules: no unused vars, prefer nullish/optional chaining, no floating promises, consistent type imports, no var / prefer const / eqeqeq / curly
    - **Formatting** : Prettier with `semi: false`, `singleQuote: true`, `trailingComma: 'all'`, `printWidth: 100`, `prettier-plugin-tailwindcss`


# Acceptance Criteria

**Backend Acceptance Criteria**

- **AC1: Search Endpoint - ZIP Code**
    **Given** a POST request to /api/providers/search with {"zipCode": "75201"} **When** the request is
    processed **Then** the API returns all providers in that ZIP code with proper pagination handled,
    response includes provider list and metadata, and response time is logged
- **AC2: Search Endpoint - City/State with Taxonomy**
    **Given** a POST request with {"city": "Austin", "state": "TX", "taxonomyDescription": "Dentist"}
    **When** the request is processed **Then** only dental providers in Austin, TX are returned, results are
    filtered by primary taxonomy, and response includes total count and pagination info
- **AC3: Statistics Endpoint**
    **Given** a POST request to /api/statistics with a list of providers or search parameters **When** statistics
    are generated **Then** response includes provider type breakdown, taxonomy distribution, geographic
    distribution, and top specialties list
- **AC4: Input Validation**
    **Given** an invalid request body (e.g., invalid ZIP format, missing required fields) **When** the request is
    received **Then** API returns 400 Bad Request with clear validation error messages, using class-
    validator decorators or Zod schemas
- **AC5: API Error Handling**
    **Given** an invalid request or NPPES API failure **When** the error occurs **Then** appropriate HTTP status
    code is returned (400, 404, 502, etc.), error response includes clear message and error code, and errors
    are logged appropriately
- **AC6: Rate Limiting Handling**
    **Given** the NPPES API returns 429 during bulk collection **When** rate limit is hit **Then** backend
    implements backoff and retry, partial results are preserved, and client receives appropriate response

```
Frontend Acceptance Criteria
```
- **AC7: Search Form Functionality**
    **Given** the search page is loaded **When** user interacts with the form **Then** user can toggle between
    ZIP, City/State, and State search modes, taxonomy autocomplete shows relevant options, form
    validates inputs before submission, and search button shows loading state during API call
- **AC8: Results Display**
    **Given** a successful search with results **When** results are displayed **Then** results show in a sortable,
    paginated table, user can toggle between table and card view, each provider shows NPI, name,
    specialty, and location, and Individual vs Organization types are visually distinguished


- **AC9: Statistics Dashboard**

```
Given search results are loaded When statistics panel is displayed Then summary cards show total
counts and breakdowns, pie chart shows provider type distribution, bar chart shows top 10 specialties,
and taxonomy table is sortable by count
```
- **AC10: Empty and Error States**

```
Given a search returns no results or fails When the response is received Then empty state shows
helpful message and suggestions, error state shows user-friendly error message, and user can easily
retry or modify search
```
- **AC11: Export Functionality**

```
Given results are displayed When user clicks "Download JSON" Then a properly formatted JSON
file is downloaded, filename includes search parameters and timestamp, and file contains all displayed
results with metadata
```

# Unit Testing Requirements

**Backend Testing (Minimum 85% Coverage)**

**Controller Tests**

```
Test Case Description
should return providers for valid ZIP code Verify ZIP search returns results
should return providers for city/state Verify city/state search works
should filter by type of provider Verify taxonomy filtering
should return 400 for invalid ZIP Verify validation error
should return empty array when no results Verify empty result handling
should generate statistics Verify statistics endpoint
should return taxonomy list Verify taxonomies endpoint
```
**Service Tests**

```
Test Case Description
should handle NPPES pagination Verify pagination handling
should handle rate limiting Verify 429 response handling
should filter by primary taxonomy only Verify taxonomy filtering logic
should calculate type breakdown Verify statistics calculation
should calculate taxonomy distribution Verify specialty breakdown
```
**NPPES Client Tests**

```
Test Case Description
should build correct query params Verify URL construction
should parse NPPES response Verify response parsing
should handle network errors Verify error handling
should implement retry logic Verify retry on failure
```
**Frontend Testing (Minimum 70% Coverage)**

**Component Tests**

```
Test Case Description
SearchForm renders all inputs Verify form elements render
SearchForm validates ZIP format Verify input validation
SearchForm submits with valid data Verify form submission
ResultsTable renders providers Verify table with mock data
ResultsTable sorts by column Verify column sorting
Pagination navigates correctly Verify pagination controls
StatsDashboard displays metrics Verify statistics display
Charts render with data Verify chart rendering
Loading state displays spinner Verify loading indicator
```

```
Test Case Description
Error state displays message Verify error display
Empty state displays message Verify no results message
```
**Hook Tests**

```
Test Case Description
useProviderSearch returns loading state Verify loading state
useProviderSearch returns data on success Verify successful fetch
useProviderSearch returns error on failure Verify error handling
```

# API Documentation Requirements

Create docs/API.md with:

**1. Overview**
    - Service description and architecture diagram
    - Tech stack summary
**2. Setup Instructions**
    - Prerequisites (Bun, Node.js 18+)
    - Environment variables
    - How to run backend and frontend
    - Docker setup
**3. API Reference**

Document each endpoint:

```
###	POST	/api/providers/search
Search	for	healthcare	providers	by	location	and	taxonomy.
**Request	Body:**
|	Field	|	Type	|	Required	|	Description	|
|-------|------|----------|-------------|
|	zipCode	|	string	|	No	|	5-digit	ZIP	code	|
|	city	|	string	|	No	|	City	name	|
|	state	|	string	|	No	|	2-letter	state	code	|
|	taxonomyCode	|	string	|	No	|	Taxonomy	code	(e.g.,	"1223G0001X")	|
|	taxonomyDescription	|	string	|	No	|	Taxonomy	description	(e.g.,	"Dentist")	|
|	providerType	|	number	|	No	|	1	=	Individual,	2	=	Organization	|
**Response:**
{
"providers":	Provider[],
"metadata":	{
"totalCount":	number,
"searchParams":	object,
"timestamp":	string,
"duration":	number
}
}
```
**4. Data Models**
    - Provider interface
    - Statistics interface
    - Error response format
**5. Error Codes**

```
Code HTTP Status Description
VALIDATION_ERROR 400 Invalid request parameters
PROVIDER_NOT_FOUND 404 NPI not found
NPPES_UNAVAILABLE 502 NPPES API unreachable
RATE_LIMITED 429 Too many requests
```


# Submission Requirements

**Deliverables**

1. Complete source code in a Git repository (GitHub preferred)
2. README.md with:
    o Project overview
    o Setup instructions (local and Docker)
    o Available bun scripts
    o Environment variables (root `.env.example`)
3. Docker Compose file (`docker/`) to run the full stack (multi-stage builds)
4. All tests passing with coverage reports
5. API documentation in docs/API.md
6. Agent instruction files (`CLAUDE.md` at root, `apps/api/`, `apps/web/`, `packages/contracts/`)
7. Screenshots or GIF/video showing the working application

**How to Run**

Include these scripts in your package.json files:

**Backend:**

```
{
"scripts":	{
"dev":	"nest	start	--watch",
"build":	"nest	build",
"start:prod":	"node	dist/main",
"test":	"jest",
"test:cov":	"jest	--coverage",
"lint":	"eslint	\"{src,test}/**/*.ts\"	--fix"
}
}
```
**Frontend:**

```
{
"scripts":	{
"dev":	"next	dev",
"build":	"next	build",
"start":	"next	start",
"lint":	"next	lint",
"test":	"jest",
"test:cov":	"jest	--coverage"
}
}
```
**Evaluation Criteria**

```
Criteria Weight What We're Looking For
Functionality 25% Does it work? Are all acceptance criteria met?
Code Quality 20% Clean TypeScript, proper typing, consistent patterns
Frontend UI/UX 15% Intuitive interface, responsive design, good UX
Testing 15% Comprehensive tests, good coverage, proper mocking
Error Handling 10% Graceful handling of edge cases on both ends
Documentation 10% Clear README, JSDoc comments, API docs
Architecture 5% Sensible structure, separation of concerns, reusability
```

**Bonus Points (Optional)**

**Backend:**

- Implement WebSocket for real-time progress updates during bulk collection
- Add caching layer (Redis or in-memory with node-cache)
- Implement NPI checksum validation (Luhn algorithm)
- Add request logging with correlation IDs
- Implement rate limiting for your own API

**Frontend:**

- Dark mode toggle with system preference detection
- Provider location map using Leaflet or Mapbox
- CSV export functionality
- Mobile-responsive design
- Keyboard shortcuts
- Search history persistence (localStorage)
- Skeleton loading states

**Code Quality:**

- Shared TypeScript types via `@npi/contracts` between frontend and backend
- E2E tests with Playwright or Cypress
- OpenAPI schema generation from DTOs

**Infrastructure:**

- CI/CD with GitHub Actions (develop → staging, main → production)
- Render deployment for API, Vercel deployment for Web
- Agent instruction files (CLAUDE.md) per workspace package


