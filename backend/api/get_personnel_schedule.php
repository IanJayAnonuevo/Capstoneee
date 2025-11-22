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
        // Get schedules for driver where team status is 'accepted' or 'confirmed'
        // Try to find route_id from daily_route, matching by team_id, date, and barangay_id
        $query = "SELECT 
                    cs.schedule_id,
                    cs.scheduled_date,
                    cs.start_time,
                    cs.end_time,
                    cs.status as schedule_status,
                    b.barangay_name,
                    b.barangay_id,
                    ct.team_id,
                    ct.status as team_status,
                    t.plate_num,
                    t.truck_type,
                    t.capacity,
                    COALESCE(dr.id, NULL) as route_id
                  FROM collection_team ct
                  JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
                  JOIN barangay b ON cs.barangay_id = b.barangay_id
                  LEFT JOIN truck t ON ct.truck_id = t.truck_id
                  LEFT JOIN daily_route dr ON dr.team_id = ct.team_id 
                    AND dr.date = cs.scheduled_date
                    AND dr.barangay_id = cs.barangay_id
                  WHERE ct.driver_id = ? 
                    AND ct.status IN ('accepted', 'confirmed', 'approved')
                    AND cs.status IN ('scheduled', 'pending', 'approved')
                  ORDER BY cs.scheduled_date ASC, cs.start_time ASC";
        
        $stmt = $db->prepare($query);
        $stmt->execute([$user_id]);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        } elseif ($role === 'collector') {
        // Get unique team/schedule rows for this collector using EXISTS to avoid duplicates from member joins
                $query = "SELECT 
                                        cs.schedule_id,
                                        cs.scheduled_date,
                                        cs.start_time,
                                        cs.end_time,
                                        cs.status AS schedule_status,
                                        b.barangay_name,
                                        ct.team_id,
                                        ct.status AS team_status,
                                        uctm.response_status,
                                        t.plate_num,
                                        t.truck_type,
                                        t.capacity,
                                        u.username AS driver_username,
                                        dr_map.id as route_id
                                    FROM collection_team ct
                                    JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
                                    JOIN barangay b ON cs.barangay_id = b.barangay_id
                                    LEFT JOIN truck t ON ct.truck_id = t.truck_id
                                    LEFT JOIN user u ON ct.driver_id = u.user_id
                                    LEFT JOIN daily_route dr_map ON dr_map.team_id = ct.team_id 
                                        AND dr_map.date = cs.scheduled_date
                                        AND dr_map.barangay_id = cs.barangay_id
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
            $stmtC = $db->prepare("SELECT u.username, ctm.response_status FROM collection_team_member ctm JOIN user u ON u.user_id = ctm.collector_id WHERE ctm.team_id = ?");
            $stmtC->execute([$schedule['team_id']]);
            $collectors = $stmtC->fetchAll(PDO::FETCH_ASSOC) ?: [];
        }
        
        // Get barangay_id from the schedule
        $barangayId = null;
        if (!empty($schedule['schedule_id'])) {
            $stmtB = $db->prepare("SELECT barangay_id FROM collection_schedule WHERE schedule_id = ?");
            $stmtB->execute([$schedule['schedule_id']]);
            $barangayRow = $stmtB->fetch(PDO::FETCH_ASSOC);
            $barangayId = $barangayRow['barangay_id'] ?? null;
        }
        
        // Try to find route_id if it's null - query daily_route directly with multiple fallbacks
        $routeId = $schedule['route_id'];
        if (empty($routeId) && !empty($schedule['team_id']) && !empty($schedule['scheduled_date'])) {
            try {
                // First try: match by team_id, date, and barangay_id
                if (!empty($barangayId)) {
                    $routeStmt = $db->prepare("SELECT id FROM daily_route WHERE team_id = ? AND date = ? AND barangay_id = ? LIMIT 1");
                    $routeStmt->execute([$schedule['team_id'], $schedule['scheduled_date'], $barangayId]);
                    $routeRow = $routeStmt->fetch(PDO::FETCH_ASSOC);
                    if ($routeRow && !empty($routeRow['id'])) {
                        $routeId = $routeRow['id'];
                    }
                }
                
                // Second try: match by team_id, date, and barangay_name (if barangay_id didn't work)
                if (empty($routeId) && !empty($schedule['barangay_name'])) {
                    $routeStmt = $db->prepare("SELECT id FROM daily_route WHERE team_id = ? AND date = ? AND barangay_name = ? LIMIT 1");
                    $routeStmt->execute([$schedule['team_id'], $schedule['scheduled_date'], $schedule['barangay_name']]);
                    $routeRow = $routeStmt->fetch(PDO::FETCH_ASSOC);
                    if ($routeRow && !empty($routeRow['id'])) {
                        $routeId = $routeRow['id'];
                    }
                }
                
                // Third try: match by team_id and date only (last resort)
                if (empty($routeId)) {
                    $routeStmt = $db->prepare("SELECT id FROM daily_route WHERE team_id = ? AND date = ? ORDER BY id LIMIT 1");
                    $routeStmt->execute([$schedule['team_id'], $schedule['scheduled_date']]);
                    $routeRow = $routeStmt->fetch(PDO::FETCH_ASSOC);
                    if ($routeRow && !empty($routeRow['id'])) {
                        $routeId = $routeRow['id'];
                    }
                }
            } catch (Exception $e) {
                // Ignore errors, keep routeId as null
            }
        }
        
        $formattedSchedules[] = [
            'schedule_id' => $schedule['schedule_id'],
            'route_id' => $routeId, // This is the daily_route ID
            'team_id' => $schedule['team_id'],
            'barangay_id' => $barangayId,
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
            'collectors' => $collectors
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
