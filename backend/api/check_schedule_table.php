<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: text/html');
require_once '../config/database.php';

echo "<pre>";
try {
    $database = new Database();
    $db = $database->connect();
    
    echo "=== COLLECTION_SCHEDULE TABLE STRUCTURE ===\n\n";
    
    $columnCheck = $db->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_schema = DATABASE()
        AND table_name = 'collection_schedule'
        ORDER BY ORDINAL_POSITION
    ");
    $columnCheck->execute();
    $columns = $columnCheck->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($columns as $col) {
        echo sprintf("%-30s %-15s %-10s %s\n", 
            $col['COLUMN_NAME'], 
            $col['DATA_TYPE'], 
            $col['IS_NULLABLE'],
            $col['COLUMN_DEFAULT'] ?? 'NULL'
        );
    }
    
    echo "\n=== CHECKING FOR REQUIRED COLUMNS ===\n\n";
    $requiredColumns = ['schedule_type', 'session', 'special_pickup_id'];
    foreach ($requiredColumns as $reqCol) {
        $exists = false;
        foreach ($columns as $col) {
            if ($col['COLUMN_NAME'] === $reqCol) {
                $exists = true;
                break;
            }
        }
        echo "$reqCol: " . ($exists ? "✓ EXISTS" : "✗ MISSING") . "\n";
    }
    
    echo "\n=== RECENT SCHEDULES (Last 3) ===\n\n";
    $recentSchedules = $db->prepare("SELECT * FROM collection_schedule ORDER BY created_at DESC LIMIT 3");
    $recentSchedules->execute();
    $schedules = $recentSchedules->fetchAll(PDO::FETCH_ASSOC);
    print_r($schedules);
    
} catch (Exception $e) {
    echo "\nERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
echo "</pre>";
?>
