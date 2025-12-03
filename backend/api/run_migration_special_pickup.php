<?php
// Web-accessible migration script
header('Content-Type: text/html; charset=utf-8');
require_once __DIR__ . '/_bootstrap.php';
require_once '../config/database.php';

echo "<!DOCTYPE html><html><head><title>Migration: Add special_pickup_id</title>";
echo "<style>body{font-family:monospace;padding:20px;background:#1a1a1a;color:#0f0;}";
echo ".success{color:#0f0;} .error{color:#f00;} .info{color:#ff0;}</style></head><body>";
echo "<h2>Special Pickup Migration</h2>";

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "<p class='info'>✓ Database connected successfully</p>";
    echo "<p class='info'>Checking if special_pickup_id column exists...</p>";
    
    // Check if column exists
    $checkQuery = $db->prepare("
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_schema = DATABASE()
        AND table_name = 'collection_schedule'
        AND column_name = 'special_pickup_id'
    ");
    $checkQuery->execute();
    $result = $checkQuery->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        echo "<p class='success'>✅ Column 'special_pickup_id' already exists in collection_schedule table.</p>";
    } else {
        echo "<p class='error'>❌ Column 'special_pickup_id' does NOT exist.</p>";
        echo "<p class='info'>Adding column now...</p>";
        
        // Add the column
        $db->exec("ALTER TABLE collection_schedule ADD COLUMN special_pickup_id INT NULL");
        echo "<p class='success'>✅ Added column 'special_pickup_id'</p>";
        
        // Add index
        $db->exec("ALTER TABLE collection_schedule ADD INDEX idx_special_pickup (special_pickup_id)");
        echo "<p class='success'>✅ Added index 'idx_special_pickup'</p>";
    }
    
    // Verify the column
    $verifyQuery = $db->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_schema = DATABASE()
        AND table_name = 'collection_schedule'
        AND column_name = 'special_pickup_id'
    ");
    $verifyQuery->execute();
    $columnInfo = $verifyQuery->fetch(PDO::FETCH_ASSOC);
    
    if ($columnInfo) {
        echo "<h3 class='success'>Column Details:</h3>";
        echo "<ul>";
        echo "<li>Name: " . htmlspecialchars($columnInfo['COLUMN_NAME']) . "</li>";
        echo "<li>Type: " . htmlspecialchars($columnInfo['DATA_TYPE']) . "</li>";
        echo "<li>Nullable: " . htmlspecialchars($columnInfo['IS_NULLABLE']) . "</li>";
        echo "</ul>";
        echo "<h2 class='success'>✅ Migration completed successfully!</h2>";
        echo "<p class='info'>You can now close this page and try scheduling a special pickup again.</p>";
    }
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre class='error'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</body></html>";
?>
