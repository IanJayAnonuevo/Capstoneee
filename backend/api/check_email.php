<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $data = $_POST;
    }

    $email = isset($data['email']) ? strtolower(trim($data['email'])) : '';
    if ($email === '') {
        echo json_encode(['success' => false, 'message' => 'Email is required']);
        exit;
    }

    $db = (new Database())->connect();

    // Check existence in user table (count for debugging)
    $stmt = $db->prepare('SELECT COUNT(*) FROM user WHERE email = ?');
    $stmt->execute([$email]);
    $countInUser = (int)$stmt->fetchColumn();
    $existsInUser = $countInUser > 0;

    if ($existsInUser) {
        echo json_encode([
            'success' => true,
            'available' => false,
            'message' => 'Email is already registered.',
            'normalized_email' => $email,
            'found_in' => 'user',
            'counts' => ['user' => $countInUser]
        ]);
        exit;
    }

    echo json_encode([
        'success' => true,
        'available' => true, // available unless already in user table
        'message' => 'Email is available.',
        'normalized_email' => $email,
        'counts' => ['user' => $countInUser]
    ]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>


