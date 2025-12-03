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

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    $today = date('Y-m-d');

    // 1. Get total routes scheduled today from daily_route table
    $routesQuery = "SELECT COUNT(DISTINCT id) as total_routes,
                           COUNT(DISTINCT barangay_id) as total_barangays
                    FROM daily_route 
                    WHERE date = :today 
                    AND status IN ('scheduled', 'in_progress')";
    $routesStmt = $db->prepare($routesQuery);
    $routesStmt->bindParam(':today', $today);
    $routesStmt->execute();
    $routesData = $routesStmt->fetch(PDO::FETCH_ASSOC);

    // 2. Get active collectors and drivers from attendance (who timed in today)
    $activeStaffQuery = "SELECT 
                            u.role_id,
                            COUNT(DISTINCT ar.user_id) as count
                         FROM attendance_request ar
                         INNER JOIN user u ON ar.user_id = u.user_id
                         WHERE DATE(ar.submitted_at) = :today
                         AND ar.request_status = 'approved'
                         AND u.role_id IN (3, 4)
                         GROUP BY u.role_id";
    $activeStaffStmt = $db->prepare($activeStaffQuery);
    $activeStaffStmt->bindParam(':today', $today);
    $activeStaffStmt->execute();
    $activeStaffData = $activeStaffStmt->fetchAll(PDO::FETCH_ASSOC);

    $activeDrivers = 0;
    $activeCollectors = 0;
    foreach ($activeStaffData as $row) {
        if ($row['role_id'] == 3) {
            $activeDrivers = (int)$row['count'];
        } elseif ($row['role_id'] == 4) {
            $activeCollectors = (int)$row['count'];
        }
    }
    $totalActiveStaff = $activeDrivers + $activeCollectors;

    // 3. Get ongoing collections (routes in progress)
    $ongoingQuery = "SELECT id, barangay_name, status, start_time
                     FROM daily_route 
                     WHERE date = :today 
                     AND status = 'in_progress'
                     ORDER BY start_time ASC";
    $ongoingStmt = $db->prepare($ongoingQuery);
    $ongoingStmt->bindParam(':today', $today);
    $ongoingStmt->execute();
    $ongoingRoutes = $ongoingStmt->fetchAll(PDO::FETCH_ASSOC);

    // 4. Get pending/delayed tasks from daily_route
    $tasksQuery = "SELECT 
                      COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as pending_count,
                      COUNT(CASE WHEN status = 'missed' THEN 1 END) as delayed_count
                   FROM daily_route
                   WHERE date = :today";
    $tasksStmt = $db->prepare($tasksQuery);
    $tasksStmt->bindParam(':today', $today);
    $tasksStmt->execute();
    $tasksData = $tasksStmt->fetch(PDO::FETCH_ASSOC);

    $pendingTasks = (int)($tasksData['pending_count'] ?? 0);
    $delayedTasks = (int)($tasksData['delayed_count'] ?? 0);
    $totalPendingDelayed = $pendingTasks + $delayedTasks;

    // Prepare response
    echo json_encode([
        'success' => true,
        'data' => [
            'total_routes_today' => (int)($routesData['total_routes'] ?? 0),
            'routes_by_barangay' => (int)($routesData['total_barangays'] ?? 0),
            'active_collectors' => $activeCollectors,
            'active_drivers' => $activeDrivers,
            'total_active_staff' => $totalActiveStaff,
            'ongoing_collections' => count($ongoingRoutes),
            'ongoing_routes' => array_map(function($route) {
                return [
                    'route_id' => $route['id'],
                    'barangay' => $route['barangay_name'],
                    'status' => $route['status'],
                    'start_time' => $route['start_time']
                ];
            }, $ongoingRoutes),
            'pending_tasks' => $pendingTasks,
            'delayed_tasks' => $delayedTasks,
            'total_pending_delayed' => $totalPendingDelayed
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
