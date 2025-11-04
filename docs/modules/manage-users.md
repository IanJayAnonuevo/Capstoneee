# Manage Users Module

## Overview
The Manage Users module gives administrators a central dashboard to review, filter, and onboard residents, barangay heads, truck drivers, and garbage collectors. It focuses on quick look-ups and account creation without exposing admin credentials.

- **Frontend entry point:** `src/components/admin/ManageUsers.jsx`
- **Route:** `/admin/users` (protected by `RequireAuth` with `admin` role)
- **Sidebar link:** `src/components/admin/Sidebar.jsx` → "Manage Users"
- **Primary APIs:**
  - `backend/api/get_all_users.php` – retrieves all non-admin accounts
  - `backend/api/register_personnel.php` – creates new truck driver/collector accounts
  - `backend/api/get_clusters.php` – supplies cluster filter options for resident/barangay head views

## Core Features
- Role, status, cluster, and text filters for quick searching
- Summary cards for staff on duty / off duty / on leave counts
- "Create Account" modal for registering new staff
- Status badges for staff duty state and overall account activity
- Responsive card layout optimised for tablet/desktop

## Core Code Highlights
- `useEffect(fetchUsers)` – on mount fetches `/backend/api/get_all_users.php`, strips admin accounts, and populates `users` state.
- `filteredUsers` memo – combines text search, role filters, staff duty filter, and cluster filter before rendering cards.
- `Create Account` handler – submits JSON payload to `/backend/api/register_personnel.php`, then refreshes list on success.
- `getStatusColor` + badges – maps staff duty states to consistent palette for quick scanning.
- UI wiring in `ManageUsers.jsx` – card grid with menu stubs (`View/Edit/Deactivate`) ready for future backend hooks.

## Data Flow
```mermaid
graph TD
  A[Admin visits /admin/users] --> B[ManageUsers.jsx fetchUsers()]
  B -->|GET| C[get_all_users.php]
  C -->|JSON users| B
  B --> D[Filter + render cards]
  A -->|New account| E[Create Account modal]
  E -->|POST| F[register_personnel.php]
  F -->|Success| B
```

## Dependencies & Integration Points
- **Services:** relies on native `fetch` calls from the component; no shared service wrapper yet.
- **State management:** local React state; no Redux or context involvement.
- **Auth:** route is protected by `RequireAuth` in `App.jsx`.
- **Backend tables:** `user_profile`, `users`, `barangay`, `clusters` (depending on schema naming).

## Extending the Module
- Hook in bulk actions (activate/deactivate multiple users) by adding new backend endpoints and multi-select UI.
- Surface audit history or last login by extending the API payload.
- Replace `alert` calls with toast notifications for better UX.

## Quick Test Checklist
1. Log in as admin, navigate to `/admin/users`.
2. Verify user cards render and filters work (role, status, cluster).
3. Use "Create Account" and check success response plus DB row.
4. Confirm staff status badges update after backend change (if combined with route assignments).
5. Ensure non-admin roles cannot access the route (auth guard).
