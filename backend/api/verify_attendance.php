<?php
// Foreman verification API - Confirm that personnel are actually on site
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $attendance_id = $input['attendance_id'] ?? null;
    $foreman_id = $input['foreman_id'] ?? null;
    $verification_status = $input['verification_status'] ?? 'verified'; // 'verified' or 'rejected'
    $notes = $input['notes'] ?? null;

    if (!$attendance_id || !$foreman_id) {
        throw new Exception('Missing required fields: attendance_id and foreman_id');
    }

    if (!in_array($verification_status, ['verified', 'rejected'])) {
        throw new Exception('Invalid verification status');
    }

    // Verify foreman exists and has foreman role
    $stmtForeman = $pdo->prepare("SELECT user_id FROM user WHERE user_id = ? AND role_id = 7");
    $stmtForeman->execute([$foreman_id]);
    if (!$stmtForeman->fetch()) {
        throw new Exception('Invalid foreman credentials');
    }

    // Get attendance record
    $stmtCheck = $pdo->prepare("SELECT * FROM attendance WHERE attendance_id = ?");
    $stmtCheck->execute([$attendance_id]);
    $attendance = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if (!$attendance) {
        throw new Exception('Attendance record not found');
    }

    // Update verification status
    $stmtUpdate = $pdo->prepare("
        UPDATE attendance 
        SET verification_status = ?, 
            verified_by = ?, 
            verified_at = NOW(), 
            verification_notes = ?,
            updated_at = NOW()
        WHERE attendance_id = ?
    ");
    $stmtUpdate->execute([$verification_status, $foreman_id, $notes, $attendance_id]);

    // Fetch updated record with user info
    $stmtGet = $pdo->prepare("
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
        WHERE a.attendance_id = ?
    ");
    $stmtGet->execute([$attendance_id]);
    $updated = $stmtGet->fetch(PDO::FETCH_ASSOC);

    $message = $verification_status === 'verified' 
        ? 'Attendance verified successfully' 
        : 'Attendance rejected';

    echo json_encode([
        'success' => true,
        'message' => $message,
        'attendance' => $updated
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
