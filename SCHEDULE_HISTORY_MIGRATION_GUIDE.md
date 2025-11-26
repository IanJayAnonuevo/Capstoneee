# Schedule History Tracking - Migration Guide

## Overview

This migration adds the ability to track who created, edited, or deleted schedules in the Manage Schedule page. This is important because both **Admin** and **Foreman** can manage schedules, and you need to see who made what changes.

## What This Migration Does

### 1. Adds Columns to `predefined_schedules` Table

- **`created_by`** - Stores the user_id of who created the schedule
- **`updated_by`** - Stores the user_id of who last updated the schedule  
- **`deleted_by`** - Stores the user_id of who deleted the schedule
- **`deleted_at`** - Stores the timestamp when the schedule was deleted

### 2. Creates `predefined_schedule_history` Table

This is a complete audit log table that stores:
- **`history_id`** - Primary key
- **`schedule_template_id`** - Which schedule was changed
- **`action`** - What action was performed (create, update, delete, restore)
- **`actor_user_id`** - Who performed the action (admin or foreman)
- **`actor_role`** - Cached role name for quick display
- **`changed_at`** - When the change happened
- **`before_payload`** - JSON snapshot of schedule data before change
- **`after_payload`** - JSON snapshot of schedule data after change
- **`remarks`** - Optional notes about the change

## How to Run the Migration

### Option 1: Using PHP Script (Recommended)

1. **Open your terminal/command prompt**
2. **Navigate to the backend folder:**
   ```bash
   cd C:\xampp\htdocs\kolektrash\backend
   ```

3. **Run the migration script:**
   ```bash
   php migrate_schedule_history.php
   ```

   Or if you're using XAMPP, you can also run it via browser:
   ```
   http://localhost/kolektrash/backend/migrate_schedule_history.php
   ```

### Option 2: Using SQL File Directly

1. **Open phpMyAdmin** (usually at `http://localhost/phpmyadmin`)
2. **Select your database** (`kolektrash_db`)
3. **Go to the "SQL" tab**
4. **Copy and paste the contents of `add_schedule_history_tracking.sql`**
5. **Click "Go" to execute**

### Option 3: Using MySQL Command Line

```bash
mysql -u root -p kolektrash_db < add_schedule_history_tracking.sql
```

## Verification

After running the migration, verify it worked:

### Check Columns Added

```sql
SHOW COLUMNS FROM predefined_schedules;
```

You should see:
- `created_by`
- `updated_by`
- `deleted_by`
- `deleted_at`

### Check History Table Created

```sql
SHOW TABLES LIKE 'predefined_schedule_history';
```

Should return 1 row.

### Check Table Structure

```sql
DESCRIBE predefined_schedule_history;
```

Should show all the columns listed above.

## What Happens Next?

After running this migration, you need to:

1. **Update API files** to log history when schedules are:
   - Created (`create_predefined_schedule.php`)
   - Updated (`update_predefined_schedule.php`, `update_predefined_schedule_by_fields.php`)
   - Deleted (`delete_predefined_schedule.php`)

2. **Create API endpoint** to retrieve schedule history:
   - `get_schedule_history.php` - to fetch history records

3. **Add History button** to the frontend:
   - Update `ManageSchedule.jsx` to add a History button
   - Create a modal/component to display the history

## Troubleshooting

### Error: "Column already exists"
- This means the migration was already run. This is safe to ignore.

### Error: "Table already exists"
- The history table was already created. This is safe to ignore.

### Error: "Foreign key constraint fails"
- Make sure the `user` table exists and has data
- Check that user_id values in your database are valid

### Error: "Access denied"
- Make sure your database user has `ALTER TABLE` and `CREATE TABLE` permissions
- Check `config/database.php` for correct database credentials

## Rollback (If Needed)

If you need to undo this migration:

```sql
-- Remove foreign key constraints first
ALTER TABLE predefined_schedules 
DROP FOREIGN KEY fk_predefined_schedules_created_by,
DROP FOREIGN KEY fk_predefined_schedules_updated_by,
DROP FOREIGN KEY fk_predefined_schedules_deleted_by;

-- Drop columns
ALTER TABLE predefined_schedules 
DROP COLUMN deleted_at,
DROP COLUMN deleted_by,
DROP COLUMN updated_by,
DROP COLUMN created_by;

-- Drop history table
DROP TABLE IF EXISTS predefined_schedule_history;
```

## Notes

- The migration is **safe to run multiple times** - it checks if columns/tables exist before creating them
- Existing schedules will have `NULL` values for `created_by`, `updated_by`, etc. (this is expected)
- New schedules created after migration will automatically track who created them
- The history table will start empty and populate as schedules are modified

