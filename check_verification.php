<?php
require_once __DIR__ . '/backend/config/database.php';

$conn = (new Database())->connect();

echo "=== Email Verifications Table ===\n\n";

$stmt = $conn->prepare("SELECT * FROM email_verifications WHERE email = 'ianjayanonuevo26@gmail.com' ORDER BY created_at DESC LIMIT 5");
$stmt->execute();
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($results)) {
    echo "No verification records found for ianjayanonuevo26@gmail.com\n";
} else {
    foreach ($results as $row) {
        echo "ID: " . $row['id'] . "\n";
        echo "Email: " . $row['email'] . "\n";
        echo "Code: " . $row['verification_code'] . "\n";
        echo "Expiry: " . $row['expiry_time'] . "\n";
        echo "Verified: " . ($row['verified'] ? 'YES' : 'NO') . "\n";
        echo "Used: " . ($row['used'] ? 'YES' : 'NO') . "\n";
        echo "Created: " . $row['created_at'] . "\n";
        echo "Last Sent: " . $row['last_sent_at'] . "\n";
        echo "---\n";
    }
}

echo "\nCurrent Time: " . date('Y-m-d H:i:s') . "\n";
?>
