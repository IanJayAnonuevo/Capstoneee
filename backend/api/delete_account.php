<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed'
    ]);
    exit();
}

$json_input = file_get_contents("php://input");
$data = json_decode($json_input);

if (!$data || !isset($data->user_id)) {
    echo json_encode([
        'status' => 'error',
        'message' => 'User ID is required'
    ]);
    exit();
}

try {
    // Get current admin user ID from auth
    $currentUser = kolektrash_current_user();
    $deletedBy = $currentUser['user_id'] ?? null;
    
    // Check if user exists and is not already deleted
    $stmt = $db->prepare("SELECT user_id, username, deleted_at FROM user WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User not found'
        ]);
        exit();
    }
    
    if ($user['deleted_at'] !== null) {
        echo json_encode([
            'status' => 'error',
            'message' => 'User is already deleted'
        ]);
        exit();
    }
    
    // Soft delete: Set deleted_at timestamp and deleted_by user
    $now = date('Y-m-d H:i:s');
    $stmt = $db->prepare("
        UPDATE user 
        SET deleted_at = :deleted_at,
            deleted_by = :deleted_by,
            account_status = 'suspended'
        WHERE user_id = :user_id
    ");
    $stmt->bindParam(':deleted_at', $now);
    $stmt->bindParam(':deleted_by', $deletedBy);
    $stmt->bindParam(':user_id', $data->user_id);
    $stmt->execute();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'User deleted successfully',
        'deleted_at' => $now,
        'deleted_by' => $deletedBy
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?> 
