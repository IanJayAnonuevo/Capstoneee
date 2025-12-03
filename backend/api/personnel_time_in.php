<?php
// Personnel self-recording API - Drivers and Collectors record their own attendance
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
    
    $user_id = $input['user_id'] ?? null;
    $attendance_date = $input['attendance_date'] ?? date('Y-m-d');
    $session = $input['session'] ?? null;
    $action = $input['action'] ?? 'time_in';
    $reason = $input['reason'] ?? null;
    $requirements = $input['requirements'] ?? null;

    if (!$user_id || !$session) {
        throw new Exception('Missing required fields: user_id and session');
    }

    if (!in_array($session, ['AM', 'PM'])) {
        throw new Exception('Invalid session. Must be AM or PM');
    }

    // Verify user is personnel (role_id 3 or 4)
    $stmtUser = $pdo->prepare("
        SELECT u.user_id, u.username, u.role_id, up.firstname, up.lastname
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.user_id = ? AND u.role_id IN (3, 4)
    ");
    $stmtUser->execute([$user_id]);
    $user = $stmtUser->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        throw new Exception('User not found or not authorized');
    }

    $current_time = date('H:i:s');
    // Prefer client-provided hour/minute when available to respect user's local clock
    $client_hour = isset($input['client_hour']) ? (int)$input['client_hour'] : null;
    $client_minute = isset($input['client_minute']) ? (int)$input['client_minute'] : null;

    // Validate time window for time-in
    if ($action === 'time_in') {
        $hourNow = is_int($client_hour) ? $client_hour : (int)date('H');
        
        if ($session === 'AM') {
            // AM session: must time in between 5:00 AM - 6:00 AM
            if ($hourNow < 5 || $hourNow >= 6) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Time In for AM session is allowed only between 5:00 AM and 6:00 AM.'
                ]);
                exit;
            }
        } elseif ($session === 'PM') {
            // PM session: must time in between 1:00 PM - 2:00 PM
            if ($hourNow < 13 || $hourNow >= 14) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Time In for PM session is allowed only between 1:00 PM and 2:00 PM.'
                ]);
                exit;
            }
        }
    }

    // Check if attendance record exists
    $stmtCheck = $pdo->prepare("
        SELECT * FROM attendance 
        WHERE user_id = ? AND attendance_date = ? AND session = ?
    ");
    $stmtCheck->execute([$user_id, $attendance_date, $session]);
    $existing = $stmtCheck->fetch(PDO::FETCH_ASSOC);

    if ($action === 'time_in') {
        if ($existing && $existing['time_in']) {
            echo json_encode([
                'success' => false,
                'message' => 'Already timed in for this session',
                'attendance' => $existing
            ]);
            exit;
        }

        if ($existing) {
            // Update existing record
            $stmtUpdate = $pdo->prepare("
                UPDATE attendance 
                SET time_in = ?, status = 'present', verification_status = 'pending', updated_at = NOW()
                WHERE user_id = ? AND attendance_date = ? AND session = ?
            ");
            $stmtUpdate->execute([$current_time, $user_id, $attendance_date, $session]);
        } else {
            // Insert new record with pending verification
            $stmtInsert = $pdo->prepare("
                INSERT INTO attendance (user_id, attendance_date, session, time_in, status, verification_status)
                VALUES (?, ?, ?, ?, 'present', 'pending')
            ");
            $stmtInsert->execute([$user_id, $attendance_date, $session, $current_time]);
        }

        $message = 'Time in recorded. Waiting for foreman verification.';
    } elseif ($action === 'absent') {
        // Mark as absent - allow updating if already marked
        
        // Build notes with reason and requirements
        $notes = '';
        if ($reason) {
            $notes .= "Reason: " . $reason;
        }
        if ($requirements) {
            $notes .= ($notes ? "\n" : "") . "Required Documents: " . $requirements;
        }

        if ($existing) {
            // Update existing record - allow updating even if already absent
            $stmtUpdate = $pdo->prepare("
                UPDATE attendance 
                SET status = 'absent', verification_status = 'pending', notes = ?, updated_at = NOW()
                WHERE user_id = ? AND attendance_date = ? AND session = ?
            ");
            $stmtUpdate->execute([$notes, $user_id, $attendance_date, $session]);
            $message = $existing['status'] === 'absent' 
                ? 'Absence information updated. Waiting for foreman verification.' 
                : 'Absence recorded. Waiting for foreman verification.';
        } else {
            // Insert new record as absent
            $stmtInsert = $pdo->prepare("
                INSERT INTO attendance (user_id, attendance_date, session, status, verification_status, notes)
                VALUES (?, ?, ?, 'absent', 'pending', ?)
            ");
            $stmtInsert->execute([$user_id, $attendance_date, $session, $notes]);
            $message = 'Absence recorded. Waiting for foreman verification.';
        }
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

        // Enforce Time Out window for AM session: only allow between 12:00 and 12:59 (12:00 PM - 12:59 PM)
        if ($session === 'AM') {
            $hourNow = is_int($client_hour) ? $client_hour : (int)date('H');
            if ($hourNow < 12 || $hourNow >= 13) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Time Out for AM session is allowed only between 12:00 PM and 1:00 PM.'
                ]);
                exit;
            }
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
