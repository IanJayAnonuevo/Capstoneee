<?php
date_default_timezone_set('Asia/Manila');
// Explicit CORS Headers
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

require_once __DIR__ . '/../includes/cors.php';

require_once __DIR__ . '/_bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    kolektrash_respond_json(405, [
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}

require_once __DIR__ . '/../config/database.php';

try {
    $currentUser = kolektrash_require_auth();
    
    // Debug logging
    error_log('Current user role: ' . json_encode($currentUser));
    
    // Only foremen and admins can review requests
    if (!in_array($currentUser['role'], ['foreman', 'admin'], true)) {
        kolektrash_respond_json(403, [
            'status' => 'error',
            'message' => 'Only foremen and admins can review attendance requests.',
            'debug' => [
                'your_role' => $currentUser['role'],
                'allowed_roles' => ['foreman', 'admin']
            ]
        ]);
    }

    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    // CRITICAL: Set MySQL session timezone to Philippine Time
    $pdo->exec("SET time_zone = '+08:00'");

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

    // Build photo URL - just return relative path and let frontend resolve it
    if ($updated['photo_path']) {
        if ($decision === 'approved') {
            // Determine if this request was filed for time_in (default) or time_out (intent saved in remarks)
            $attendanceRecorded = false;
            try {
                $remarksMeta = null;
                if (!empty($updated['remarks'])) {
                    $decoded = json_decode($updated['remarks'], true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $remarksMeta = $decoded;
                    }
                }

                $intent = $remarksMeta['intent'] ?? null;

                // Allow determineAttendanceDate/Session to consider remarks metadata if present
                $attendanceDate = determineAttendanceDate(array_merge($updated, ['remarks_meta' => $remarksMeta]));
                $session = determineAttendanceSession(array_merge($updated, ['remarks_meta' => $remarksMeta]));

                if ($attendanceDate && $session) {
                    $existingAttendanceStmt = $pdo->prepare("
                        SELECT attendance_id, time_in, time_out, verification_status 
                        FROM attendance 
                        WHERE user_id = ? AND attendance_date = ? AND session = ?
                        LIMIT 1
                    ");
                    $existingAttendanceStmt->execute([$request['user_id'], $attendanceDate, $session]);
                    $attendanceRow = $existingAttendanceStmt->fetch(PDO::FETCH_ASSOC);
                    $attendanceId = $attendanceRow['attendance_id'] ?? null;

                    if ($intent === 'time_out') {
                        // Approve as time-out: record time_out using submitted_at or current time
                        $timeOut = determineTimeOut($updated);

                        if ($attendanceId) {
                            $currentPhTime = date('Y-m-d H:i:s');
                            $updateAttendanceStmt = $pdo->prepare("
                                UPDATE attendance
                                SET time_out = COALESCE(time_out, ?),
                                    status = 'present',
                                    verification_status = 'verified',
                                    recorded_by = ?,
                                    notes = COALESCE(?, notes),
                                    updated_at = ?
                                WHERE attendance_id = ?
                            ");
                            $updateAttendanceStmt->execute([
                                $timeOut,
                                $currentUser['user_id'],
                                $reviewNote,
                                $currentPhTime,
                                $attendanceId
                            ]);
                        } else {
                            // If no attendance record exists yet, insert with time_out (time_in unknown)
                            $currentPhTime = date('Y-m-d H:i:s');
                            $insertAttendanceStmt = $pdo->prepare("
                                INSERT INTO attendance (
                                    user_id,
                                    attendance_date,
                                    session,
                                    time_out,
                                    status,
                                    verification_status,
                                    recorded_by,
                                    notes,
                                    created_at,
                                    updated_at
                                ) VALUES (?, ?, ?, ?, 'present', 'verified', ?, ?, ?, ?)
                            ");
                            $insertAttendanceStmt->execute([
                                $request['user_id'],
                                $attendanceDate,
                                $session,
                                $timeOut,
                                $currentUser['user_id'],
                                $reviewNote,
                                $currentPhTime,
                                $currentPhTime
                            ]);
                        }
                    } else {
                        // Default behavior: treat as time_in (existing logic)
                        $timeIn = determineTimeIn($updated);

                        if ($attendanceId) {
                            $currentPhTime = date('Y-m-d H:i:s');
                            $updateAttendanceStmt = $pdo->prepare("
                                UPDATE attendance
                                SET time_in = COALESCE(time_in, ?),
                                    status = 'present',
                                    verification_status = 'verified',
                                    recorded_by = ?,
                                    notes = COALESCE(?, notes),
                                    updated_at = ?
                                WHERE attendance_id = ?
                            ");
                            $updateAttendanceStmt->execute([
                                $timeIn,
                                $currentUser['user_id'],
                                $reviewNote,
                                $currentPhTime,
                                $attendanceId
                            ]);
                        } else {
                            $currentPhTime = date('Y-m-d H:i:s');
                            $insertAttendanceStmt = $pdo->prepare("
                                INSERT INTO attendance (
                                    user_id,
                                    attendance_date,
                                    session,
                                    time_in,
                                    status,
                                    verification_status,
                                    recorded_by,
                                    notes,
                                    created_at,
                                    updated_at
                                ) VALUES (?, ?, ?, ?, 'present', 'verified', ?, ?, ?, ?)
                            ");
                            $insertAttendanceStmt->execute([
                                $request['user_id'],
                                $attendanceDate,
                                $session,
                                $timeIn,
                                $currentUser['user_id'],
                                $reviewNote,
                                $currentPhTime,
                                $currentPhTime
                            ]);
                        }
                    }

                    $attendanceRecorded = true;
                } else {
                    // Could not determine attendance date/session — log and continue.
                    error_log('Attendance review: unable to determine attendance_date/session for request id=' . $requestId . ' user_id=' . $request['user_id']);
                }
            } catch (Throwable $e) {
                // Log but do not abort the review process — mark request as reviewed and notify user.
                error_log('Attendance recording failed for request id=' . $requestId . ': ' . $e->getMessage());
            }
            // If attendance recording failed or skipped, we still proceed and return success for the review.
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
    // Prefer explicit attendance_date in remarks_meta if present
    if (!empty($request['remarks_meta']['attendance_date'])) {
        return $request['remarks_meta']['attendance_date'];
    }
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
    // Prefer explicit session in remarks_meta if present
    if (!empty($request['remarks_meta']['session'])) {
        return $request['remarks_meta']['session'];
    }
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

function determineTimeOut(array $request): string
{
    if (!empty($request['submitted_at'])) {
        return date('H:i:s', strtotime($request['submitted_at']));
    }
    if (!empty($request['end_time'])) {
        return $request['end_time'];
    }
    return date('H:i:s');
}