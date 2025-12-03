<?php
// Suppress errors and start output buffering
error_reporting(0);
ini_set('display_errors', 0);
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();

    // Get date parameter (default: today)
    $date = isset($_GET['date']) && !empty($_GET['date']) ? $_GET['date'] : date('Y-m-d');

    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        throw new Exception('Invalid date format. Use YYYY-MM-DD');
    }

    // Get day of week (0=Sunday, 1=Monday, etc.)
    $dayOfWeekNum = date('w', strtotime($date));
    
    // Convert to day name for database query
    $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $dayOfWeek = $dayNames[$dayOfWeekNum];

    // Calculate week of month (1-5)
    $dayOfMonth = date('j', strtotime($date));
    $weekOfMonth = ceil($dayOfMonth / 7);

    // Query schedules for this date
    // NOTE: Do NOT use DISTINCT here - we need duplicate barangays if they have multiple schedules
    $scheduleQuery = "SELECT
                        ps.schedule_type,
                        ps.barangay_id,
                        ps.cluster_id,
                        b.barangay_name,
                        ps.start_time,
                        ps.end_time,
                        ps.session
                      FROM predefined_schedules ps
                      JOIN barangay b ON ps.barangay_id = b.barangay_id
                      WHERE ps.day_of_week = ?
                      AND (ps.week_of_month = ? OR ps.week_of_month IS NULL)
                      AND ps.is_active = 1
                      ORDER BY ps.schedule_type, ps.session, ps.start_time, b.barangay_name";
    
    $scheduleStmt = $db->prepare($scheduleQuery);
    $scheduleStmt->execute([$dayOfWeek, $weekOfMonth]);
    $schedules = $scheduleStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($schedules)) {
        ob_end_clean();
        echo json_encode([
            'success' => false,
            'message' => 'No schedules found for this date'
        ]);
        exit();
    }

    // Group barangays by cluster_id AND session
    $groupedSchedules = [];
    foreach ($schedules as $schedule) {
        $clusterId = $schedule['cluster_id'];
        // Infer session if missing (similar to generate_tasks logic)
        $session = $schedule['session'];
        if (empty($session)) {
            $startTime = $schedule['start_time'] ?? '08:00:00';
            $session = $startTime >= '12:00:00' ? 'PM' : 'AM';
        }
        $session = strtoupper($session);
        
        $groupKey = $clusterId . '|' . $session;
        
        if (!isset($groupedSchedules[$groupKey])) {
            $groupedSchedules[$groupKey] = [
                'cluster_id' => $clusterId,
                'session' => $session,
                'barangays' => [],
                'start_times' => [],
                'end_times' => []
            ];
        }
        $groupedSchedules[$groupKey]['barangays'][] = [
            'barangay_id' => $schedule['barangay_id'],
            'barangay_name' => $schedule['barangay_name']
        ];
        $groupedSchedules[$groupKey]['start_times'][] = $schedule['start_time'];
        $groupedSchedules[$groupKey]['end_times'][] = $schedule['end_time'];
    }

    // Generate routes for each group
    $generatedRoutes = [];
    $routesCreated = 0;

    foreach ($groupedSchedules as $groupKey => $groupData) {
        $clusterId = $groupData['cluster_id'];
        $session = $groupData['session'];
        $barangays = $groupData['barangays'];
        
        // Calculate dynamic start and end times
        $minStartTime = min($groupData['start_times']);
        $maxEndTime = max($groupData['end_times']);
        
        // Create route name based on cluster and session
        $clusterName = $clusterId === '1C-PB' ? 'Priority Barangay' : 'Clustered Barangay';
        $routeName = $clusterName . ' Route (' . $session . ')';
        
        // Get barangay names for display
        $barangayNames = array_map(function($b) { return $b['barangay_name']; }, $barangays);
        $barangayNameStr = implode(', ', $barangayNames);

        // Check if there are actual tasks generated for this session
        // Only create routes if tasks exist for this session
        $firstBarangayId = $barangays[0]['barangay_id'];
        $taskCheckQuery = "SELECT ct.team_id, ct.truck_id, ct.session
                           FROM collection_schedule cs
                           JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
                           WHERE cs.barangay_id = ? AND cs.scheduled_date = ? AND ct.session = ?
                           LIMIT 1";
        $taskCheckStmt = $db->prepare($taskCheckQuery);
        $taskCheckStmt->execute([$firstBarangayId, $date, $session]);
        $teamInfo = $taskCheckStmt->fetch(PDO::FETCH_ASSOC);

        // Skip this route if no tasks exist for this session
        if (!$teamInfo) {
            continue;
        }

        $teamId = $teamInfo['team_id'];
        $truckId = $teamInfo['truck_id'];

        // Insert daily_route
        $insertRouteQuery = "INSERT INTO daily_route (
                                date, barangay_name, status, source,
                                start_time, end_time, team_id, truck_id, created_at, updated_at
                             ) VALUES (?, ?, 'scheduled', 'generated', ?, ?, ?, ?, NOW(), NOW())";
        
        $insertRouteStmt = $db->prepare($insertRouteQuery);
        $insertRouteStmt->execute([$date, $routeName, $minStartTime, $maxEndTime, $teamId, $truckId]);
        $routeId = $db->lastInsertId();

        // Get all collection points from these barangays
        // Important: Iterate through each barangay individually to preserve duplicates
        // (e.g., if North Centro appears twice in schedules, we want its stops twice)
        $collectionPoints = [];
        foreach ($barangays as $barangay) {
            $cpQuery = "SELECT 
                            cp.point_id,
                            cp.barangay_id,
                            cp.location_name,
                            cp.latitude,
                            cp.longitude,
                            b.barangay_name
                        FROM collection_point cp
                        JOIN barangay b ON cp.barangay_id = b.barangay_id
                        WHERE cp.barangay_id = ?
                        ORDER BY cp.point_id";
            
            $cpStmt = $db->prepare($cpQuery);
            $cpStmt->execute([$barangay['barangay_id']]);
            $points = $cpStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Add all points from this barangay to the collection
            foreach ($points as $point) {
                $collectionPoints[] = $point;
            }
        }

        // Insert stops
        $seq = 1;
        $stopsCreated = 0;
        foreach ($collectionPoints as $cp) {
            $insertStopQuery = "INSERT INTO daily_route_stop (
                                    daily_route_id, seq, collection_point_id,
                                    name, lat, lng, status, created_at, updated_at
                                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())";
            
            $insertStopStmt = $db->prepare($insertStopQuery);
            $insertStopStmt->execute([
                $routeId,
                $seq,
                $cp['point_id'],
                $cp['location_name'],
                $cp['latitude'],
                $cp['longitude']
            ]);
            $seq++;
            $stopsCreated++;
        }

        $generatedRoutes[] = [
            'id' => $routeId,
            'type' => $scheduleType,
            'name' => $routeName,
            'barangays' => $barangayNames,
            'stops_count' => $stopsCreated
        ];
        $routesCreated++;
    }

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'date' => $date,
        'routes_generated' => $routesCreated,
        'routes' => $generatedRoutes
    ]);

} catch (PDOException $e) {
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
