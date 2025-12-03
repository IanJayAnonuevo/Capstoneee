<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$date = $_GET['date'] ?? date('Y-m-d');

try {
    $database = new Database();
    $db = $database->connect();
    
    // Get all collection schedules for this date
    $stmt = $db->prepare("
        SELECT 
            cs.schedule_id,
            cs.barangay_id,
            b.barangay_name,
            cs.scheduled_date,
            cs.session,
            cs.start_time,
            cs.end_time,
            cs.status,
            ct.team_id,
            ct.truck_id,
            ct.driver_id,
            t.plate_num,
            COALESCE(CONCAT(up_driver.firstname, ' ', up_driver.lastname), u_driver.username) AS driver_name,
            (SELECT COUNT(*) FROM collection_team_member WHERE team_id = ct.team_id) as collector_count
        FROM collection_schedule cs
        JOIN barangay b ON cs.barangay_id = b.barangay_id
        LEFT JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
        LEFT JOIN truck t ON ct.truck_id = t.truck_id
        LEFT JOIN user u_driver ON ct.driver_id = u_driver.user_id
        LEFT JOIN user_profile up_driver ON u_driver.user_id = up_driver.user_id
        WHERE cs.scheduled_date = :date
        ORDER BY cs.session, cs.start_time, b.barangay_name
    ");
    
    $stmt->execute([':date' => $date]);
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get collectors for each team
    foreach ($schedules as &$schedule) {
        if ($schedule['team_id']) {
            $stmt = $db->prepare("
                SELECT 
                    ctm.collector_id,
                    COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS collector_name
                FROM collection_team_member ctm
                JOIN user u ON ctm.collector_id = u.user_id
                LEFT JOIN user_profile up ON u.user_id = up.user_id
                WHERE ctm.team_id = :team_id
            ");
            $stmt->execute([':team_id' => $schedule['team_id']]);
            $schedule['collectors'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
        } else {
            $schedule['collectors'] = [];
        }
    }
    
    // Group by session
    $am_tasks = array_filter($schedules, fn($s) => strtoupper($s['session'] ?? 'AM') === 'AM');
    $pm_tasks = array_filter($schedules, fn($s) => strtoupper($s['session'] ?? 'PM') === 'PM');
    
    echo json_encode([
        'success' => true,
        'date' => $date,
        'total_tasks' => count($schedules),
        'am_count' => count($am_tasks),
        'pm_count' => count($pm_tasks),
        'am_tasks' => array_values($am_tasks),
        'pm_tasks' => array_values($pm_tasks),
        'all_tasks' => $schedules
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
