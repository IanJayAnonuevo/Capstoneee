<?php
require_once __DIR__ . '/_bootstrap.php';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header("Content-Type: application/json");
require_once("../config/database.php");

// Get POST data as JSON
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required = ['username', 'email', 'password', 'firstname', 'lastname', 'contact_num', 'address', 'barangay_id', 'verification_code'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        echo json_encode(["success" => false, "message" => "Missing field: $field"]);
        exit;
    }
}

$username = $data['username'];
$email = $data['email'];
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$firstname = $data['firstname'];
$lastname = $data['lastname'];
$contact_num = $data['contact_num'];
$address = $data['address'];
$barangay_id = $data['barangay_id'];
$verificationCode = $data['verification_code'];

// Normalize email
$email = strtolower(trim($email));

$conn = (new Database())->connect();

try {
    $conn->exec("CREATE TABLE IF NOT EXISTS email_verifications (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Check if username already exists
    $stmt = $conn->prepare("SELECT 1 FROM user WHERE username = ? LIMIT 1");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Username is already taken. Please choose another one."]);
        exit;
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT 1 FROM user WHERE email = ? LIMIT 1");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "message" => "Email is already registered. Try logging in or reset your password."]);
        exit;
    }

    // Verify email verification code
    $stmt = $conn->prepare("SELECT * FROM email_verifications WHERE email = ? AND verification_code = ? AND expiry_time > NOW() AND verified = 1 AND used = 0");
    $stmt->execute([$email, $verificationCode]);
    $verification = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$verification) {
        echo json_encode(["success" => false, "message" => "Email verification failed. Please confirm the code we sent to your email."]);
        exit;
    }

    $conn->beginTransaction();

    // 1. Get role_id for resident
    $roleStmt = $conn->prepare("SELECT role_id FROM role WHERE role_name = 'resident' LIMIT 1");
    $roleStmt->execute();
    $roleRow = $roleStmt->fetch(PDO::FETCH_ASSOC);
    if (!$roleRow) {
        throw new Exception('Resident role not found');
    }
    $role_id = $roleRow['role_id'];

    // 2. Insert into user
    $stmt = $conn->prepare("INSERT INTO user (username, email, password, role_id) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $email, $password, $role_id]);
    $user_id = $conn->lastInsertId();

    // 3. Insert into user_profile
    $stmt = $conn->prepare("INSERT INTO user_profile (user_id, firstname, lastname, contact_num, address, barangay_id) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$user_id, $firstname, $lastname, $contact_num, $address, $barangay_id]);

    // 4. Optionally, insert into resident table if it exists (skip if not needed)
    // $stmt = $conn->prepare("INSERT INTO resident (user_id, barangay_id) VALUES (?, ?)");
    // $stmt->execute([$user_id, $barangay_id]);

    $conn->prepare("UPDATE email_verifications SET used = 1, used_at = NOW() WHERE id = ?")
        ->execute([$verification['id']]);

    $conn->commit();
    echo json_encode(["success" => true, "message" => "Resident registered successfully"]);
} catch (Exception $e) {
    $conn->rollBack();
    echo json_encode(["success" => false, "message" => "Registration failed: " . $e->getMessage()]);
}
?>
