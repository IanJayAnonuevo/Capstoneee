<?php
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
    if (!in_array($currentUser['role'], ['truck_driver', 'garbage_collector'], true)) {
        kolektrash_respond_json(403, [
            'status' => 'error',
            'message' => 'Only truck drivers and garbage collectors can file attendance requests.'
        ]);
    }

    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    // Validate the personnel record directly in the database for extra safety.
    $userStmt = $pdo->prepare("
        SELECT u.user_id, u.role_id, u.username,
               COALESCE(CONCAT(TRIM(up.firstname), ' ', TRIM(up.lastname)), u.username) AS full_name
        FROM user u
        LEFT JOIN user_profile up ON up.user_id = u.user_id
        WHERE u.user_id = ? AND u.role_id IN (3, 4)
        LIMIT 1
    ");
    $userStmt->execute([$currentUser['user_id']]);
    $personnel = $userStmt->fetch();

    if (!$personnel) {
        throw new RuntimeException('User record not found or not authorized.');
    }

    $scheduleId = isset($_POST['schedule_id']) && $_POST['schedule_id'] !== '' ? (int)$_POST['schedule_id'] : null;
    $remarks = isset($_POST['remarks']) ? trim($_POST['remarks']) : null;
    $remarks = $remarks === '' ? null : $remarks;
    // Optional intent: 'time_in' (default) or 'time_out'
    $intent = isset($_POST['intent']) ? trim($_POST['intent']) : null;
    $attendanceDate = isset($_POST['attendance_date']) ? trim($_POST['attendance_date']) : null;
    $sessionField = isset($_POST['session']) ? trim($_POST['session']) : null;
    $locationLat = isset($_POST['location_lat']) && $_POST['location_lat'] !== '' ? (float)$_POST['location_lat'] : null;
    $locationLng = isset($_POST['location_lng']) && $_POST['location_lng'] !== '' ? (float)$_POST['location_lng'] : null;

    if ($scheduleId !== null) {
        $scheduleStmt = $pdo->prepare("SELECT id FROM daily_route WHERE id = ? LIMIT 1");
        $scheduleStmt->execute([$scheduleId]);
        if (!$scheduleStmt->fetch()) {
            throw new RuntimeException('Invalid schedule_id provided.');
        }
    }

    if (!isset($_FILES['photo']) || !is_uploaded_file($_FILES['photo']['tmp_name'])) {
        throw new RuntimeException('Photo proof is required.');
    }

    $photo = $_FILES['photo'];
    if ($photo['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Failed to upload photo. Please try again.');
    }

    $maxSize = 5 * 1024 * 1024; // 5 MB
    if ($photo['size'] > $maxSize) {
        throw new RuntimeException('Photo is too large. Maximum size is 5 MB.');
    }

    $mimeType = null;
    if (class_exists('finfo')) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($photo['tmp_name']);
    } elseif (function_exists('mime_content_type')) {
        $mimeType = mime_content_type($photo['tmp_name']);
    }

    $allowedTypes = [
        'image/jpeg' => '.jpg',
        'image/png'  => '.png',
        'image/webp' => '.webp'
    ];

    if (!$mimeType || !isset($allowedTypes[$mimeType])) {
        throw new RuntimeException('Invalid photo format. Allowed formats: JPG, PNG, WEBP.');
    }

    $uploadDir = __DIR__ . '/../../uploads/attendance/';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
        throw new RuntimeException('Unable to create upload directory.');
    }

    try {
        $randomSuffix = bin2hex(random_bytes(4));
    } catch (Exception $e) {
        $randomSuffix = uniqid();
    }

    $fileName = sprintf(
        'attendance_%d_%s_%s%s',
        $personnel['user_id'],
        date('YmdHis'),
        $randomSuffix,
        $allowedTypes[$mimeType]
    );

    $destinationPath = $uploadDir . $fileName;
    if (!move_uploaded_file($photo['tmp_name'], $destinationPath)) {
        throw new RuntimeException('Unable to save uploaded photo.');
    }

    $relativePath = 'uploads/attendance/' . $fileName;

    // Prevent creating a new attendance request if an attendance record for today
    // already exists and has been verified (approved) by the foreman. This is
    // a server-side safeguard to avoid duplicated approved attendance.
    $today = date('Y-m-d');
    // Determine session from current time (AM/PM)
    $hour = (int)date('H');
    $sessionNow = $hour >= 12 ? 'PM' : 'AM';

    $checkStmt = $pdo->prepare(
        "SELECT attendance_id FROM attendance WHERE user_id = ? AND attendance_date = ? AND session = ? AND verification_status = 'verified' LIMIT 1"
    );
    $checkStmt->execute([$personnel['user_id'], $today, $sessionNow]);
    $alreadyVerified = (bool)$checkStmt->fetchColumn();

    if ($alreadyVerified) {
        kolektrash_respond_json(400, [
            'status' => 'error',
            'message' => 'Attendance for today has already been approved. You cannot submit another request.'
        ]);
    }

    // If intent provided, store it (and provided attendance_date/session) inside remarks as JSON for review-time processing.
    if ($intent) {
        $meta = [];
        if ($remarks) {
            // try to decode existing remarks if it's JSON
            $decoded = json_decode($remarks, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $meta = $decoded;
            } else {
                $meta['note'] = $remarks;
            }
        }
        $meta['intent'] = $intent;
        if ($attendanceDate) $meta['attendance_date'] = $attendanceDate;
        if ($sessionField) $meta['session'] = $sessionField;
        $remarksToSave = json_encode($meta);
    } else {
        $remarksToSave = $remarks;
    }

    $insertStmt = $pdo->prepare("INSERT INTO attendance_request (user_id, schedule_id, photo_path, remarks, location_lat, location_lng) VALUES (:user_id, :schedule_id, :photo_path, :remarks, :location_lat, :location_lng)");

    $insertStmt->execute([
        ':user_id' => $personnel['user_id'],
        ':schedule_id' => $scheduleId,
        ':photo_path' => $relativePath,
        ':remarks' => $remarksToSave,
        ':location_lat' => $locationLat,
        ':location_lng' => $locationLng
    ]);

    $requestId = (int)$pdo->lastInsertId();

    $requestStmt = $pdo->prepare("
        SELECT ar.*, dr.date AS schedule_date, dr.barangay_name
        FROM attendance_request ar
        LEFT JOIN daily_route dr ON dr.id = ar.schedule_id
        WHERE ar.id = ?
        LIMIT 1
    ");
    $requestStmt->execute([$requestId]);
    $request = $requestStmt->fetch();

    $foremanStmt = $pdo->query("SELECT user_id FROM user WHERE role_id = 7");
    $foremanIds = $foremanStmt ? $foremanStmt->fetchAll(PDO::FETCH_COLUMN) : [];

    if (!empty($foremanIds)) {
        $notificationPayload = json_encode([
            'type' => 'attendance_request',
            'request_id' => $requestId,
            'user_id' => (int)$personnel['user_id'],
            'name' => $personnel['full_name'],
            'submitted_at' => $request['submitted_at'] ?? date('Y-m-d H:i:s'),
            'remarks' => $remarks,
            'schedule_id' => $scheduleId,
            'photo_path' => $relativePath
        ]);

        $notificationStmt = $pdo->prepare("
            INSERT INTO notification (recipient_id, message, created_at, response_status)
            VALUES (?, ?, NOW(), 'unread')
        ");

        foreach ($foremanIds as $foremanId) {
            $notificationStmt->execute([$foremanId, $notificationPayload]);
        }
    }

    kolektrash_respond_json(201, [
        'status' => 'success',
        'message' => 'Attendance request submitted. Awaiting foreman review.',
        'data' => [
            'request' => $request,
            'photo_path' => $relativePath
        ]
    ]);
} catch (Throwable $e) {
    kolektrash_respond_json(400, [
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

