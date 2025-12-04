<?php
/**
 * Debug API: Test task generation for December 1, 2025
 * URL: https://kolektrash.systemproj.com/backend/api/debug_task_generation.php
 */

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/AttendanceAssignment.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    $date = '2025-12-04';
    $session = 'AM';
    
    $result = [
        'success' => true,
        'date' => $date,
        'session' => $session,
        'checks' => []
    ];
    
    // Step 1: Get personnel
    $personnel = getApprovedPersonnelBySession($db, $date, $session);
    
    $result['checks']['personnel'] = [
        'drivers_count' => count($personnel['drivers']),
        'collectors_count' => count($personnel['collectors']),
        'drivers' => array_map(fn($d) => [
            'user_id' => $d['user_id'],
            'name' => $d['full_name'],
            'time_in' => $d['time_in']
        ], $personnel['drivers']),
        'collectors' => array_map(fn($c) => [
            'user_id' => $c['user_id'],
            'name' => $c['full_name'],
            'time_in' => $c['time_in']
        ], $personnel['collectors'])
    ];
    
    // Step 2: Build session snapshot
    try {
        // Get truck count for testing
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM truck WHERE status = 'available' OR status = 'Available'");
        $stmt->execute();
        $truckCount = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        $snapshot = buildSessionSnapshot($personnel['drivers'], $personnel['collectors'], $truckCount);
        $result['checks']['snapshot'] = [
            'success' => true,
            'truck_count' => $truckCount,
            'priority_driver' => $snapshot['drivers']['priority']['full_name'],
            'clustered_driver' => $snapshot['drivers']['clustered'] ? $snapshot['drivers']['clustered']['full_name'] : null,
            'priority_collectors_count' => count($snapshot['collectors']['priority']),
            'clustered_collectors_count' => count($snapshot['collectors']['clustered']),
            'priority_collectors' => array_map(fn($c) => $c['full_name'], $snapshot['collectors']['priority']),
            'clustered_collectors' => array_map(fn($c) => $c['full_name'], $snapshot['collectors']['clustered'])
        ];
    } catch (RuntimeException $e) {
        $result['checks']['snapshot'] = [
            'success' => false,
            'error' => $e->getMessage()
        ];
        $result['success'] = false;
    }
    
    // Step 3: Check schedules
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
    
    $result['checks']['schedules'] = [
        'count' => count($schedules),
        'schedules' => array_map(fn($s) => [
            'barangay_name' => $s['barangay_name'],
            'schedule_type' => $s['schedule_type'],
            'session' => $s['session'],
            'start_time' => $s['start_time'],
            'cluster_id' => $s['cluster_id']
        ], $schedules)
    ];
    
    // Step 4: Check trucks
    $stmt = $db->prepare("SELECT truck_id, plate_num, status FROM truck WHERE status = 'available' OR status = 'Available'");
    $stmt->execute();
    $trucks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $result['checks']['trucks'] = [
        'count' => count($trucks),
        'trucks' => $trucks
    ];
    
    // Step 5: Check existing tasks
    $stmt = $db->prepare("SELECT COUNT(*) as count FROM collection_schedule WHERE scheduled_date = ?");
    $stmt->execute([$date]);
    $existingTasks = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $result['checks']['existing_tasks'] = [
        'count' => $existingTasks['count']
    ];
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_PRETTY_PRINT);
}
?>
