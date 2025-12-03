<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$date = $_GET['date'] ?? date('Y-m-d');
$session = $_GET['session'] ?? 'AM';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Check attendance for this date/session
    $stmt = $db->prepare("
        SELECT 
            a.attendance_id,
            a.user_id,
            a.attendance_date,
            a.session,
            a.verification_status,
            u.role_id,
            COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name,
            CASE 
                WHEN u.role_id = 3 THEN 'Driver'
                WHEN u.role_id = 4 THEN 'Collector'
                ELSE 'Other'
            END as role_name
        FROM attendance a
        JOIN user u ON a.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE 
            a.attendance_date = :date
            AND a.session = :session
            AND a.verification_status = 'verified'
            AND u.role_id IN (3,4)
        ORDER BY u.role_id, a.time_in ASC
    ");
    
    $stmt->execute([
        ':date' => $date,
        ':session' => strtoupper($session)
    ]);
    
    $personnel = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $drivers = array_filter($personnel, fn($p) => (int)$p['role_id'] === 3);
    $collectors = array_filter($personnel, fn($p) => (int)$p['role_id'] === 4);
    
    echo json_encode([
        'success' => true,
        'date' => $date,
        'session' => strtoupper($session),
        'total_personnel' => count($personnel),
        'drivers_count' => count($drivers),
        'collectors_count' => count($collectors),
        'drivers' => array_values($drivers),
        'collectors' => array_values($collectors),
        'can_generate_tasks' => count($drivers) >= 2 && count($collectors) >= 2,
        'message' => count($drivers) >= 2 && count($collectors) >= 2 
            ? 'Sufficient personnel to generate tasks' 
            : 'Insufficient personnel (need at least 2 drivers and 2 collectors)'
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
