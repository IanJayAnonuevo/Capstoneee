<?php
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

    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    $user_id = $input['user_id'] ?? null;
    $attendance_date = $input['attendance_date'] ?? date('Y-m-d');
    $session = $input['session'] ?? null; // 'AM' or 'PM'
    $action = $input['action'] ?? 'time_in'; // 'time_in' or 'time_out'
    $recorded_by = $input['recorded_by'] ?? null; // Foreman's user_id
    $notes = $input['notes'] ?? null;

    // Validate required fields
    if (!$user_id || !$session) {
        throw new Exception('Missing required fields: user_id and session are required');
    }

    if (!in_array($session, ['AM', 'PM'])) {
        throw new Exception('Invalid session. Must be AM or PM');
    }

    // Verify user exists and is personnel (role_id 3 or 4)
    $stmtUser = $pdo->prepare("
        SELECT u.user_id, u.username, u.role_id, up.firstname, up.lastname
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.user_id = ? AND u.role_id IN (3, 4)
    ");
    $stmtUser->execute([$user_id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found or not authorized for attendance');
    }

    $current_time = date('H:i:s');

    // Check if attendance record exists
    $stmtCheck = $pdo->prepare("
        SELECT * FROM attendance 
        WHERE user_id = ? AND attendance_date = ? AND session = ?
    ");
    $stmtCheck->execute([$user_id, $attendance_date, $session]);
    $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($action === 'time_in') {
        if ($existing && $existing['time_in']) {
            // Already timed in
            echo json_encode([
                'success' => false,
                'message' => 'Already timed in for this session',
                'attendance' => $existing
            ]);
            exit;
        }

        if ($existing) {
            // Update existing record with time_in
            $stmtUpdate = $pdo->prepare("
                UPDATE attendance 
                SET time_in = ?, status = 'present', recorded_by = ?, notes = ?, updated_at = NOW()
                WHERE user_id = ? AND attendance_date = ? AND session = ?
            ");
            $stmtUpdate->execute([$current_time, $recorded_by, $notes, $user_id, $attendance_date, $session]);
        } else {
            // Insert new record
            $stmtInsert = $pdo->prepare("
                INSERT INTO attendance (user_id, attendance_date, session, time_in, status, recorded_by, notes)
                VALUES (?, ?, ?, ?, 'present', ?, ?)
            ");
            $stmtInsert->execute([$user_id, $attendance_date, $session, $current_time, $recorded_by, $notes]);
        }

        $message = 'Time in recorded successfully';
    } else {
        // time_out
        if (!$existing || !$existing['time_in']) {
            throw new Exception('Cannot time out without timing in first');
        }

        if ($existing['time_out']) {
            echo json_encode([
                'success' => false,
                'message' => 'Already timed out for this session',
                'attendance' => $existing
            ]);
            exit;
        }

        $stmtUpdate = $pdo->prepare("
            UPDATE attendance 
            SET time_out = ?, updated_at = NOW()
            WHERE user_id = ? AND attendance_date = ? AND session = ?
        ");
        $stmtUpdate->execute([$current_time, $user_id, $attendance_date, $session]);

        $message = 'Time out recorded successfully';
    }

    // Fetch updated record
    $stmtCheck->execute([$user_id, $attendance_date, $session]);
    $updated = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'message' => $message,
        'attendance' => $updated,
        'user_info' => [
            'user_id' => $user['user_id'],
            'name' => trim(($user['firstname'] ?? '') . ' ' . ($user['lastname'] ?? '')),
            'username' => $user['username'],
            'role' => $user['role_id'] == 3 ? 'Driver' : 'Collector'
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
