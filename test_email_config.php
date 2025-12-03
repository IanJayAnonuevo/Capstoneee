<?php
require_once __DIR__ . '/backend/config/email.php';
require_once __DIR__ . '/backend/lib/EmailHelper.php';

echo "=== Email Configuration Test ===\n\n";

echo "SMTP Settings:\n";
echo "- Driver: " . SMTP_DRIVER . "\n";
echo "- Host: " . SMTP_HOST . "\n";
echo "- Port: " . SMTP_PORT . "\n";
echo "- Username: " . SMTP_USERNAME . "\n";
echo "- Password: " . (SMTP_PASSWORD ? str_repeat('*', strlen(SMTP_PASSWORD)) : 'NOT SET') . "\n";
echo "- From Email: " . SMTP_FROM_EMAIL . "\n";
echo "- Encryption: " . SMTP_ENCRYPTION . "\n\n";

echo "Attempting to send test email...\n\n";

try {
    $mailer = new EmailHelper();
    $result = $mailer->sendSignupVerificationCode(
        'ianjayanonuevo26@gmail.com',
        'Test User',
        '123456',
        date('Y-m-d H:i:s', strtotime('+30 minutes'))
    );
    
    echo "✅ SUCCESS!\n";
    echo "Transport used: " . ($result['transport'] ?? 'unknown') . "\n";
} catch (Exception $e) {
    echo "❌ FAILED!\n";
    echo "Error: " . $e->getMessage() . "\n";
}
?>
