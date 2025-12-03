<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: text/html; charset=utf-8');
require_once '../config/database.php';

echo "<!DOCTYPE html><html><head><title>Add Missing Columns to collection_schedule</title>";
echo "<style>body{font-family:monospace;padding:20px;background:#1a1a1a;color:#0f0;}";
echo ".success{color:#0f0;} .error{color:#f00;} .info{color:#ff0;}</style></head><body>";
echo "<h2>Adding Missing Columns to collection_schedule</h2>";

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "<p class='info'>Connected to database</p>";
    
    // Check and add schedule_type column
    echo "<h3>1. Adding schedule_type column...</h3>";
    try {
        $db->exec("ALTER TABLE collection_schedule ADD COLUMN schedule_type VARCHAR(50) NULL DEFAULT 'regular'");
        echo "<p class='success'>✓ Added schedule_type column</p>";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "<p class='info'>✓ schedule_type column already exists</p>";
        } else {
            throw $e;
        }
    }
    
    // Check and add session column
    echo "<h3>2. Adding session column...</h3>";
    try {
        $db->exec("ALTER TABLE collection_schedule ADD COLUMN session VARCHAR(20) NULL");
        echo "<p class='success'>✓ Added session column</p>";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "<p class='info'>✓ session column already exists</p>";
        } else {
            throw $e;
        }
    }
    
    // Check and add special_pickup_id column (should already exist from previous migration)
    echo "<h3>3. Checking special_pickup_id column...</h3>";
    try {
        $db->exec("ALTER TABLE collection_schedule ADD COLUMN special_pickup_id INT NULL");
        echo "<p class='success'>✓ Added special_pickup_id column</p>";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate column') !== false) {
            echo "<p class='info'>✓ special_pickup_id column already exists</p>";
        } else {
            throw $e;
        }
    }
    
    // Add index on special_pickup_id if not exists
    echo "<h3>4. Adding index on special_pickup_id...</h3>";
    try {
        $db->exec("ALTER TABLE collection_schedule ADD INDEX idx_special_pickup (special_pickup_id)");
        echo "<p class='success'>✓ Added index idx_special_pickup</p>";
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Duplicate key') !== false) {
            echo "<p class='info'>✓ Index idx_special_pickup already exists</p>";
        } else {
            throw $e;
        }
    }
    
    // Verify all columns
    echo "<h3>5. Verifying columns...</h3>";
    $verify = $db->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_schema = DATABASE()
        AND table_name = 'collection_schedule'
        AND COLUMN_NAME IN ('schedule_type', 'session', 'special_pickup_id')
        ORDER BY COLUMN_NAME
    ");
    $verify->execute();
    $columns = $verify->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' cellpadding='5' style='color:#0f0;border-color:#0f0;'>";
    echo "<tr><th>Column Name</th><th>Data Type</th><th>Nullable</th><th>Default</th></tr>";
    foreach ($columns as $col) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($col['COLUMN_NAME']) . "</td>";
        echo "<td>" . htmlspecialchars($col['DATA_TYPE']) . "</td>";
        echo "<td>" . htmlspecialchars($col['IS_NULLABLE']) . "</td>";
        echo "<td>" . htmlspecialchars($col['COLUMN_DEFAULT'] ?? 'NULL') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2 class='success'>✅ Migration completed successfully!</h2>";
    echo "<p class='info'>You can now close this page and try scheduling a special pickup again.</p>";
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre class='error'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</body></html>";
?>
