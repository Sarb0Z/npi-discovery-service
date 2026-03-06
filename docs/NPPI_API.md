### ⚠️ Critical Upstream API Constraints (Discovered via Docs)

1.  **State-Only Searches are Blocked:** The documentation explicitly states: *"state: This field cannot be used as the only input criterion. If this field is used, at least one other field, besides the Enumeration Type and Country, must be populated"* [1]. 
    *   *Mitigation:* To satisfy the "Search by State" AC, your backend must either require a Taxonomy alongside the State, or it must autonomously subdivide the query by iterating through a list of standard Taxonomy codes or Zip codes for that state.
2.  **Strict 1,200 Record Limit:** `limit` maxes out at 200, and `skip` maxes out at 1000 [1]. A query cannot retrieve record 1,201 via pagination [1].
3.  **Enumeration Types:** The API expects `NPI-1` and `NPI-2`, not numeric `1` and `2` [1].
4.  **Deterministic Array Ordering:** The `addresses` array in the response always has exactly two occurrences. Index `[0]` is **always** the Primary Practice Location, and Index `[1]` is **always** the Mailing Address [1].

---

### Part 1: The Upstream Request (Backend to NPPES)

When your NestJS `NppesClientModule` (located at `apps/api/src/modules/nppes-client/`) constructs the Axios GET request, it must format the parameters exactly like this:

**Base URL:** `GET https://npiregistry.cms.hhs.gov/api/` [1]

**Upstream Query Parameters:**
*   `version`: **Must** be `"2.1"` [1].
*   `postal_code`: 5-digit or 9-digit zip code (wildcards allowed, e.g., "902*") [1].
*   `city`: String (Allows special characters) [1].
*   `state`: 2-letter uppercase code [1]. *(Must be paired with another parameter)* [1].
*   `taxonomy_description`: String (e.g., "Dentist")[1].
*   `enumeration_type`: `"NPI-1"` (Individual) or `"NPI-2"` (Organization) [1].
*   `limit`: Integer between `1` and `200` [1].
*   `skip`: Integer between `0` and `1000` [1].

**Upstream JSON Response Payload (NPPES V2.1):**
*Do not pass this raw object to the frontend. It is messy and contains up to 50 identifiers [1].*
```typescript
interface NppesRawResponse {
  result_count: number;
  results: Array<{
    number: string; // The 10-digit NPI
    enumeration_type: "NPI-1" | "NPI-2";
    basic: {
      first_name?: string;
      last_name?: string;
      organization_name?: string;
      credential?: string; // e.g., "MD", "DDS"
    };
    addresses: Array<{
      address_1: string;
      address_2?: string;
      city: string;
      state: string;
      postal_code: string;
      telephone_number?: string;
    }>; // [0] = Primary, [1] = Mailing
    taxonomies: Array<{
      code: string;
      desc: string;
      primary: boolean;
      state: string;
    }>;
  }>;
}
```

---

### Part 2: Your Internal API (Backend ↔ Frontend Contract)

This is the API your NestJS backend (`apps/api/`) exposes to your Next.js frontend (`apps/web/`). These DTOs must reside in `packages/contracts` (published as `@npi/contracts`) to ensure strict, drift-free synergy between API and clients.

#### 1. Search Providers Endpoint
*   **POST** `/api/providers/search`
*   **Purpose:** The frontend calls this. The backend validates it, translates it to the NPPES format, fetches the data, sanitizes it, and returns it.

**Request DTO (`SearchProvidersDto`):**
```typescript
import { IsOptional, IsString, Matches, IsIn, IsNumber, Min, Max } from 'class-validator';

export class SearchProvidersDto {
  @IsOptional()
  @Matches(/^[0-9]{5}$/, { message: 'zipCode must be a 5-digit string' })
  zipCode?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Matches(/^[A-Z]{2}$/, { message: 'state must be a 2-letter uppercase code' })
  state?: string;

  @IsOptional()
  @IsString()
  taxonomyDescription?: string;

  @IsOptional()
  @IsIn([1, 2], { message: 'providerType must be 1 (Individual) or 2 (Organization)' })
  providerType?: number;

  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsNumber()
  @Min(10)
  @Max(200) // Bound by NPPES max limit
  limit: number = 50;
}
```

**Response DTO (`SearchResponseDto`):**
```typescript
export interface SearchResponseDto {
  providers: ProviderDto[]; // The sanitized array
  metadata: {
    totalCount: number; // Will cap at 1200 due to upstream limits unless chunked
    searchParams: Partial<SearchProvidersDto>;
    timestamp: string; // ISO 8601
    duration: number; // in milliseconds
  };
}
```

#### 2. The Sanitized `ProviderDto`
*The backend agent MUST implement a mapping function to convert `NppesRawResponse` into this strict `ProviderDto`.*

```typescript
export interface ProviderDto {
  npi: string;                 
  type: 1 | 2;                 
  name: string;                // Computed: "first_name last_name, credential" OR "organization_name"
  primarySpecialty: string;    // Plucked from taxonomies where primary=true
  specialties: string[];       // Array of all taxonomy desc strings
  address: {
    address1: string;
    address2: string | null;
    city: string;
    state: string;
    zipCode: string;
  }; // strictly extracted from `addresses[0]` (Primary Practice Location)
  phone: string | null;
}
```

#### 3. Statistics Dashboard Endpoint
*   **POST** `/api/statistics`
*   **Purpose:** Returns the aggregated data required for Recharts.

**Request:** `SearchProvidersDto` (so the backend calculates stats on a specific query context).
**Response DTO (`StatisticsResponseDto`):**
```typescript
export interface StatisticsResponseDto {
  summary: {
    totalProviders: number;
    individualCount: number;
    organizationCount: number;
    multipleTaxonomiesCount: number;
    uniqueCitiesCount: number;
  };
  providerTypeDistribution: Array<{ name: string; value: number }>; 
  topSpecialties: Array<{ description: string; count: number; percentage: number }>;
  topCities: Array<{ name: string; count: number }>;
}
```

#### 4. Bulk Collection Endpoint
*   **POST** `/api/providers/bulk`
*   **Purpose:** Kicks off the background pagination runner that bypasses the 1,200 limit (by querying different taxonomies/cities sequentially within the requested State/ZIP) and saves to disk. Progress events are emitted via Redis-backed WebSocket pub/sub.

**Request:**
```typescript
export class BulkCollectionDto extends SearchProvidersDto {
  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(200)
  batchSize?: number = 200; // Passed directly to NPPES `limit`
}
```
**Response:** `202 Accepted`
```typescript
export interface BulkJobResponseDto {
  jobId: string;
  status: "PROCESSING";
  message: "Bulk collection initiated. Connect to ws://.../events with jobId.";
}
```

By strictly enforcing these boundaries, the AI agents will avoid runtime crashes caused by the API's hidden `skip=1000` limit and the `state` isolated query blockage [1].