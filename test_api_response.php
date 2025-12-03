&lt;?php
// Test script to check what get_all_task_assignments.php returns
require_once __DIR__ . '/backend/config/database.php';

$database = new Database();
$db = $database->connect();

$query = "SELECT 
    ct.team_id as assignment_id,
    ct.schedule_id,
    ct.truck_id,
    ct.driver_id,
    ct.status,
    cs.scheduled_date as date,
    cs.start_time as time,
    cs.barangay_id,
    b.barangay_name,
    t.plate_num as truck_plate,
    t.truck_type,
    t.capacity as truck_capacity,
    t.status as truck_status,
    u.username as driver_name,
    dr.id as route_id,
    dr.status as route_status
FROM collection_team ct
LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
LEFT JOIN barangay b ON cs.barangay_id = b.barangay_id
LEFT JOIN truck t ON ct.truck_id = t.truck_id
LEFT JOIN user u ON ct.driver_id = u.user_id
LEFT JOIN daily_route dr ON ct.team_id = dr.team_id AND cs.scheduled_date = dr.date
WHERE cs.scheduled_date = '2025-12-01'
ORDER BY cs.start_time";

$stmt = $db->prepare($query);
$stmt->execute();

echo "Total rows: " . $stmt->rowCount() . "\n\n";

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo "Team ID: {$row['assignment_id']}\n";
    echo "Driver: {$row['driver_name']} (ID: {$row['driver_id']})\n";
    echo "Date: {$row['date']}\n";
    echo "Time: {$row['time']}\n";
    echo "Route ID: " . ($row['route_id'] ?? 'NULL') . "\n";
    echo "Route Status: " . ($row['route_status'] ?? 'NULL') . "\n";
    
    // Get collectors
    $collectorsQ = $db->prepare("
        SELECT u.username, ctm.collector_id
        FROM collection_team_member ctm 
        JOIN user u ON ctm.collector_id = u.user_id 
        WHERE ctm.team_id = ?
    ");
    $collectorsQ->execute([$row['assignment_id']]);
    $collectors = $collectorsQ->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Collectors: ";
    foreach ($collectors as $c) {
        echo "{$c['username']} (ID: {$c['collector_id']}), ";
    }
    echo "\n";
    echo "---\n\n";
}
