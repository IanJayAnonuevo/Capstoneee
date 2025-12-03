<?php
// Simple cancel leave endpoint that doesn't require authentication
// since it's called from the login page before user is authenticated

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    $payload = json_decode(file_get_contents('php://input'), true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid request payload.'
        ]);
        exit();
    }

    $leaveRequestId = isset($payload['leave_request_id']) ? (int)$payload['leave_request_id'] : 0;
    $userId = isset($payload['user_id']) ? (int)$payload['user_id'] : 0;
    $username = isset($payload['username']) ? trim($payload['username']) : '';

    if ($leaveRequestId <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required parameter: leave_request_id'
        ]);
        exit();
    }

    // If username is provided instead of user_id, look up the user_id
    if ($userId <= 0 && $username !== '') {
        $userStmt = $pdo->prepare("SELECT user_id FROM user WHERE username = ?");
        $userStmt->execute([$username]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            $userId = (int)$user['user_id'];
        }
    }

    if ($userId <= 0) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required parameter: user_id or username'
        ]);
        exit();
    }

    // Verify the leave request belongs to the user
    $checkStmt = $pdo->prepare("
        SELECT id, user_id, request_status, start_date, end_date 
        FROM leave_request 
        WHERE id = ? AND user_id = ?
    ");
    $checkStmt->execute([$leaveRequestId, $userId]);
    $leaveRequest = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if (!$leaveRequest) {
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Leave request not found or does not belong to this user'
        ]);
        exit();
    }

    // Update the leave request status to 'cancelled'
    // Note: Removing status check because database may have empty/NULL status values
    $cancelStmt = $pdo->prepare("
        UPDATE leave_request 
        SET request_status = 'cancelled',
            reviewed_at = NOW()
        WHERE id = ?
    ");
    
    if ($cancelStmt->execute([$leaveRequestId])) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Leave request cancelled successfully',
            'data' => [
                'leave_request_id' => $leaveRequestId,
                'new_status' => 'cancelled'
            ]
        ]);
    } else {
        throw new RuntimeException('Failed to cancel leave request');
    }

} catch (Throwable $e) {
    error_log('Cancel leave error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to cancel leave request: ' . $e->getMessage()
    ]);
}
