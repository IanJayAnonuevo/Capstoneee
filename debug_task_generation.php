<?php
/**
 * Debug script to test task generation for December 1, 2025
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/lib/AttendanceAssignment.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    $date = '2025-12-01';
    $session = 'AM';
    
    echo "=== DEBUG: Task Generation for $date ($session) ===\n\n";
    
    // Step 1: Get personnel
    echo "Step 1: Getting approved personnel...\n";
    $personnel = getApprovedPersonnelBySession($db, $date, $session);
    
    echo "Drivers found: " . count($personnel['drivers']) . "\n";
    foreach ($personnel['drivers'] as $driver) {
        echo "  - Driver: " . $driver['full_name'] . " (user_id: " . $driver['user_id'] . ")\n";
    }
    
    echo "\nCollectors found: " . count($personnel['collectors']) . "\n";
    foreach ($personnel['collectors'] as $collector) {
        echo "  - Collector: " . $collector['full_name'] . " (user_id: " . $collector['user_id'] . ")\n";
    }
    
    // Step 2: Build session snapshot
    echo "\n\nStep 2: Building session snapshot...\n";
    try {
        $snapshot = buildSessionSnapshot($personnel['drivers'], $personnel['collectors']);
        echo "✅ Session snapshot created successfully!\n";
        echo "Priority Driver: " . $snapshot['drivers']['priority']['full_name'] . "\n";
        echo "Clustered Driver: " . $snapshot['drivers']['clustered']['full_name'] . "\n";
        echo "Priority Collectors: " . count($snapshot['collectors']['priority']) . "\n";
        echo "Clustered Collectors: " . count($snapshot['collectors']['clustered']) . "\n";
    } catch (RuntimeException $e) {
        echo "❌ ERROR: " . $e->getMessage() . "\n";
        exit(1);
    }
    
    // Step 3: Check schedules
    echo "\n\nStep 3: Checking schedules for Monday, Week 1...\n";
    $dayOfWeek = 'Monday';
    $weekOfMonth = 1;
    
    $stmt = $db->prepare("
        SELECT * FROM predefined_schedules 
        WHERE day_of_week = ? 
        AND (week_of_month = ? OR week_of_month IS NULL)
        AND is_active = 1
    ");
    $stmt->execute([$dayOfWeek, $weekOfMonth]);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Schedules found: " . count($schedules) . "\n";
    foreach ($schedules as $schedule) {
        echo "  - " . $schedule['barangay_name'] . " (" . $schedule['schedule_type'] . ", " . $schedule['session'] . ")\n";
    }
    
    // Step 4: Check trucks
    echo "\n\nStep 4: Checking available trucks...\n";
    $stmt = $db->prepare("SELECT truck_id, plate_num, status FROM truck WHERE status = 'available' OR status = 'Available'");
    $stmt->execute();
    $trucks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Trucks available: " . count($trucks) . "\n";
    foreach ($trucks as $truck) {
        echo "  - " . $truck['plate_num'] . " (truck_id: " . $truck['truck_id'] . ")\n";
    }
    
    echo "\n\n=== All checks passed! Task generation should work. ===\n";
    
} catch (Exception $e) {
    echo "\n\n❌ FATAL ERROR: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}
?>
