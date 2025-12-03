<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/database.php';

$email = $_GET['email'] ?? 'ianjayanonuevo26@gmail.com';

try {
    $conn = (new Database())->connect();
    
    if (!$conn) {
        echo json_encode(['error' => 'Database connection failed']);
        exit;
    }
    
    $stmt = $conn->prepare("SELECT * FROM email_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$email]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$result) {
        echo json_encode(['error' => 'No verification found for this email', 'email' => $email]);
    } else {
        echo json_encode([
            'email' => $result['email'],
            'code' => $result['verification_code'],
            'expiry' => $result['expiry_time'],
            'verified' => (bool)$result['verified'],
            'used' => (bool)$result['used'],
            'created' => $result['created_at'],
            'current_time' => date('Y-m-d H:i:s'),
            'is_expired' => (strtotime($result['expiry_time']) < time())
        ]);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
