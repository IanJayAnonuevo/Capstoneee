<?php
require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/lib/AttendanceAssignment.php';

date_default_timezone_set('Asia/Manila');

try {
    $db = (new Database())->connect();
    
    if (!$db) {
        die("Database connection failed\n");
    }
    
    $today = '2025-11-29';
    $session = 'PM';
    
    echo "Checking personnel for: $today, Session: $session\n";
    echo str_repeat("=", 80) . "\n";
    
    try {
        $personnel = getApprovedPersonnelBySession($db, $today, $session);
        
        echo "Drivers found: " . count($personnel['drivers']) . "\n";
        foreach ($personnel['drivers'] as $driver) {
            echo "  - " . $driver['full_name'] . " (User ID: " . $driver['user_id'] . ")\n";
        }
        
        echo "\nCollectors found: " . count($personnel['collectors']) . "\n";
        foreach ($personnel['collectors'] as $collector) {
            echo "  - " . $collector['full_name'] . " (User ID: " . $collector['user_id'] . ")\n";
        }
        
        echo "\n" . str_repeat("=", 80) . "\n";
        
        // Try to build snapshot
        try {
            $snapshot = buildSessionSnapshot($personnel['drivers'], $personnel['collectors']);
            echo "✓ SUCCESS: Snapshot built successfully!\n";
            echo "  Priority Driver: " . $snapshot['drivers']['priority']['full_name'] . "\n";
            echo "  Clustered Driver: " . $snapshot['drivers']['clustered']['full_name'] . "\n";
            echo "  Priority Collectors: " . count($snapshot['collectors']['priority']) . "\n";
            echo "  Clustered Collectors: " . count($snapshot['collectors']['clustered']) . "\n";
        } catch (RuntimeException $e) {
            echo "✗ FAILED: " . $e->getMessage() . "\n";
            echo "\nThis is why the cron job failed!\n";
        }
        
    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
