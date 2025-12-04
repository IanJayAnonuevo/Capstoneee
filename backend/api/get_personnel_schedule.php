<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
$database = new Database();
$db = $database->connect();

// Get user_id and role from query parameters
$user_id = $_GET['user_id'] ?? null;
$role = $_GET['role'] ?? null; // 'driver' or 'collector'

if (!$user_id || !$role) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required parameters: user_id and role'
    ]);
    exit();
}

try {
    // Force collation at connection level - try multiple methods
    try {
        $db->exec("SET character_set_client = 'utf8mb4'");
        $db->exec("SET character_set_connection = 'utf8mb4'");
        $db->exec("SET character_set_results = 'utf8mb4'");
        $db->exec("SET collation_connection = 'utf8mb4_unicode_ci'");
        $db->exec("SET collation_database = 'utf8mb4_unicode_ci'");
    } catch (Exception $e) {
        // Continue even if some fail
    }
    
    $schedules = [];
    
    if ($role === 'driver') {
        // Get all schedules for this driver's team(s) from collection_schedule
        // Join with daily_route to get the route_id for accessing stops
        $query = "SELECT 
                    cs.schedule_id,
                    cs.scheduled_date,
                    cs.start_time,
                    cs.end_time,
                    cs.status as schedule_status,
                    cs.barangay_id,
                    b.barangay_name,
                    ct.team_id,
                    ct.status as team_status,
                    t.plate_num,
                    t.truck_type,
                    t.capacity,
                    dr.id as route_id,
                    COALESCE((SELECT COUNT(*) FROM daily_route_stop WHERE daily_route_id = dr.id), 0) as total_stops,
                    COALESCE((SELECT COUNT(*) FROM daily_route_stop WHERE daily_route_id = dr.id AND status = 'visited'), 0) as completed_stops
                  FROM collection_team ct
                  JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
                  JOIN barangay b ON cs.barangay_id = b.barangay_id
                  LEFT JOIN truck t ON ct.truck_id = t.truck_id
                  LEFT JOIN daily_route dr ON dr.team_id = ct.team_id AND dr.date = cs.scheduled_date
                  WHERE ct.driver_id = ? 
                    AND ct.status IN ('accepted', 'confirmed', 'approved')
                    AND cs.status IN ('scheduled', 'pending', 'approved')
                  ORDER BY cs.scheduled_date ASC, cs.start_time ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        } elseif ($role === 'collector') {
        // Get schedules for this collector with route_id for stops access
                $query = "SELECT 
                                        cs.schedule_id,
                                        cs.scheduled_date,
                                        cs.start_time,
                                        cs.end_time,
                                        cs.status AS schedule_status,
                                        cs.barangay_id,
                                        b.barangay_name,
                                        ct.team_id,
                                        ct.status AS team_status,
                                        uctm.response_status,
                                        t.plate_num,
                                        t.truck_type,
                                        t.capacity,
                                        u.username AS driver_username,
                                        up_driver.firstname AS driver_firstname,
                                        up_driver.lastname AS driver_lastname,
                                        dr.id as route_id,
                                        COALESCE((SELECT COUNT(*) FROM daily_route_stop WHERE daily_route_id = dr.id), 0) as total_stops,
                                        COALESCE((SELECT COUNT(*) FROM daily_route_stop WHERE daily_route_id = dr.id AND status = 'visited'), 0) as completed_stops
                                    FROM collection_team ct
                                    JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
                                    JOIN barangay b ON cs.barangay_id = b.barangay_id
                                    LEFT JOIN truck t ON ct.truck_id = t.truck_id
                                    LEFT JOIN user u ON ct.driver_id = u.user_id
                                    LEFT JOIN user_profile up_driver ON up_driver.user_id = u.user_id
                                    LEFT JOIN daily_route dr ON dr.team_id = ct.team_id AND dr.date = cs.scheduled_date
                                    JOIN (
                                        SELECT DISTINCT ctm.team_id, ctm.response_status
                                        FROM collection_team_member ctm
                                        WHERE ctm.collector_id = :uid
                                            AND ctm.response_status IN ('accepted','confirmed','pending','approved')
                                    ) uctm ON uctm.team_id = ct.team_id
                                    WHERE ct.status IN ('accepted', 'confirmed', 'pending', 'approved')
                                        AND cs.status IN ('scheduled', 'pending', 'approved')
                                    ORDER BY cs.scheduled_date ASC, cs.start_time ASC";

                $stmt = $db->prepare($query);
                $stmt->execute([':uid' => $user_id]);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid role. Must be "driver" or "collector"'
        ]);
        exit();
    }

    // Format the schedules for frontend consumption
    $formattedSchedules = [];
    foreach ($schedules as $schedule) {
        // Collectors
        $collectors = [];
        if (!empty($schedule['team_id'])) {
            $stmtC = $db->prepare("
                SELECT u.username, up.firstname, up.lastname, ctm.response_status 
                FROM collection_team_member ctm 
                JOIN user u ON u.user_id = ctm.collector_id 
                LEFT JOIN user_profile up ON up.user_id = u.user_id
                WHERE ctm.team_id = ?
            ");
            $stmtC->execute([$schedule['team_id']]);
            $collectors = $stmtC->fetchAll(PDO::FETCH_ASSOC) ?: [];
        }
        
        $formattedSchedules[] = [
            'schedule_id' => $schedule['route_id'], // Use route_id as schedule_id for compatibility
            'route_id' => $schedule['route_id'], // This is the daily_route ID
            'team_id' => $schedule['team_id'],
            'barangay_id' => $schedule['barangay_id'],
            'date' => $schedule['scheduled_date'],
            'time' => $schedule['start_time'],
            'end_time' => $schedule['end_time'],
            'barangay' => $schedule['barangay_name'],
            'barangay_name' => $schedule['barangay_name'],
            'status' => $schedule['schedule_status'],
            'team_status' => $schedule['team_status'],
            'truck_number' => $schedule['plate_num'] ?? 'N/A',
            'truck_model' => $schedule['truck_type'] ?? 'N/A',
            'truck_capacity' => isset($schedule['capacity']) ? (int)$schedule['capacity'] : null,
            'your_response_status' => isset($schedule['response_status']) ? $schedule['response_status'] : ($schedule['team_status'] ?? null),
            'driver_name' => $schedule['driver_username'] ?? 'N/A',
            'driver_firstname' => $schedule['driver_firstname'] ?? null,
            'driver_lastname' => $schedule['driver_lastname'] ?? null,
            'collectors' => $collectors,
            'total_stops' => isset($schedule['total_stops']) ? (int)$schedule['total_stops'] : 0,
            'completed_stops' => isset($schedule['completed_stops']) ? (int)$schedule['completed_stops'] : 0
        ];
    }

    echo json_encode([
        'success' => true,
        'schedules' => $formattedSchedules,
        'count' => count($formattedSchedules)
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
