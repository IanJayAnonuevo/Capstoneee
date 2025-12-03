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

    // 1. Get time-in count (approved attendance requests for today)
    $timeInQuery = "SELECT 
                        COUNT(DISTINCT ar.user_id) as timed_in_count,
                        u.user_id,
                        up.firstname,
                        up.lastname,
                        u.role_id,
                        CASE 
                            WHEN u.role_id = 3 THEN 'Driver'
                            WHEN u.role_id = 4 THEN 'Collector'
                            ELSE 'Unknown'
                        END as role,
                        ar.submitted_at as time_in
                    FROM attendance_request ar
                    INNER JOIN user u ON ar.user_id = u.user_id
                    LEFT JOIN user_profile up ON u.user_id = up.user_id
                    WHERE DATE(ar.submitted_at) = :today
                    AND ar.request_status = 'approved'
                    AND u.role_id IN (3, 4)";
    
    // Get count
    $countQuery = "SELECT COUNT(DISTINCT ar.user_id) as timed_in_count
                   FROM attendance_request ar
                   INNER JOIN user u ON ar.user_id = u.user_id
                   WHERE DATE(ar.submitted_at) = :today
                   AND ar.request_status = 'approved'
                   AND u.role_id IN (3, 4)";
    $countStmt = $db->prepare($countQuery);
    $countStmt->bindParam(':today', $today);
    $countStmt->execute();
    $countData = $countStmt->fetch(PDO::FETCH_ASSOC);
    $timedInCount = (int)($countData['timed_in_count'] ?? 0);

    // Get detailed list
    $listQuery = "SELECT DISTINCT
                        u.user_id,
                        up.firstname,
                        up.lastname,
                        u.role_id,
                        CASE 
                            WHEN u.role_id = 3 THEN 'Driver'
                            WHEN u.role_id = 4 THEN 'Collector'
                            ELSE 'Unknown'
                        END as role,
                        MIN(ar.submitted_at) as time_in
                    FROM attendance_request ar
                    INNER JOIN user u ON ar.user_id = u.user_id
                    LEFT JOIN user_profile up ON u.user_id = up.user_id
                    WHERE DATE(ar.submitted_at) = :today
                    AND ar.request_status = 'approved'
                    AND u.role_id IN (3, 4)
                    GROUP BY u.user_id, up.firstname, up.lastname, u.role_id
                    ORDER BY MIN(ar.submitted_at) ASC";
    $listStmt = $db->prepare($listQuery);
    $listStmt->bindParam(':today', $today);
    $listStmt->execute();
    $timedInStaff = $listStmt->fetchAll(PDO::FETCH_ASSOC);

    // 2. Get absent/on leave count
    // Check for users with status 'On Leave' or leave requests approved for today
    $leaveQuery = "SELECT 
                        COUNT(DISTINCT u.user_id) as on_leave_count
                   FROM user u
                   WHERE u.status = 'On Leave'
                   AND u.role_id IN (3, 4)";
    $leaveStmt = $db->prepare($leaveQuery);
    $leaveStmt->execute();
    $leaveData = $leaveStmt->fetch(PDO::FETCH_ASSOC);
    $onLeaveCount = (int)($leaveData['on_leave_count'] ?? 0);

    // Get list of absent/on leave staff
    $absentListQuery = "SELECT 
                            u.user_id,
                            up.firstname,
                            up.lastname,
                            u.role_id,
                            u.status,
                            CASE 
                                WHEN u.role_id = 3 THEN 'Driver'
                                WHEN u.role_id = 4 THEN 'Collector'
                                ELSE 'Unknown'
                            END as role
                        FROM user u
                        LEFT JOIN user_profile up ON u.user_id = up.user_id
                        WHERE u.status = 'On Leave'
                        AND u.role_id IN (3, 4)
                        ORDER BY u.role_id, up.lastname";
    $absentListStmt = $db->prepare($absentListQuery);
    $absentListStmt->execute();
    $absentStaff = $absentListStmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate total absent or on leave
    $totalAbsentOrLeave = $onLeaveCount;

    // Prepare response
    echo json_encode([
        'success' => true,
        'data' => [
            'timed_in_count' => $timedInCount,
            'timed_in_staff' => array_map(function($staff) {
                return [
                    'user_id' => $staff['user_id'],
                    'name' => trim(($staff['firstname'] ?? '') . ' ' . ($staff['lastname'] ?? '')),
                    'role' => $staff['role'],
                    'time_in' => $staff['time_in']
                ];
            }, $timedInStaff),
            'absent_count' => 0, // Not tracking explicit absences yet
            'on_leave_count' => $onLeaveCount,
            'total_absent_or_leave' => $totalAbsentOrLeave,
            'absent_staff' => array_map(function($staff) {
                return [
                    'user_id' => $staff['user_id'],
                    'name' => trim(($staff['firstname'] ?? '') . ' ' . ($staff['lastname'] ?? '')),
                    'role' => $staff['role'],
                    'reason' => $staff['status']
                ];
            }, $absentStaff)
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
