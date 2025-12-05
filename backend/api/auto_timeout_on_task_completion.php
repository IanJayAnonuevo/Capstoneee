<?php
// Set timezone to Philippine Standard Time
date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/_bootstrap.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Access-Control-Allow-Methods, Access-Control-Allow-Headers');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    kolektrash_respond_json(405, [
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}

require_once __DIR__ . '/../config/database.php';

try {
    $currentUser = kolektrash_require_auth();
    
    // Normalize role names - support both formats
    $userRole = $currentUser['role'];
    $normalizedRole = $userRole;
    
    // Map role names to standardized format
    if (in_array($userRole, ['driver', 'truck_driver'], true)) {
        $normalizedRole = 'driver';
    } elseif (in_array($userRole, ['collector', 'garbage_collector'], true)) {
        $normalizedRole = 'collector';
    }
    
    // Only truck drivers and garbage collectors can use this endpoint
    if (!in_array($normalizedRole, ['driver', 'collector'], true)) {
        kolektrash_respond_json(403, [
            'status' => 'error',
            'message' => 'Only truck drivers and garbage collectors can use this endpoint.'
        ]);
    }

    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    // Set MySQL session timezone to Philippine Time
    $pdo->exec("SET time_zone = '+08:00'");

    // Get input parameters
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $userId = $input['user_id'] ?? $currentUser['user_id'];
    $date = $input['date'] ?? date('Y-m-d');
    $session = isset($input['session']) ? strtoupper(trim($input['session'])) : null;

    // Validate user_id matches authenticated user
    if ($userId !== $currentUser['user_id']) {
        kolektrash_respond_json(403, [
            'status' => 'error',
            'message' => 'You can only mark your own attendance.'
        ]);
    }

    // Validate session
    if (!$session || !in_array($session, ['AM', 'PM'], true)) {
        kolektrash_respond_json(400, [
            'status' => 'error',
            'message' => 'Invalid session. Must be AM or PM.'
        ]);
    }

    // Check if all tasks for this user/date/session are completed
    // Get all routes assigned to this user for the given date/session
    $routeQuery = "
        SELECT 
            dr.id,
            dr.start_time,
            COUNT(drs.id) as total_stops,
            COUNT(CASE WHEN drs.status = 'visited' THEN drs.id END) as completed_stops
        FROM daily_route dr
        LEFT JOIN daily_route_stop drs ON dr.id = drs.daily_route_id
        INNER JOIN collection_team ct ON dr.team_id = ct.team_id
        WHERE dr.date = ?
        AND (
            (ct.driver_id = ? AND ? IN ('driver', 'truck_driver'))
            OR (EXISTS (
                SELECT 1 FROM collection_team_member ctm 
                WHERE ctm.team_id = ct.team_id 
                AND ctm.collector_id = ? 
                AND ? IN ('collector', 'garbage_collector')
            ))
        )
        GROUP BY dr.id, dr.start_time
    ";

    $routeStmt = $pdo->prepare($routeQuery);
    $routeStmt->execute([
        $date,
        $userId,
        $userRole,
        $userId,
        $userRole
    ]);
    $routes = $routeStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($routes)) {
        kolektrash_respond_json(404, [
            'status' => 'error',
            'message' => 'No tasks found for this date and session.'
        ]);
    }

    // Filter routes by session based on start_time
    $sessionRoutes = array_filter($routes, function($route) use ($session) {
        $startHour = (int)substr($route['start_time'], 0, 2);
        if ($session === 'AM') {
            return $startHour < 12;
        } else {
            return $startHour >= 12;
        }
    });

    if (empty($sessionRoutes)) {
        kolektrash_respond_json(404, [
            'status' => 'error',
            'message' => 'No tasks found for this session.'
        ]);
    }

    // Check if ALL routes for this session are completed
    $allCompleted = true;
    $totalStopsSum = 0;
    $completedStopsSum = 0;

    foreach ($sessionRoutes as $route) {
        $totalStopsSum += (int)$route['total_stops'];
        $completedStopsSum += (int)$route['completed_stops'];
        
        if ((int)$route['total_stops'] > 0 && (int)$route['completed_stops'] < (int)$route['total_stops']) {
            $allCompleted = false;
        }
    }

    if (!$allCompleted) {
        kolektrash_respond_json(400, [
            'status' => 'error',
            'message' => 'Not all tasks are completed yet.',
            'data' => [
                'total_stops' => $totalStopsSum,
                'completed_stops' => $completedStopsSum
            ]
        ]);
    }

    // Get all team members from the routes
    // Find the team(s) associated with these routes
    $teamIds = array_unique(array_map(function($route) use ($pdo, $date) {
        $teamQuery = "SELECT ct.team_id, ct.driver_id
                      FROM collection_team ct
                      INNER JOIN daily_route dr ON dr.team_id = ct.team_id
                      WHERE dr.id = ? AND dr.date = ?";
        $stmt = $pdo->prepare($teamQuery);
        $stmt->execute([$route['id'], $date]);
        $team = $stmt->fetch(PDO::FETCH_ASSOC);
        return $team ? $team['team_id'] : null;
    }, $sessionRoutes));
    
    $teamIds = array_filter($teamIds);
    
    if (empty($teamIds)) {
        kolektrash_respond_json(404, [
            'status' => 'error',
            'message' => 'No team found for these routes.'
        ]);
    }
    
    // Get all team members (driver + collectors)
    $teamMemberIds = [];
    foreach ($teamIds as $teamId) {
        // Get driver
        $driverQuery = "SELECT driver_id FROM collection_team WHERE team_id = ?";
        $driverStmt = $pdo->prepare($driverQuery);
        $driverStmt->execute([$teamId]);
        $driver = $driverStmt->fetch(PDO::FETCH_ASSOC);
        if ($driver && $driver['driver_id']) {
            $teamMemberIds[] = $driver['driver_id'];
        }
        
        // Get collectors
        $collectorsQuery = "SELECT collector_id FROM collection_team_member WHERE team_id = ?";
        $collectorsStmt = $pdo->prepare($collectorsQuery);
        $collectorsStmt->execute([$teamId]);
        $collectors = $collectorsStmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($collectors as $collector) {
            if ($collector['collector_id']) {
                $teamMemberIds[] = $collector['collector_id'];
            }
        }
    }
    
    $teamMemberIds = array_unique($teamMemberIds);
    
    if (empty($teamMemberIds)) {
        kolektrash_respond_json(404, [
            'status' => 'error',
            'message' => 'No team members found.'
        ]);
    }
    
    // Mark attendance for all team members
    $currentTime = date('H:i:s');
    $markedCount = 0;
    $skippedCount = 0;
    $markedMembers = [];
    
    foreach ($teamMemberIds as $memberId) {
        // Check if attendance record already exists for this member
        $checkStmt = $pdo->prepare(
            "SELECT attendance_id, time_in, time_out, verification_status 
             FROM attendance 
             WHERE user_id = ? AND attendance_date = ? AND session = ? 
             LIMIT 1"
        );
        $checkStmt->execute([$memberId, $date, $session]);
        $existingAttendance = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existingAttendance) {
            // Update existing record with time_out (only if not already set)
            if (empty($existingAttendance['time_out'])) {
                $updateStmt = $pdo->prepare(
                    "UPDATE attendance 
                     SET time_out = ?, 
                         verification_status = 'verified',
                         status = 'present',
                         updated_at = NOW()
                     WHERE attendance_id = ?"
                );
                $updateStmt->execute([$currentTime, $existingAttendance['attendance_id']]);
                $markedCount++;
                $markedMembers[] = $memberId;
            } else {
                $skippedCount++;
            }
        } else {
            // Create new attendance record
            $insertStmt = $pdo->prepare(
                "INSERT INTO attendance 
                 (user_id, attendance_date, session, time_in, time_out, status, verification_status, recorded_by, notes, created_at, updated_at)
                 VALUES (?, ?, ?, NULL, ?, 'present', 'verified', 'system', 'Auto-marked present on task completion', NOW(), NOW())"
            );
            $insertStmt->execute([$memberId, $date, $session, $currentTime]);
            $markedCount++;
            $markedMembers[] = $memberId;
        }
    }
    
    kolektrash_respond_json(200, [
        'status' => 'success',
        'message' => "Congratulations! All tasks completed. {$markedCount} team member(s) automatically marked as present.",
        'data' => [
            'date' => $date,
            'session' => $session,
            'time_out' => $currentTime,
            'total_stops' => $totalStopsSum,
            'completed_stops' => $completedStopsSum,
            'team_members_marked' => $markedCount,
            'team_members_skipped' => $skippedCount,
            'marked_user_ids' => $markedMembers
        ]
    ]);

} catch (Throwable $e) {
    kolektrash_respond_json(400, [
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
