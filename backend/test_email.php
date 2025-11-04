<?php
// Test email functionality
require_once 'config/email.php';
require_once 'lib/EmailHelper.php';

echo "=== Email Configuration Test ===\n";
echo "SMTP_HOST: " . SMTP_HOST . "\n";
echo "SMTP_PORT: " . SMTP_PORT . "\n";
echo "SMTP_USERNAME: " . SMTP_USERNAME . "\n";
echo "SMTP_PASSWORD: " . (SMTP_PASSWORD ? "SET (" . strlen(SMTP_PASSWORD) . " chars)" : "NOT SET") . "\n";
echo "SMTP_FROM_EMAIL: " . SMTP_FROM_EMAIL . "\n";
echo "SMTP_ENCRYPTION: " . SMTP_ENCRYPTION . "\n\n";

if (SMTP_USERNAME === 'YOUR-GMAIL-ADDRESS@gmail.com' || SMTP_PASSWORD === 'YOUR-16-CHARACTER-APP-PASSWORD') {
    echo "❌ ERROR: Please update your .env file with actual Gmail credentials!\n";
    echo "   SMTP_USERNAME and SMTP_PASSWORD are still set to placeholder values.\n\n";
    exit(1);
}

if (!SMTP_PASSWORD) {
    echo "❌ ERROR: SMTP_PASSWORD is not set!\n\n";
    exit(1);
}

echo "Testing email sending...\n";

try {
    $mailer = new EmailHelper();
    $result = $mailer->sendSignupVerificationCode(SMTP_FROM_EMAIL, 'Test User', '123456', date('Y-m-d H:i:s', strtotime('+30 minutes')));

    if ($result['transport']) {
        echo "✅ SUCCESS: Email sent successfully!\n";
        echo "   Transport used: " . $result['transport'] . "\n";
        echo "   Check your email at: " . SMTP_FROM_EMAIL . "\n";
    } else {
        echo "❌ FAILED: Email sending failed!\n";
    }
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}

echo "\n=== Test Complete ===\n";
?>