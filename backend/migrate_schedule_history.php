<?php
/**
 * Migration Script: Add Schedule History Tracking
 * 
 * This script adds columns to predefined_schedules table and creates
 * predefined_schedule_history table for tracking schedule changes.
 * 
 * Run this script once via command line:
 * php migrate_schedule_history.php
 * 
 * Or via browser:
 * http://localhost/kolektrash/backend/migrate_schedule_history.php
 */

require_once("config/database.php");

try {
    $conn = (new Database())->connect();
    
    if (!$conn) {
        throw new Exception("Failed to connect to database");
    }
    
    echo "========================================\n";
    echo "Schedule History Tracking Migration\n";
    echo "========================================\n\n";
    
    // Step 1: Check and add columns to predefined_schedules
    echo "Step 1: Adding columns to predefined_schedules table...\n";
    
    $columnsToAdd = [
        'created_by' => "INT(11) NULL DEFAULT NULL",
        'updated_by' => "INT(11) NULL DEFAULT NULL",
        'deleted_by' => "INT(11) NULL DEFAULT NULL",
        'deleted_at' => "TIMESTAMP NULL DEFAULT NULL"
    ];
    
    foreach ($columnsToAdd as $columnName => $columnDef) {
        // Check if column exists
        $checkColumn = $conn->query("SHOW COLUMNS FROM predefined_schedules LIKE '$columnName'");
        if ($checkColumn->rowCount() > 0) {
            echo "  ✓ Column '$columnName' already exists, skipping...\n";
        } else {
            // Determine position (after is_active for created_by, then after previous)
            $position = ($columnName === 'created_by') ? 'AFTER is_active' : 
                       (($columnName === 'updated_by') ? 'AFTER created_by' :
                       (($columnName === 'deleted_by') ? 'AFTER updated_by' : 'AFTER deleted_by'));
            
            $sql = "ALTER TABLE predefined_schedules ADD COLUMN `$columnName` $columnDef $position";
            $conn->exec($sql);
            echo "  ✓ Added column '$columnName'\n";
        }
    }
    
    // Add indexes for foreign keys
    echo "\nStep 2: Adding indexes...\n";
    $indexes = ['created_by', 'updated_by', 'deleted_by'];
    foreach ($indexes as $indexColumn) {
        $checkIndex = $conn->query("SHOW INDEX FROM predefined_schedules WHERE Column_name = '$indexColumn'");
        if ($checkIndex->rowCount() > 0) {
            echo "  ✓ Index on '$indexColumn' already exists, skipping...\n";
        } else {
            $sql = "ALTER TABLE predefined_schedules ADD INDEX idx_$indexColumn (`$indexColumn`)";
            $conn->exec($sql);
            echo "  ✓ Added index on '$indexColumn'\n";
        }
    }
    
    // Add foreign key constraints (with error handling for existing constraints)
    echo "\nStep 3: Adding foreign key constraints...\n";
    $foreignKeys = [
        'fk_predefined_schedules_created_by' => ['created_by', 'user', 'user_id'],
        'fk_predefined_schedules_updated_by' => ['updated_by', 'user', 'user_id'],
        'fk_predefined_schedules_deleted_by' => ['deleted_by', 'user', 'user_id']
    ];
    
    foreach ($foreignKeys as $constraintName => $details) {
        list($column, $refTable, $refColumn) = $details;
        
        // Check if constraint already exists
        $checkConstraint = $conn->query("
            SELECT CONSTRAINT_NAME 
            FROM information_schema.TABLE_CONSTRAINTS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'predefined_schedules' 
            AND CONSTRAINT_NAME = '$constraintName'
        ");
        
        if ($checkConstraint->rowCount() > 0) {
            echo "  ✓ Foreign key '$constraintName' already exists, skipping...\n";
        } else {
            try {
                $sql = "ALTER TABLE predefined_schedules 
                        ADD CONSTRAINT $constraintName
                        FOREIGN KEY (`$column`) REFERENCES `$refTable` (`$refColumn`)
                        ON DELETE SET NULL ON UPDATE CASCADE";
                $conn->exec($sql);
                echo "  ✓ Added foreign key '$constraintName'\n";
            } catch (PDOException $e) {
                // If constraint already exists or other error, log it
                if (strpos($e->getMessage(), 'Duplicate key name') !== false || 
                    strpos($e->getMessage(), 'already exists') !== false) {
                    echo "  ⚠ Foreign key '$constraintName' already exists (skipping)\n";
                } else {
                    throw $e;
                }
            }
        }
    }
    
    // Step 4: Create predefined_schedule_history table
    echo "\nStep 4: Creating predefined_schedule_history table...\n";
    
    $checkTable = $conn->query("SHOW TABLES LIKE 'predefined_schedule_history'");
    if ($checkTable->rowCount() > 0) {
        echo "  ✓ Table 'predefined_schedule_history' already exists, skipping...\n";
    } else {
        $sql = "CREATE TABLE `predefined_schedule_history` (
          `history_id` INT(11) NOT NULL AUTO_INCREMENT,
          `schedule_template_id` INT(11) NOT NULL,
          `action` ENUM('create', 'update', 'delete', 'restore') NOT NULL,
          `actor_user_id` INT(11) NOT NULL,
          `actor_role` VARCHAR(50) NULL DEFAULT NULL COMMENT 'Cached role name for quick display',
          `changed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `before_payload` JSON NULL DEFAULT NULL COMMENT 'Schedule data before the change',
          `after_payload` JSON NULL DEFAULT NULL COMMENT 'Schedule data after the change',
          `remarks` TEXT NULL DEFAULT NULL COMMENT 'Optional notes about the change',
          PRIMARY KEY (`history_id`),
          INDEX `idx_schedule_template_id` (`schedule_template_id`),
          INDEX `idx_actor_user_id` (`actor_user_id`),
          INDEX `idx_action` (`action`),
          INDEX `idx_changed_at` (`changed_at`),
          CONSTRAINT `fk_schedule_history_schedule`
            FOREIGN KEY (`schedule_template_id`) REFERENCES `predefined_schedules` (`schedule_template_id`)
            ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT `fk_schedule_history_actor`
            FOREIGN KEY (`actor_user_id`) REFERENCES `user` (`user_id`)
            ON DELETE RESTRICT ON UPDATE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
        COMMENT='Audit log for all predefined schedule changes'";
        
        $conn->exec($sql);
        echo "  ✓ Created table 'predefined_schedule_history'\n";
    }
    
    echo "\n========================================\n";
    echo "Migration completed successfully!\n";
    echo "========================================\n\n";
    echo "Next steps:\n";
    echo "1. Update API files to log history when schedules are created/updated/deleted\n";
    echo "2. Create API endpoint to retrieve schedule history\n";
    echo "3. Add History button to ManageSchedule.jsx frontend component\n";
    
} catch (Exception $e) {
    echo "\n========================================\n";
    echo "ERROR: Migration failed!\n";
    echo "========================================\n";
    echo "Error: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "1. Database connection settings in config/database.php\n";
    echo "2. Database user has ALTER and CREATE TABLE permissions\n";
    echo "3. No other processes are locking the tables\n";
    exit(1);
}
?>

