<?php
// Get pending attendance for foreman verification
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
    $status = $_GET['status'] ?? null; // 'pending', 'verified', 'rejected'

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

    if ($status) {
        $query .= " AND a.verification_status = ?";
        $params[] = $status;
    }

    $query .= " ORDER BY 
        a.verification_status = 'pending' DESC,
        a.session,
        u.role_id, 
        a.time_in DESC";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $attendance = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get counts
    $stmtCounts = $pdo->prepare("
        SELECT 
            verification_status,
            session,
            COUNT(*) as count
        FROM attendance
        WHERE attendance_date = ?
        GROUP BY verification_status, session
    ");
    $stmtCounts->execute([$date]);
    $counts = $stmtCounts->fetchAll(PDO::FETCH_ASSOC);

    $summary = [
        'pending' => ['AM' => 0, 'PM' => 0],
        'verified' => ['AM' => 0, 'PM' => 0],
        'rejected' => ['AM' => 0, 'PM' => 0]
    ];

    foreach ($counts as $count) {
        $summary[$count['verification_status']][$count['session']] = (int)$count['count'];
    }

    echo json_encode([
        'success' => true,
        'date' => $date,
        'attendance' => $attendance,
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
