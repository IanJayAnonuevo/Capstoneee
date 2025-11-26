# Database Migrations - KolekTrash Live Map Enhancement

## Overview
Mga SQL migration scripts para sa live map features ng KolekTrash system.

## Migration Files

### 001_add_truck_status.sql
**Purpose**: Dagdagan ang `gps_route_log` table ng status tracking
- Adds `truck_status` column (idle, moving, full_load)
- Adds `route_id` column para sa route association
- Creates indexes para sa performance

### 002_add_collection_point_status.sql
**Purpose**: Dagdagan ang `collection_point` table ng status at geofencing
- Adds `status` column (pending, completed)
- Adds `last_collected` timestamp
- Adds `geofence_radius` para sa automatic detection

### 003_create_route_path_history.sql
**Purpose**: Gumawa ng bagong table para sa route visualization
- Creates `route_path_history` table
- Stores planned routes (gray line)
- Stores actual paths (colored line)

## How to Run Migrations

### Option 1: Using phpMyAdmin
1. Open phpMyAdmin
2. Select `kolektrash` database
3. Go to SQL tab
4. Copy-paste each migration file content
5. Click "Go" to execute

### Option 2: Using MySQL Command Line
```bash
# Navigate to migrations folder
cd c:\xampp\htdocs\kolektrash\migrations

# Run each migration
mysql -u root -p kolektrash < 001_add_truck_status.sql
mysql -u root -p kolektrash < 002_add_collection_point_status.sql
mysql -u root -p kolektrash < 003_create_route_path_history.sql
```

### Option 3: Using MySQL Workbench
1. Open MySQL Workbench
2. Connect to your database
3. Open each .sql file
4. Execute the script

## Verification

After running migrations, verify the changes:

```sql
-- Check gps_route_log
DESCRIBE gps_route_log;

-- Check collection_point
DESCRIBE collection_point;

-- Check route_path_history
DESCRIBE route_path_history;

-- Verify all new columns exist
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'kolektrash'
  AND (
    (TABLE_NAME = 'gps_route_log' AND COLUMN_NAME IN ('truck_status', 'route_id'))
    OR (TABLE_NAME = 'collection_point' AND COLUMN_NAME IN ('status', 'last_collected', 'geofence_radius'))
    OR TABLE_NAME = 'route_path_history'
  )
ORDER BY TABLE_NAME, ORDINAL_POSITION;
```

## Rollback (If Needed)

Kung may problema, pwede mong i-rollback ang changes:

```sql
-- Rollback 001_add_truck_status.sql
ALTER TABLE gps_route_log DROP COLUMN truck_status;
ALTER TABLE gps_route_log DROP COLUMN route_id;
ALTER TABLE gps_route_log DROP INDEX idx_route_id;
ALTER TABLE gps_route_log DROP INDEX idx_truck_status;

-- Rollback 002_add_collection_point_status.sql
ALTER TABLE collection_point DROP COLUMN status;
ALTER TABLE collection_point DROP COLUMN last_collected;
ALTER TABLE collection_point DROP COLUMN geofence_radius;
ALTER TABLE collection_point DROP INDEX idx_status;
ALTER TABLE collection_point DROP INDEX idx_last_collected;

-- Rollback 003_create_route_path_history.sql
DROP TABLE IF EXISTS route_path_history;
```

## Important Notes

⚠️ **BACKUP FIRST**: I-backup ang database bago mag-run ng migrations!

```bash
# Backup command
mysqldump -u root -p kolektrash > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

✅ **Test on Development**: I-test muna sa development environment bago sa production

📝 **Track Changes**: I-document ang lahat ng changes sa version control
