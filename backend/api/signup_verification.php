<?php
// Set timezone to Philippines
if (!ini_get('date.timezone')) {
    date_default_timezone_set('Asia/Manila');
}

// Configuration
const SIGNUP_CODE_TTL_MINUTES = 30; // Duration before signup verification codes expire

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../lib/EmailHelper.php';

try {
    $database = new Database();
    $pdo = $database->connect();
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

if (!$pdo) {
    echo json_encode(['status' => 'error', 'message' => 'Unable to connect to database']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    $input = $_POST;
}

$action = $input['action'] ?? '';

try {
    ensureEmailVerificationTable($pdo);

    switch ($action) {
        case 'send_verification_code':
            handleSendVerificationCode($pdo, $input);
            break;
        case 'verify_code':
            handleVerifyCode($pdo, $input);
            break;
        default:
            echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    error_log('Signup verification error: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

function ensureEmailVerificationTable($pdo)
{
    $sql = "CREATE TABLE IF NOT EXISTS email_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        verification_code VARCHAR(6) NOT NULL,
        expiry_time DATETIME NOT NULL,
        verified TINYINT(1) DEFAULT 0,
        used TINYINT(1) DEFAULT 0,
        resend_count INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        verified_at DATETIME NULL,
        used_at DATETIME NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql);
}

function handleSendVerificationCode($pdo, $input)
{
    $email = strtolower(trim($input['email'] ?? ''));
    $name = trim(($input['firstname'] ?? '') . ' ' . ($input['lastname'] ?? ''));

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'A valid email is required.']);
        return;
    }

    // Prevent sending code for already registered accounts
    $stmt = $pdo->prepare('SELECT 1 FROM user WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'This email is already registered. Please log in instead.']);
        return;
    }

    $stmt = $pdo->prepare('SELECT last_sent_at FROM email_verifications WHERE email = ?');
    $stmt->execute([$email]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existing && strtotime($existing['last_sent_at']) > strtotime('-60 seconds')) {
        $secondsLeft = 60 - (time() - strtotime($existing['last_sent_at']));
        echo json_encode([
            'status' => 'error',
            'message' => 'Please wait before requesting a new code.',
            'retry_after' => max(5, $secondsLeft)
        ]);
        return;
    }

    $verificationCode = sprintf('%06d', random_int(0, 999999));
    $expiryTime = date('Y-m-d H:i:s', strtotime('+' . SIGNUP_CODE_TTL_MINUTES . ' minutes'));

    $stmt = $pdo->prepare('INSERT INTO email_verifications (email, verification_code, expiry_time, verified, used, resend_count, created_at, last_sent_at)
        VALUES (?, ?, ?, 0, 0, 0, NOW(), NOW())
        ON DUPLICATE KEY UPDATE verification_code = VALUES(verification_code), expiry_time = VALUES(expiry_time), verified = 0, used = 0, resend_count = resend_count + 1, last_sent_at = NOW(), verified_at = NULL, used_at = NULL');
    $stmt->execute([$email, $verificationCode, $expiryTime]);

    $emailError = null;
    $deliveryStatus = 'sent';
    $transportUsed = null;

    try {
        $mailer = new EmailHelper();
        $sendResult = $mailer->sendSignupVerificationCode($email, $name, $verificationCode, $expiryTime);
        $transportUsed = $sendResult['transport'] ?? null;
    } catch (Exception $e) {
        error_log('Failed to send signup verification email: ' . $e->getMessage());
        $emailError = $e->getMessage();
        $deliveryStatus = 'failed';
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Verification code sent successfully.',
        'expiry_time' => $expiryTime,
        'delivery' => $deliveryStatus,
        'transport' => $transportUsed,
        'email_error' => $emailError,
        'verification_code' => $emailError ? $verificationCode : null
    ]);
}

function handleVerifyCode($pdo, $input)
{
    $email = strtolower(trim($input['email'] ?? ''));
    $code = trim($input['verification_code'] ?? '');

    if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['status' => 'error', 'message' => 'A valid email is required.']);
        return;
    }

    if (!preg_match('/^[0-9]{6}$/', $code)) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid verification code format.']);
        return;
    }

    // Block verification if email already registered
    $stmt = $pdo->prepare('SELECT 1 FROM user WHERE email = ? LIMIT 1');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'This email is already registered. Please log in instead.']);
        return;
    }

    $stmt = $pdo->prepare('SELECT * FROM email_verifications WHERE email = ? AND verification_code = ? AND expiry_time > NOW() AND COALESCE(used,0) = 0');
    $stmt->execute([$email, $code]);
    $record = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$record) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid or expired verification code.']);
        return;
    }

    $stmt = $pdo->prepare('UPDATE email_verifications SET verified = 1, verified_at = NOW() WHERE id = ?');
    $stmt->execute([$record['id']]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Email verified successfully.'
    ]);
}
