-- Add session tracking for schedules and teams plus attendance snapshots
ALTER TABLE collection_schedule
    ADD COLUMN session ENUM('AM','PM') NOT NULL DEFAULT 'AM' AFTER scheduled_date;

ALTER TABLE collection_team
    ADD COLUMN session ENUM('AM','PM') NOT NULL DEFAULT 'AM' AFTER driver_id,
    ADD COLUMN attendance_snapshot TEXT NULL AFTER session;

ALTER TABLE predefined_schedules
    ADD COLUMN session ENUM('AM','PM') NOT NULL DEFAULT 'AM' AFTER day_of_week;





