<?php
// Load .env file manually
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load .env file from project root
loadEnv(__DIR__ . '/../../.env');

// Email configuration for PHPMailer
// Gmail SMTP settings

// Gmail account credentials
define('SMTP_HOST', getenv('SMTP_HOST') ?: 'smtp.gmail.com');
define('SMTP_PORT', (int)(getenv('SMTP_PORT') ?: 587));
define('SMTP_USERNAME', getenv('SMTP_USERNAME') ?: 'kolektrash@gmail.com');
define('SMTP_PASSWORD', getenv('SMTP_PASSWORD') ?: '');
define('SMTP_FROM_EMAIL', getenv('SMTP_FROM_EMAIL') ?: 'kolektrash@gmail.com');
define('SMTP_FROM_NAME', getenv('SMTP_FROM_NAME') ?: 'KolekTrash System');

// Email settings
define('EMAIL_CHARSET', 'UTF-8');
define('EMAIL_ENCODING', 'base64');

// Transport settings
define('SMTP_DRIVER', strtolower(getenv('SMTP_DRIVER') ?: 'smtp')); // smtp, mail, sendmail
define('SMTP_FALLBACK_DRIVER', strtolower(getenv('SMTP_FALLBACK_DRIVER') ?: 'mail'));
define('SMTP_ALLOW_FALLBACK', filter_var(getenv('SMTP_ALLOW_FALLBACK'), FILTER_VALIDATE_BOOLEAN, ['options' => ['default' => true]]));
define('SMTP_ENCRYPTION', strtolower(getenv('SMTP_ENCRYPTION') ?: 'tls')); // tls, ssl, none
define('SMTP_DEBUG_LEVEL', (int)(getenv('SMTP_DEBUG_LEVEL') ?: 0));

// Note: For Gmail, you need to:
// 1. Enable 2-factor authentication
// 2. Generate an "App Password" (not your regular password)
// 3. Use that app password in SMTP_PASSWORD above
?>
