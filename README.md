# KOLEKTRASH (Waste Collection Management System)

A role-based waste collection management system for Admins, Truck Drivers, Garbage Collectors, Barangay Heads, and Residents.

This README is structured for quick onboarding and prelim defense preparation.

## 1) System Overview

KOLEKTRASH streamlines municipal solid waste collection through role-based workflows, daily route scheduling, task assignment, notifications, and citizen engagement (issue reporting, schedules, feedback).

- Frontend: React + Vite (SPA) under the project root `src/`
- Backend: PHP (procedural + helpers) under `backend/` with REST-like endpoints in `backend/api/`
- Database: MySQL/MariaDB (PDO, prepared statements)
- Deployment: Static build to `dist/` + PHP API hosted together (e.g., Hostinger cPanel)

## 2) Core Features by Role

- Admin
  - Manage users, routes, daily schedules, and assignments
  - Monitor barangay activities, issues, feedback
  - Approve/manage special pickup requests
- Truck Driver
  - View assigned routes and tasks, run live route view
  - Receive notifications and update task status
- Garbage Collector
  - View tasks, schedules, and assigned routes
  - Update progress and receive notifications
- Barangay Head
  - Submit special pickup requests, view schedules, IEC
  - Monitor barangay issues and notifications
- Resident
  - View collection schedules and IEC
  - Report issues and submit feedback

See role guides in `docs/roles/` for more details.

## 3) Tech Stack

- React 18 + Vite + Tailwind CSS
- PHP 7.4+ (PDO) + MySQL/MariaDB
- PHPMailer for transactional email (password reset, signup verification)
- Leaflet (map assets present) for route visualization

## 4) Project Structure

```
kolektrash/
├─ backend/
│  ├─ api/                 # All PHP API endpoints
│  ├─ config/              # database.php, email.php
│  ├─ includes/            # CORS and shared includes
│  ├─ lib/                 # Helpers (AssignmentResolver, EmailHelper, RouteGenerator)
│  ├─ models/              # Simple model helpers (e.g., hash.php, User.php)
│  ├─ logs/                # Server-side logs
│  └─ README.md            # Backend-specific setup
├─ cron/                   # Server-side scripts to generate routes/tasks
├─ docs/                   # Role guides and internal docs
├─ dist/                   # Production frontend build output
├─ public/                 # Public assets used by Vite
├─ src/                    # React source (components, services, config)
│  ├─ components/          # 65+ components by role
│  ├─ services/            # API service modules (auth, trucks, collectors, etc.)
│  └─ config/api.js        # Frontend API base URL
├─ index.html              # Vite entry
├─ vite.config.js
└─ README.md               # This file
```

## 5) Local Development Setup

Prerequisites:
- Node.js 18+
- XAMPP/WAMP/MAMP with PHP 7.4+ and MySQL/MariaDB

Steps:
1. Backend (PHP + MySQL)
  - Create a database (e.g., `kolektrash_db`).
   - Import your schema and any migration helpers under `backend/`. See `DATABASE_MIGRATION_GUIDE.md`, `ASSIGNMENT_TABLE_MIGRATION_GUIDE.md`, and scripts like `backend/run_status_migration.php`.
   - Configure `backend/config/database.php`:
     ```php
     private $host = 'localhost';
  private $db_name = 'kolektrash_db';
     private $username = 'root';
     private $password = '';
     ```
   - Configure email creds in `backend/config/email.php` if using email features (forgot password, signup verification).

2. Frontend (React + Vite)
   - From project root:
     ```bash
     npm install
     npm run dev
     ```
   - Ensure API base URL in `src/config/api.js` points to your local backend, e.g.:
     ```javascript
     export const API_BASE_URL = 'http://localhost/kolektrash/backend';
     ```

Access the app at the Vite dev URL (usually `http://localhost:5173`). PHP endpoints are under `http://localhost/kolektrash/backend/api/` when served by XAMPP.

## 6) Building and Deployment

Build frontend for production:
```bash
npm run build
```
This outputs to `dist/`.

Hostinger (shared hosting) quick guide:
- Upload `dist/*` to `public_html/`
- Upload entire `backend/` to `public_html/backend/`
- Create `uploads/` directories as needed (see `HOSTINGER_DEPLOYMENT_GUIDE.md`)
- Update `backend/config/database.php` and `backend/config/email.php` with production values
- Ensure all API URLs in frontend services point to your domain (HTTPS)

See `HOSTINGER_DEPLOYMENT_GUIDE.md` for a step-by-step checklist.

## 7) Important Backend Endpoints (sample)

All endpoints live under `backend/api/`. Common ones include:
- Authentication & Users: signup, login, forgot password, signup verification
- Notifications: get, delete
- Routes & Tasks: generate, get schedules, run status updates
- Special Pickup Requests: `submit_pickup_request.php`, `get_pickup_requests.php`, `update_pickup_request_status.php`

For pickup request details, see `PICKUP_REQUEST_API_README.md`.

## 8) Data & Migrations

- Review `DATABASE_MIGRATION_GUIDE.md` and `ASSIGNMENT_TABLE_MIGRATION_GUIDE.md` for schema changes
- Utility scripts: `backend/run_status_migration.php`, `backend/migrate_to_collection_team.php`, `backend/update_daily_priority_schedules.sql`
- Cron helpers: `cron/generate_routes.php`, `cron/generate_tasks.php`

## 9) Demo Script (Prelim Defense)

Suggested 8–10 minute flow:
1. Problem & Goal (30s)
  - Urban waste collection inefficiencies; KOLEKTRASH provides scheduling, routing, role-based tasks, and citizen feedback.
2. Architecture (60s)
  - React SPA + PHP API + MySQL; brief on `src/`, `backend/api/`, and deployment to Hostinger.
3. Roles & Features (2–3 min)
   - Show quick role switch or screenshots: Admin (manage routes/tasks), Truck Driver (assigned routes), Garbage Collector (tasks), Barangay Head (special pickup), Resident (schedules/report).
4. Live Demo (3–4 min)
   - Signup/login; view schedules; submit a special pickup request; as Admin, approve/schedule; show notifications update.
5. Data & Security (60–90s)
   - PDO prepared statements, password hashing, email-based flows, CORS include, logs.
6. Roadmap (30–45s)
   - Optimizations (route generation, mobile PWA, analytics, SMS/email alerts), see `FEATURES_GAP_ANALYSIS.md`.

Tip: Prepare demo accounts and seed data; test flows end-to-end beforehand.

## 10) Troubleshooting

- White screen / API 404
  - Verify XAMPP path: `C:\xampp\htdocs\kolektrash\backend\` and endpoints under `/backend/api/`
- CORS errors
  - Confirm frontend base URL matches backend and that `backend/includes/cors.php` is included where needed
- Database connection errors
  - Re-check `backend/config/database.php` credentials; ensure MySQL service is running
- Email not sending
  - Configure `backend/config/email.php` with SMTP app password; check host firewall

## 11) References & Docs

- Role Guides: `docs/roles/` (Admin, TruckDriver, GarbageCollector, BarangayHead, Resident)
- Pickup Requests API: `PICKUP_REQUEST_API_README.md`
- Hostinger Deployment: `HOSTINGER_DEPLOYMENT_GUIDE.md`
- Features/Gap Notes: `FEATURES_GAP_ANALYSIS.md`

---

## 12) README (Tagalog Quick Guide)

Layunin: Mas mabilis na maipakita ang sistema sa prelim defense.

- Ano ang KOLEKTRASH: Role-based na sistema para sa scheduling, routing, tasks, at reports.
- Paano patakbuhin (local):
  1) I-setup ang DB sa XAMPP (gawa ng database at import schema)
  2) Ayusin `backend/config/database.php` at `backend/config/email.php`
  3) Frontend: `npm install` at `npm run dev`
  4) I-check `src/config/api.js` na tama ang base URL (hal. `http://localhost/kolektrash/backend`)
- Demo flow: Mag-login, tingnan ang schedule, mag-submit ng special pickup (Barangay Head), aprubahan/schedule ng Admin, tingnan ang notifications at status update.

Good luck sa defense!

## 13) Deep Dive: Mapping & Tracking (Defense-Ready)

Purpose: Visualize routes/tasks on a map and track run status from the driver’s UI.

Architecture:
- Frontend map views in `src/components/truckdriver/RouteRun.jsx`, `src/components/truckdriver/TruckDriverRoutes.jsx`, and related role pages use Leaflet (assets in `public/` and `dist/`).
- Backend provides schedule/team/task data via endpoints in `backend/api/` (e.g., schedules, assignments, notifications, run-status updates).

Data Flow:
1) Admin/cron generates schedules and teams for a date → database rows in `collection_schedule`, `collection_team`, `collection_team_member`.
2) Truck Driver loads assigned routes for the day → frontend fetches API and renders markers/polyline.
3) Driver updates run progress (e.g., start, in-progress, completed) → backend updates status and sends notifications.

Key UI Elements (truck driver side):
- List of assigned routes for selected date
- Map with markers per barangay/stop; optional polyline for sequence
- Actions: Start Run, Complete Stop, Finish Route

Demo Script (3–4 min):
1. Log in as Truck Driver → open `Routes` then `Route Run`.
2. Select today’s assignment → map displays markers for barangays/stops.
3. Click Start Run → status changes to in-progress; show marker highlighting/current stop.
4. Complete one stop → marker style updates; show notification entry if implemented.
5. Finish route → status becomes completed; reflect in driver dashboard.

Talking Points:
- Map assets and Leaflet integration for light footprint.
- Status transitions stored in DB to support audit and notifications.
- CORS managed via `backend/includes/cors.php`; minimal payloads for performance.

## 14) Deep Dive: Create Route Based on Schedule (Defense-Ready)

Purpose: Auto-generate daily collection tasks and teams from predefined schedule rules.

Core Backend Components:
- `backend/api/generate_tasks_from_predefined.php` → main generator endpoint
- `backend/config/cron.php` → token/IP guarded cron helper for secure scheduled runs
- Related cron scripts: `cron/generate_routes.php`, `cron/generate_tasks.php`

How It Works:
1) Reads `predefined_schedules` (active rows only) and computes matches per day:
   - `day_of_week` match; optional `week_of_month` for clustered schedules
2) Checks duplicates in `collection_schedule` and respects `overwrite`
3) Selects available personnel and trucks:
   - Drivers (role_id=3), Collectors (role_id=4), Trucks with `status=available`
   - Enforces minimum counts; builds 3-collector teams per assignment
   - Fixed pairing: Priority vs Clustered barangays (balanced rotation by day-of-year)
4) Inserts:
   - `collection_schedule` row per matched barangay/date/time
   - `collection_team` with selected truck/driver
   - `collection_team_member` for each collector
5) Aggregates notification payloads per recipient (driver/collectors) and inserts `notification` rows

Inputs (POST JSON):
```json
{
  "start_date": "2025-10-06",
  "end_date": "2025-10-06",
  "overwrite": false
}
```

Secure GET for Cron (example):
```
/backend/api/generate_tasks_from_predefined.php?token=YOUR_SECRET&period=tomorrow&overwrite=0
```
- Token validated by `cron_is_token_valid()`; optional IP allowlist via `cron_is_ip_allowed()` in `backend/config/cron.php`.

Successful Response (trimmed):
```json
{
  "success": true,
  "message": "Tasks generated successfully from predefined schedules",
  "total_generated": 12,
  "skipped_duplicates": 3
}
```

Demo Script (2–3 min):
1. Show `predefined_schedules` concept (priority vs clustered, weekly clusters).
2. Run generator:
   - Local POST via REST client, or
   - Secure GET with cron token/period=tomorrow
3. Show response summary → then query the driver UI to see newly assigned route.

Defense Talking Points:
- Deterministic generation with guardrails (minimum personnel/trucks, no weekends, duplicate checks).
- Separation of concerns: schedule logic in API; cron wrapper for automation.
- Notifications aggregated per recipient to reduce noise.
