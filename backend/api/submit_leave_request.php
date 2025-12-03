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
            'message' => 'Only truck drivers and garbage collectors can file leave requests.'
        ]);
    }

    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    // Validate the personnel record
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

    // Get form data
    $leaveType = isset($_POST['leave_type']) ? trim($_POST['leave_type']) : null;
    $startDate = isset($_POST['start_date']) ? trim($_POST['start_date']) : null;
    $endDate = isset($_POST['end_date']) ? trim($_POST['end_date']) : null;
    $reason = isset($_POST['reason']) ? trim($_POST['reason']) : null;

    // Validate required fields
    if (!$leaveType || !$startDate || !$endDate || !$reason) {
        throw new RuntimeException('Missing required fields: leave_type, start_date, end_date, and reason are required.');
    }

    // Validate leave type
    $validLeaveTypes = ['sick', 'vacation', 'emergency', 'personal', 'bereavement', 'other'];
    if (!in_array($leaveType, $validLeaveTypes, true)) {
        throw new RuntimeException('Invalid leave type. Must be one of: ' . implode(', ', $validLeaveTypes));
    }

    // Validate dates
    $startDateTime = strtotime($startDate);
    $endDateTime = strtotime($endDate);
    
    if ($startDateTime === false || $endDateTime === false) {
        throw new RuntimeException('Invalid date format. Use YYYY-MM-DD format.');
    }

    if ($endDateTime < $startDateTime) {
        throw new RuntimeException('End date cannot be before start date.');
    }

    // Handle optional document upload
    $documentPath = null;
    if (isset($_FILES['document']) && is_uploaded_file($_FILES['document']['tmp_name'])) {
        $document = $_FILES['document'];
        
        if ($document['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException('Failed to upload document. Please try again.');
        }

        $maxSize = 10 * 1024 * 1024; // 10 MB
        if ($document['size'] > $maxSize) {
            throw new RuntimeException('Document is too large. Maximum size is 10 MB.');
        }

        $mimeType = null;
        if (class_exists('finfo')) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($document['tmp_name']);
        } elseif (function_exists('mime_content_type')) {
            $mimeType = mime_content_type($document['tmp_name']);
        }

        $allowedTypes = [
            'image/jpeg' => '.jpg',
            'image/png'  => '.png',
            'image/webp' => '.webp',
            'application/pdf' => '.pdf',
            'application/msword' => '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => '.docx'
        ];

        if (!$mimeType || !isset($allowedTypes[$mimeType])) {
            throw new RuntimeException('Invalid document format. Allowed formats: JPG, PNG, WEBP, PDF, DOC, DOCX.');
        }

        $uploadDir = __DIR__ . '/../../uploads/leave_documents/';
        if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
            throw new RuntimeException('Unable to create upload directory.');
        }

        try {
            $randomSuffix = bin2hex(random_bytes(4));
        } catch (Exception $e) {
            $randomSuffix = uniqid();
        }

        $fileName = sprintf(
            'leave_%d_%s_%s%s',
            $personnel['user_id'],
            date('YmdHis'),
            $randomSuffix,
            $allowedTypes[$mimeType]
        );

        $destinationPath = $uploadDir . $fileName;
        if (!move_uploaded_file($document['tmp_name'], $destinationPath)) {
            throw new RuntimeException('Unable to save uploaded document.');
        }

        $documentPath = 'uploads/leave_documents/' . $fileName;
    }

    // Insert leave request
    $insertStmt = $pdo->prepare("
        INSERT INTO leave_request (
            user_id, 
            leave_type, 
            start_date, 
            end_date, 
            reason, 
            document_path
        ) VALUES (?, ?, ?, ?, ?, ?)
    ");

    $insertStmt->execute([
        $personnel['user_id'],
        $leaveType,
        $startDate,
        $endDate,
        $reason,
        $documentPath
    ]);

    $requestId = (int)$pdo->lastInsertId();

    // Get the created request
    $requestStmt = $pdo->prepare("
        SELECT * FROM leave_request WHERE id = ? LIMIT 1
    ");
    $requestStmt->execute([$requestId]);
    $request = $requestStmt->fetch();

    // Send notification to all foremen
    $foremanStmt = $pdo->query("SELECT user_id FROM user WHERE role_id = 7");
    $foremanIds = $foremanStmt ? $foremanStmt->fetchAll(PDO::FETCH_COLUMN) : [];

    if (!empty($foremanIds)) {
        $notificationPayload = json_encode([
            'type' => 'leave_request',
            'request_id' => $requestId,
            'user_id' => (int)$personnel['user_id'],
            'name' => $personnel['full_name'],
            'leave_type' => $leaveType,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'submitted_at' => $request['submitted_at'] ?? date('Y-m-d H:i:s')
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
        'message' => 'Leave request submitted successfully. Awaiting foreman review.',
        'data' => [
            'request' => $request,
            'document_path' => $documentPath
        ]
    ]);
} catch (Throwable $e) {
    kolektrash_respond_json(400, [
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
