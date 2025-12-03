<?php
header('Content-Type: text/plain');
require_once __DIR__ . '/backend/config/database.php';

$email = 'ianjayanonuevo26@gmail.com';

try {
    $conn = (new Database())->connect();
    
    if (!$conn) {
        echo "Database connection failed\n";
        exit;
    }
    
    // Delete old verification record
    $stmt = $conn->prepare('DELETE FROM email_verifications WHERE email = ?');
    $stmt->execute([$email]);
    
    echo "✅ Cleared old verification record for: $email\n";
    echo "You can now request a new verification code!\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
?>
