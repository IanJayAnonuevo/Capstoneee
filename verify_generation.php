<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    $date = '2025-11-29';
    
    echo "=== TASKS for $date ===\n\n";
    $stmt = $db->prepare("
        SELECT cs.schedule_id, b.barangay_name, cs.session, cs.start_time, 
               ct.team_id, ct.truck_id, t.plate_num
        FROM collection_schedule cs
        JOIN barangay b ON cs.barangay_id = b.barangay_id
        JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
        LEFT JOIN truck t ON ct.truck_id = t.truck_id
        WHERE cs.scheduled_date = ?
        ORDER BY cs.session, cs.start_time
    ");
    $stmt->execute([$date]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total tasks: " . count($tasks) . "\n\n";
    foreach ($tasks as $task) {
        echo "  [{$task['session']}] {$task['barangay_name']} @ {$task['start_time']} - Team: {$task['team_id']}, Truck: {$task['plate_num']}\n";
    }
    
    echo "\n=== ROUTES for $date ===\n\n";
    $stmt = $db->prepare("
        SELECT dr.id, dr.barangay_name, dr.start_time, dr.end_time, 
               dr.team_id, dr.truck_id, t.plate_num,
               COUNT(drs.id) as stop_count
        FROM daily_route dr
        LEFT JOIN truck t ON dr.truck_id = t.truck_id
        LEFT JOIN daily_route_stop drs ON dr.id = drs.daily_route_id
        WHERE dr.date = ?
        GROUP BY dr.id
        ORDER BY dr.start_time
    ");
    $stmt->execute([$date]);
    $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Total routes: " . count($routes) . "\n\n";
    foreach ($routes as $route) {
        echo "  Route #{$route['id']}: {$route['barangay_name']}\n";
        echo "    Time: {$route['start_time']} - {$route['end_time']}\n";
        echo "    Team: {$route['team_id']}, Truck: {$route['plate_num']}\n";
        echo "    Stops: {$route['stop_count']}\n\n";
    }
    
    if (count($routes) > 0) {
        echo "✅ Routes successfully generated!\n";
    } else {
        echo "❌ No routes found!\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
