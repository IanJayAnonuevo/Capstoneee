<?php
require_once __DIR__ . '/_bootstrap.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
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
    
    // Only foremen and admins can review requests
    if (!in_array($currentUser['role'], ['foreman', 'admin'], true)) {
        kolektrash_respond_json(403, [
            'status' => 'error',
            'message' => 'Only foremen and admins can review attendance requests.'
        ]);
    }

    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    $requestId = isset($input['request_id']) ? (int)$input['request_id'] : null;
    $decision = isset($input['decision']) ? trim($input['decision']) : null;
    $reviewNote = isset($input['review_note']) ? trim($input['review_note']) : null;
    $reviewNote = $reviewNote === '' ? null : $reviewNote;

    if (!$requestId || !$decision) {
        throw new RuntimeException('Missing required fields: request_id and decision.');
    }

    if (!in_array($decision, ['approved', 'declined'], true)) {
        throw new RuntimeException('Invalid decision. Must be: approved or declined.');
    }

    $pdo->beginTransaction();

    // Get the attendance request
    $requestStmt = $pdo->prepare("
        SELECT ar.*, 
               u.username,
               COALESCE(CONCAT(TRIM(up.firstname), ' ', TRIM(up.lastname)), u.username) AS personnel_name
        FROM attendance_request ar
        INNER JOIN user u ON ar.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE ar.id = ?
        LIMIT 1
    ");
    $requestStmt->execute([$requestId]);
    $request = $requestStmt->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        throw new RuntimeException('Attendance request not found.');
    }

    // Check if already reviewed
    if ($request['request_status'] !== 'pending') {
        throw new RuntimeException('This attendance request has already been reviewed.');
    }

    // Update the request
    $updateStmt = $pdo->prepare("
        UPDATE attendance_request
        SET request_status = ?,
            foreman_id = ?,
            review_note = ?,
            reviewed_at = NOW()
        WHERE id = ?
    ");

    $updateStmt->execute([
        $decision,
        $currentUser['user_id'],
        $reviewNote,
        $requestId
    ]);

    // Fetch updated request with full details
    $updatedStmt = $pdo->prepare("
        SELECT 
            ar.*,
            u.username,
            u.role_id,
            COALESCE(CONCAT(TRIM(up.firstname), ' ', TRIM(up.lastname)), u.username) AS personnel_name,
            dr.date AS schedule_date,
            dr.barangay_name,
            dr.start_time,
            dr.end_time,
            f.username AS foreman_username,
            COALESCE(CONCAT(TRIM(fp.firstname), ' ', TRIM(fp.lastname)), f.username) AS foreman_name,
            CASE 
                WHEN u.role_id = 3 THEN 'Truck Driver'
                WHEN u.role_id = 4 THEN 'Garbage Collector'
                ELSE 'Unknown'
            END AS role_name
        FROM attendance_request ar
        INNER JOIN user u ON ar.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN daily_route dr ON ar.schedule_id = dr.id
        LEFT JOIN user f ON ar.foreman_id = f.user_id
        LEFT JOIN user_profile fp ON f.user_id = fp.user_id
        WHERE ar.id = ?
        LIMIT 1
    ");
    $updatedStmt->execute([$requestId]);
    $updated = $updatedStmt->fetch(PDO::FETCH_ASSOC);

    // Build photo URL
    if ($updated['photo_path']) {
        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
        $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
        $baseUrl = $protocol . $host . '/kolektrash/';
        $updated['photo_url'] = $baseUrl . $updated['photo_path'];
    }

    // Create notification for the personnel
    $notificationPayload = json_encode([
        'type' => 'attendance_reviewed',
        'request_id' => $requestId,
        'decision' => $decision,
        'reviewed_by' => $currentUser['user_id'],
        'reviewer_name' => $currentUser['role'] === 'admin' ? 'Admin' : ($updated['foreman_name'] ?? 'Foreman'),
        'reviewed_at' => $updated['reviewed_at'],
        'review_note' => $reviewNote
    ]);

    $notificationStmt = $pdo->prepare("
        INSERT INTO notification (recipient_id, message, created_at, response_status)
        VALUES (?, ?, NOW(), 'unread')
    ");
    $notificationStmt->execute([$request['user_id'], $notificationPayload]);

    if ($decision === 'approved') {
        $attendanceDate = determineAttendanceDate($updated);
        $session = determineAttendanceSession($updated);
        $timeIn = determineTimeIn($updated);

        if (!$attendanceDate || !$session) {
            throw new RuntimeException('Unable to determine attendance date/session for this request.');
        }

        $existingAttendanceStmt = $pdo->prepare("
            SELECT attendance_id 
            FROM attendance 
            WHERE user_id = ? AND attendance_date = ? AND session = ?
            LIMIT 1
        ");
        $existingAttendanceStmt->execute([$request['user_id'], $attendanceDate, $session]);
        $attendanceId = $existingAttendanceStmt->fetchColumn();

        if ($attendanceId) {
            $updateAttendanceStmt = $pdo->prepare("
                UPDATE attendance
                SET time_in = COALESCE(time_in, ?),
                    status = 'present',
                    verification_status = 'verified',
                    recorded_by = ?,
                    notes = COALESCE(?, notes),
                    updated_at = NOW()
                WHERE attendance_id = ?
            ");
            $updateAttendanceStmt->execute([
                $timeIn,
                $currentUser['user_id'],
                $reviewNote,
                $attendanceId
            ]);
        } else {
            $insertAttendanceStmt = $pdo->prepare("
                INSERT INTO attendance (
                    user_id,
                    attendance_date,
                    session,
                    time_in,
                    status,
                    verification_status,
                    recorded_by,
                    notes
                ) VALUES (?, ?, ?, ?, 'present', 'verified', ?, ?)
            ");
            $insertAttendanceStmt->execute([
                $request['user_id'],
                $attendanceDate,
                $session,
                $timeIn,
                $currentUser['user_id'],
                $reviewNote
            ]);
        }
    }

    $pdo->commit();

    kolektrash_respond_json(200, [
        'status' => 'success',
        'message' => $decision === 'approved' 
            ? 'Attendance request approved successfully.' 
            : 'Attendance request declined.',
        'data' => [
            'request' => $updated
        ]
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    kolektrash_respond_json(400, [
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

function determineAttendanceDate(array $request): ?string
{
    if (!empty($request['schedule_date'])) {
        return $request['schedule_date'];
    }
    if (!empty($request['submitted_at'])) {
        return date('Y-m-d', strtotime($request['submitted_at']));
    }
    return null;
}

function determineAttendanceSession(array $request): string
{
    if (!empty($request['start_time'])) {
        return $request['start_time'] >= '12:00:00' ? 'PM' : 'AM';
    }
    if (!empty($request['submitted_at'])) {
        $hour = (int)date('H', strtotime($request['submitted_at']));
        return $hour >= 12 ? 'PM' : 'AM';
    }
    return 'AM';
}

function determineTimeIn(array $request): string
{
    if (!empty($request['submitted_at'])) {
        return date('H:i:s', strtotime($request['submitted_at']));
    }
    if (!empty($request['start_time'])) {
        return $request['start_time'];
    }
    return date('H:i:s');
}