<?php
require_once __DIR__ . '/_bootstrap.php';
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once("../config/database.php");

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['user_id'])) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "User ID is required."
    ]);
    exit();
}

$userId = $input['user_id'];

try {
    $conn = (new Database())->connect();
    
    // First check if user exists
    $checkStmt = $conn->prepare("SELECT user_id, account_status FROM user WHERE user_id = ?");
    $checkStmt->execute([$userId]);
    $user = $checkStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception("User not found.");
    }
    
    // Suspend account and force offline
    $stmt = $conn->prepare("UPDATE user SET account_status = 'suspended', online_status = 'offline' WHERE user_id = ?");
    $stmt->execute([$userId]);

    echo json_encode([
        "success" => true,
        "message" => "User account has been suspended."
    ]);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
}
?>












