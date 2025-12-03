<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: text/html; charset=utf-8');
require_once '../config/database.php';

echo "<!DOCTYPE html><html><head><title>Create Notifications Table</title>";
echo "<style>body{font-family:monospace;padding:20px;background:#1a1a1a;color:#0f0;}";
echo ".success{color:#0f0;} .error{color:#f00;} .info{color:#ff0;}</style></head><body>";
echo "<h2>Creating Notifications Table</h2>";

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "<p class='info'>Connected to database</p>";
    
    // Check if table exists
    echo "<h3>1. Checking if notifications table exists...</h3>";
    $checkTable = $db->prepare("
        SELECT COUNT(*) as count
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE table_schema = DATABASE()
        AND table_name = 'notifications'
    ");
    $checkTable->execute();
    $result = $checkTable->fetch(PDO::FETCH_ASSOC);
    
    if ($result['count'] > 0) {
        echo "<p class='success'>✓ notifications table already exists</p>";
    } else {
        echo "<p class='error'>✗ notifications table does NOT exist</p>";
        echo "<h3>2. Creating notifications table...</h3>";
        
        $createTable = "
            CREATE TABLE `notifications` (
              `notification_id` INT AUTO_INCREMENT PRIMARY KEY,
              `recipient_id` INT NOT NULL,
              `sender_id` INT NULL,
              `type` VARCHAR(50) NOT NULL,
              `title` VARCHAR(255) NOT NULL,
              `message` TEXT NOT NULL,
              `related_id` INT NULL,
              `is_read` TINYINT(1) DEFAULT 0,
              `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              `read_at` TIMESTAMP NULL,
              INDEX `idx_recipient` (`recipient_id`),
              INDEX `idx_type` (`type`),
              INDEX `idx_created` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        
        $db->exec($createTable);
        echo "<p class='success'>✓ notifications table created successfully!</p>";
    }
    
    // Verify table structure
    echo "<h3>3. Verifying table structure...</h3>";
    $verifyColumns = $db->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_schema = DATABASE()
        AND table_name = 'notifications'
        ORDER BY ORDINAL_POSITION
    ");
    $verifyColumns->execute();
    $columns = $verifyColumns->fetchAll(PDO::FETCH_ASSOC);
    
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
    echo "<p class='info'>The notifications table is now ready. Try scheduling a special pickup again!</p>";
    
} catch (Exception $e) {
    echo "<p class='error'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre class='error'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</body></html>";
?>
