<?php
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
    
    // Only foremen and admins can review requests
    if (!in_array($currentUser['role'], ['foreman', 'admin'], true)) {
        kolektrash_respond_json(403, [
            'status' => 'error',
            'message' => 'Only foremen and admins can review leave requests.',
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

    // Get the leave request
    $requestStmt = $pdo->prepare("
        SELECT lr.*, 
               u.username,
               COALESCE(CONCAT(TRIM(up.firstname), ' ', TRIM(up.lastname)), u.username) AS personnel_name
        FROM leave_request lr
        INNER JOIN user u ON lr.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE lr.id = ?
        LIMIT 1
    ");
    $requestStmt->execute([$requestId]);
    $request = $requestStmt->fetch(PDO::FETCH_ASSOC);

    if (!$request) {
        throw new RuntimeException('Leave request not found.');
    }

    // Check if already reviewed
    if ($request['request_status'] !== 'pending') {
        throw new RuntimeException('This leave request has already been reviewed.');
    }

    // Update the request
    $updateStmt = $pdo->prepare("
        UPDATE leave_request
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
            lr.*,
            u.username,
            u.role_id,
            COALESCE(CONCAT(TRIM(up.firstname), ' ', TRIM(up.lastname)), u.username) AS personnel_name,
            f.username AS foreman_username,
            COALESCE(CONCAT(TRIM(fp.firstname), ' ', TRIM(fp.lastname)), f.username) AS foreman_name,
            CASE 
                WHEN u.role_id = 3 THEN 'Truck Driver'
                WHEN u.role_id = 4 THEN 'Garbage Collector'
                ELSE 'Unknown'
            END AS role_name
        FROM leave_request lr
        INNER JOIN user u ON lr.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN user f ON lr.foreman_id = f.user_id
        LEFT JOIN user_profile fp ON f.user_id = fp.user_id
        WHERE lr.id = ?
        LIMIT 1
    ");
    $updatedStmt->execute([$requestId]);
    $updated = $updatedStmt->fetch(PDO::FETCH_ASSOC);

    // Send notification to the requester
    $notificationPayload = json_encode([
        'type' => 'leave_request_reviewed',
        'request_id' => $requestId,
        'decision' => $decision,
        'leave_type' => $updated['leave_type'],
        'start_date' => $updated['start_date'],
        'end_date' => $updated['end_date'],
        'foreman_name' => $updated['foreman_name'],
        'review_note' => $reviewNote,
        'reviewed_at' => $updated['reviewed_at']
    ]);

    $notificationStmt = $pdo->prepare("
        INSERT INTO notification (recipient_id, message, created_at, response_status)
        VALUES (?, ?, NOW(), 'unread')
    ");
    $notificationStmt->execute([$request['user_id'], $notificationPayload]);

    $pdo->commit();

    kolektrash_respond_json(200, [
        'status' => 'success',
        'message' => $decision === 'approved' 
            ? 'Leave request approved successfully.' 
            : 'Leave request declined.',
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
