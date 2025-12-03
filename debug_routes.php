<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/backend/config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "Testing route generation...\n\n";
    
    // Test data
    $date = '2025-11-29';
    $session = 'PM';
    
    // Check if tasks exist
    $stmt = $db->prepare("
        SELECT cs.schedule_id, cs.barangay_id, cs.session, ct.team_id, ct.truck_id
        FROM collection_schedule cs
        JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
        WHERE cs.scheduled_date = ? AND ct.session = ?
        LIMIT 5
    ");
    $stmt->execute([$date, $session]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Tasks found: " . count($tasks) . "\n";
    foreach ($tasks as $task) {
        echo "  - Schedule ID: {$task['schedule_id']}, Team ID: {$task['team_id']}, Truck ID: {$task['truck_id']}\n";
    }
    
    echo "\n";
    
    // Check daily_route table structure
    echo "Checking daily_route table structure...\n";
    $stmt = $db->query("DESCRIBE daily_route");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "Columns:\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?>
