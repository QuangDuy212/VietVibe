# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack Vietnamese language learning application (VietVibe) with:

- **Backend**: Spring Boot 3 monolith in `VietVibe/` (Java 21, Maven)
- **Frontend**: React SPA in `frontend/` (Vite, TypeScript, Tailwind CSS, shadcn/ui)

## Common Commands

### Backend (`VietVibe/`)

```bash
# Run the Spring Boot application (requires MySQL running)
./mvnw spring-boot:run

# Run all tests
./mvnw test

# Run a single test class
./mvnw test -Dtest=AuthenticationServiceTest

# Package the application
./mvnw clean package
```

On Windows use `mvnw.cmd` instead of `./mvnw`.

### Frontend (`frontend/`)

```bash
# Start the Vite dev server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

### Database

```bash
# Start MySQL 8 container (from VietVibe/)
docker-compose up -d
```

MySQL is exposed on host port `3308` (container port 3306). Database `VietVibe` is auto-created by Hibernate (`ddl-auto: update`).

## Backend Architecture

### Layer Structure

The backend follows a standard layered architecture under `com.example.VietVibe`:

- **`controller/`** — REST endpoints. Controllers delegate to services and use DTOs for request/response.
- **`service/`** — Business logic. Services access repositories and mappers.
- **`repository/`** — Spring Data JPA interfaces.
- **`entity/`** — JPA entities with Lombok annotations.
- **`dto/request/`** and **`dto/response/`** — Request/response DTOs.
- **`mapper/`** — MapStruct mappers (component model = `spring`).
- **`configuration/`** — Spring config (Security, CORS, JWT, database init, response formatting).
- **`exception/`** — Custom exceptions, error codes, and global exception handler.
- **`util/`** — Utility classes and custom annotations.

### Key Patterns

**Response Wrapping**: `FormatRestResponse` (`@ControllerAdvice`) automatically wraps all successful JSON responses in `ApiResponse<T>`. It reads the `@ApiMessage` annotation on controller methods to populate the message field. Errors are handled by `GlobalExceptionHandler`.

**Public Endpoints**: Security is JWT-based (OAuth2 resource server). Endpoints that should skip authentication are annotated with `@PublicEndpoint` at the method level (e.g., `/auth/login`, `/auth/register`). The whitelist in `SecurityConfiguration` is supplementary.

**Pagination**: Spring Data pagination is configured as **1-indexed** (`spring.data.web.pageable.one-indexed-parameters: true`). The frontend sends 1-based page numbers.

**File Upload**: Uploaded files are stored on the local filesystem at `D:/Project/VietVibe/upload/` (configured in `application.yml` under `upload.file.uri`). The `FileController` serves files via `/files/**`.

**Database Seeding**: `DatabaseInitializer` creates a default admin user (`admin` / `123456`) on first run if the user table is empty.

### Auth Flow

- Login returns an **access token** (JWT, short-lived) and sets a **refresh token** in an HTTP-only cookie.
- The frontend stores the access token in `localStorage` and sends it as a `Bearer` header.
- The frontend axios interceptor (`axios-customize.ts`) automatically calls `/api/v1/auth/refresh` on 401 responses using a `Mutex` to prevent concurrent refresh requests.
- Logout invalidates the token and clears the cookie.

## Frontend Architecture

### Tech Stack

- **Build Tool**: Vite with `@vitejs/plugin-react-swc`
- **Routing**: React Router v6 (declared in `App.tsx`)
- **Styling**: Tailwind CSS + shadcn/ui components (in `components/ui/`)
- **State Management**: Redux Toolkit for auth/account state; TanStack React Query for server state
- **HTTP Client**: Axios with custom interceptors for auth and token refresh

### Key Files

- **`src/App.tsx`** — Router definition and global auth initialization (checks `refresh_token` cookie, redirects to `/auth` if missing, fetches account if present).
- **`src/config/api.ts`** — All backend API calls are centralized here. Uses `axios-customize.ts` instance.
- **`src/config/axios-customize.ts`** — Axios instance with base URL from `VITE_BACKEND_URL`, credentials enabled, and automatic token refresh on 401.
- **`src/redux/slice/accountSlide.ts`** — Auth state slice (user info, `isAuthenticated`, `isLoading`).
- **`src/types/common.type.ts`** — Shared TypeScript interfaces for backend DTOs.

### Routing

| Path | Page |
|------|------|
| `/` | Home (Index) |
| `/auth` | Login/Register |
| `/lesson` | Lessons list |
| `/lesson/:id` | Lesson detail |
| `/games` | Games list |
| `/game/:id` | Game detail |
| `/profile` | User profile |
| `/admin` | Admin dashboard |

The `/admin` route is not role-guarded at the router level; the backend enforces authorization.

## Important Configuration Notes

**Port Conflict**: Both the backend (`application.yml`) and the frontend Vite dev server (`vite.config.ts`) are configured to run on port `8080`. During development, you must run them on different ports (e.g., change `server.port` in `application.yml` to `8081` and update `VITE_BACKEND_URL` accordingly).

**Database Credentials**: MySQL root password is `1012004` (configured in both `application.yml` and `docker-compose.yml`).

**File Storage Path**: The upload directory is hardcoded to `D:/Project/VietVibe/upload/`. On a different machine this path must exist or be updated in `application.yml`.

**JWT Secrets**: Access and refresh token base64 secrets are defined in `application.yml`.

**Supabase**: The frontend `.env` contains Supabase credentials, but the codebase appears to use them for storage integrations (see `src/integrations/supabase/`).

**TypeScript Strictness**: The frontend TypeScript config has `noImplicitAny: false`, `strictNullChecks: false`, and `noUnusedLocals: false`.
