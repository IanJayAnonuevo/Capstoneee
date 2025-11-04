# Kolektrash Feature Gap & Enhancement Report

This document summarizes, per role, the features that exist today, functions that appear missing/not yet implemented, and concrete enhancement opportunities. Coverage is based on current frontend routes/components and backend APIs present in the repository.

- Scope: Admin, Truck Driver, Garbage Collector, Barangay Head, Resident
- Sources: `src/App.jsx` routes; role dashboards/components; backend APIs under `backend/api`; internal guides/readmes.

## Admin

Implemented (UI/APIs present)
- Dashboard: `src/components/admin/Dashboard.jsx`
- Manage Users: `src/components/admin/ManageUsers.jsx`, `backend/api/get_all_users.php`, `backend/api/update_user_status.php`, `backend/api/register_personnel.php`, `backend/api/register_resident.php`
- Manage Routes: `src/components/admin/ManageRoute.jsx`, `backend/api/get_routes.php`, `backend/api/get_scheduled_routes.php`, `backend/lib/RouteGenerator.php`
- Manage Schedule: `src/components/admin/ManageSchedule.jsx`, `backend/api/get_predefined_schedules.php`, `backend/api/create_missing_schedules.php`, `backend/api/update_predefined_schedule_by_fields.php`
- Task Management: `src/components/admin/TaskManagement.jsx`, `backend/api/assign_task.php`, `backend/api/get_all_task_assignments.php`, `backend/api/update_assignment.php`, `backend/api/delete_assignment.php`
- Special Pick-up Requests: `src/components/admin/PickupSimple.jsx`, `backend/api/submit_pickup_request.php`, `backend/api/get_pickup_requests.php`, `backend/api/update_pickup_request_status.php`
- Barangay Activity: `src/components/admin/BarangayActivity.jsx`, `BarangayActivityNew.jsx`, `backend/api/get_barangays.php`, `backend/api/update_barangays.php`
- Issues: `src/components/admin/Issues.jsx`, `backend/api/get_issues.php`
- Feedback: `backend/api/get_feedback.php`, `src/components/resident/Feedback.jsx` (submit side)

Missing / To-be-implemented
- Role-based sidebars for non-admin already noted in `src/App.jsx` (comment suggests future sidebars). Admin can remain as is, but cross-role sidebar framework could be centralized.
- Real assignment tracking (ROUTE_MANAGEMENT_README.md notes simulated driver/truck assignment and random collection points).
- End-to-end employee model alignment (DATABASE_MIGRATION_GUIDE.md proposes separating `users` vs `employees`; code still mixes roles in `users` in many places).

Enhancements
- Replace simulated route assignment with real `collection_team` linkage and live statuses.
- Add bulk operations in `ManageUsers` (bulk activate/deactivate; assign cluster/area; role change workflows).
- Audit logging for admin actions (status changes, assignments, schedule updates).
- Server-side filtering/sorting/pagination for Issues/Feedback/Users to reduce payloads.

## Truck Driver

Implemented (UI/APIs present)
- Dashboard & Navigation: `src/components/truckdriver/TruckDriverDashboard.jsx`, `TruckDriverHome.jsx`
- Routes & Live Run: `TruckDriverRoutes.jsx`, `RouteRun.jsx`, GPS posting via `backend/api/post_gps.php`
- Tasks: `TruckDriverTask.jsx`, assignments via `backend/api/get_task_assignment.php`, `respond_assignment.php`
- Schedule: `TruckDriverCollectionSchedule.jsx` (conditional visibility per `PERSONNEL_SCHEDULE_VIEWING_FEATURE.md`), `backend/api/get_personnel_schedule.php?role=driver`
- Vehicle: `TruckDriverVehicle.jsx`
- Notifications: `TruckDriverNotifications.jsx`
- Settings: `TruckDriverSettings.jsx`, `src/services/truckDriverService.js`, `backend/api/get_truck_driver.php`, `update_truck_driver.php`, password/profile via `update_profile.php`
- Self status updates: see `STAFF_STATUS_MANAGEMENT_GUIDE.md`, `backend/run_status_migration.php`, `backend/api/update_user_status.php`

Missing / To-be-implemented
- Offline-first GPS buffering and resend; current `TruckDriverRoutes.jsx` has basic throttling but no offline queue.
- Route completion flow with proof-of-service (photos, signatures, timestamps) tied to schedule/task.
- Vehicle inspection checklist pre/post-trip.

Enhancements
- Background geolocation with energy-aware sampling; jitter protection; privacy toggle.
- Clear states for task lifecycle (assigned → accepted → en-route → completed → exception) with UI prompts.
- In-app incident reporting shortcut (driver-specific) linking to Issues API with auto-tagging.

## Garbage Collector

Implemented (UI/APIs present)
- Dashboard & Navigation: `GarbageCollectorDashboard.jsx`/`_new.jsx`, `GarbageCollectorHome.jsx`
- Tasks: `GarbageCollectorTasks.jsx`, `backend/api/get_task_assignment.php`, `respond_assignment.php`
- Routes: `GarbageCollectorRoutes.jsx`
- Schedule: `GarbageCollectorSchedule.jsx`, `backend/api/get_personnel_schedule.php?role=collector`
- Notifications: `GarbageCollectorNotifications.jsx`
- Settings: `GarbageCollectorSettings.jsx`, `src/services/garbageCollectorService.js`, `backend/api/get_garbage_collector.php`, `update_garbage_collector.php`
- Self status updates: per `STAFF_STATUS_MANAGEMENT_GUIDE.md`

Missing / To-be-implemented
- On-route bin-level logging (filled level, contamination flags) and time-at-stop metrics.
- Team coordination view (see who else accepted / is en-route for same schedule).

Enhancements
- Scan-and-log (QR/NFC) at collection points; photo attachments for exceptions.
- Safety checklist and microbreak reminders; simple ergonomics tips module.

## Barangay Head

Implemented (UI/APIs present)
- Dashboard & Navigation: `BarangayHeadDashboard.jsx`, `Home.jsx`
- Report Issue: `ReportIssue.jsx`, backend `submit_issue_report.php`
- Special Pick-up Request: `PickupRequest.jsx`, `backend/api/submit_pickup_request.php`
- Schedule view: `CollectionSchedule.jsx`
- Collection Reports & Appointments (routes present; verify APIs if needed)
- IEC: `IEC.jsx`
- Notifications: `BarangayHeadNotifications.jsx`
- Settings: `BarangayHeadSettings.jsx`
- Barangay Head data API: `backend/api/get_barangay_head.php`

Missing / To-be-implemented
- Approvals workflow for requests (approve/decline with notes) distinct from admin.
- Aggregated barangay KPIs (complaints resolved, on-time collection rate, feedback trends).

Enhancements
- Two-way messaging with assigned MENRO team; broadcast announcements to residents.
- Export CSV/PDF of barangay schedules, requests, and reports.

## Resident

Implemented (UI/APIs present)
- Dashboard & Navigation: `ResidentDashboard.jsx`, `ResidentHome.jsx`
- Report Issue: `ResidentReport.jsx`, `backend/api/submit_issue_report.php`
- View Collection Schedule: `ResidentSchedule.jsx`, schedule APIs
- IEC Materials: `ResidentIEC.jsx`
- Notifications: `ResidentNotifications.jsx`
- Feedback: `src/components/resident/Feedback.jsx`, `backend/api/submit_feedback.php`
- Settings: `ResidentSettings.jsx`, `backend/api/get_resident.php`, `get_resident_profile.php`, `update_profile.php`

Missing / To-be-implemented
- Real-time truck ETA per barangay/route (requires live positions and matching to routes).
- Pickup appointment requests (household bulky items) separate from barangay special requests.

Enhancements
- Subscription preferences for alerts (route changes, ETA windows, IEC campaigns).
- Resident badge/points for proper segregation or on-time set-out (gamified IEC).

## Cross-Cutting Gaps

- Authentication/Authorization
  - `src/components/auth/Login.jsx` routes users by `role`, but role strings vary: e.g., `barangay_head` vs `barangayhead`, `truck_driver` vs `truckdriver`. Normalize role values across frontend and backend.
  - Consider migrating to split `users` vs `employees` per `DATABASE_MIGRATION_GUIDE.md` and update APIs accordingly.

- Data Model
  - Route Management doc notes simulated data; move to real `collection_team` and member tables. Ensure schedules link to team, truck, driver, and collectors.

- Observability
  - Add server logs/metrics around key flows: login, assignment responses, schedule generation, GPS ingestion, issue/feedback submissions.

## Prioritized Next Steps

1) Normalize roles and align to `employees` vs `users` model (breaking change, plan migration)
2) Implement real assignment data model and UI updates (driver/collector/route lifecycle)
3) Add proofs-of-service and ETA features (unblocks resident UX and KPI accuracy)
4) Add approvals and messaging for barangay head workflows

## File Index (for reference)

- Frontend routes: `src/App.jsx`
- Admin: `src/components/admin/*`
- Truck Driver: `src/components/truckdriver/*`, `src/services/truckDriverService.js`
- Garbage Collector: `src/components/garbagecollector/*`, `src/services/garbageCollectorService.js`
- Barangay Head: `src/components/barangayhead/*`
- Resident: `src/components/resident/*`
- Auth: `src/components/auth/*`, `src/services/authService.js`
- Backend APIs: `backend/api/*`
- Guides: `ROUTE_MANAGEMENT_README.md`, `PERSONNEL_SCHEDULE_VIEWING_FEATURE.md`, `STAFF_STATUS_MANAGEMENT_GUIDE.md`, `DATABASE_MIGRATION_GUIDE.md`, `GARBAGE_COLLECTOR_SETTINGS_README.md`, `TRUCK_DRIVER_SETTINGS_README.md`


