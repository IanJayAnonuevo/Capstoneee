<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $date = $_GET['date'] ?? date('Y-m-d');
    $user_id = $_GET['user_id'] ?? null;
    $session = $_GET['session'] ?? null;

    // Build query based on filters
    $query = "
        SELECT 
            a.*,
            u.username,
            u.role_id,
            up.firstname,
            up.lastname,
            CASE 
                WHEN u.role_id = 3 THEN 'Driver'
                WHEN u.role_id = 4 THEN 'Collector'
                ELSE 'Unknown'
            END as designation
        FROM attendance a
        INNER JOIN user u ON a.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE a.attendance_date = ?
    ";

    $params = [$date];

    if ($user_id) {
        $query .= " AND a.user_id = ?";
        $params[] = $user_id;
    }

    if ($session) {
        $query .= " AND a.session = ?";
        $params[] = $session;
    }

    $query .= " ORDER BY u.role_id, u.username";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get all personnel for the day (even those without attendance records)
    $queryPersonnel = "
        SELECT 
            u.user_id,
            u.username,
            u.role_id,
            u.status as user_status,
            up.firstname,
            up.lastname,
            CASE 
                WHEN u.role_id = 3 THEN 'Driver'
                WHEN u.role_id = 4 THEN 'Collector'
                ELSE 'Unknown'
            END as designation
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.role_id IN (3, 4)
        ORDER BY u.role_id, u.username
    ";

    $stmtPersonnel = $pdo->prepare($queryPersonnel);
    $stmtPersonnel->execute();
    $personnel = $stmtPersonnel->fetchAll(PDO::FETCH_ASSOC);

    // Calculate summary statistics
    $summary = [
        'driver' => ['am' => ['present' => 0, 'absent' => 0, 'on_leave' => 0, 'pending' => 0], 
                     'pm' => ['present' => 0, 'absent' => 0, 'on_leave' => 0, 'pending' => 0]],
        'collector' => ['am' => ['present' => 0, 'absent' => 0, 'on_leave' => 0, 'pending' => 0], 
                        'pm' => ['present' => 0, 'absent' => 0, 'on_leave' => 0, 'pending' => 0]]
    ];

    foreach ($attendance as $record) {
        $role = $record['role_id'] == 3 ? 'driver' : 'collector';
        $session_key = strtolower($record['session']);
        $status = strtolower(str_replace('-', '_', $record['verification_status']));
        
        // Map 'verified' to 'present' for summary
        if ($status === 'verified') {
            $status = 'present';
        }
        
        if (isset($summary[$role][$session_key][$status])) {
            $summary[$role][$session_key][$status]++;
        }
    }

    // Note: We no longer count personnel without records in the summary
    // The summary only reflects actual database records
    // Personnel without records will simply not appear in any count

    echo json_encode([
        'success' => true,
        'date' => $date,
        'attendance' => $attendance,
        'personnel' => $personnel,
        'summary' => $summary
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
