<?php
require_once __DIR__ . '/_bootstrap.php';
// CORS is handled centrally in includes/cors.php (included by _bootstrap.php)
// The cargo-culted per-file CORS headers were removed to avoid hardcoded origins

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/Database.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Check if users table exists and get admin user
try {
    $query = "SELECT id, username, email, fullName, role FROM users WHERE username = 'admin' LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    if($stmt->rowCount() > 0) {
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode([
            'status' => 'success',
            'message' => 'Admin user found',
            'user' => $user,
            'total_users' => 'checking...'
        ]);
    } else {
        // Check total users
        $countQuery = "SELECT COUNT(*) as total FROM users";
        $countStmt = $db->prepare($countQuery);
        $countStmt->execute();
        $count = $countStmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'status' => 'error',
            'message' => 'Admin user not found',
            'total_users' => $count['total'],
            'suggestion' => 'Need to create admin user'
        ]);
    }
} catch(PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
