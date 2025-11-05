<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

require_once __DIR__ . '/../config/database.php';

$userId = isset($_POST['user_id']) ? trim($_POST['user_id']) : null;

if (!$userId) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'User ID is required.'
    ]);
    exit();
}

if (!isset($_FILES['avatar']) || !is_uploaded_file($_FILES['avatar']['tmp_name'])) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Image file is required.'
    ]);
    exit();
}

$file = $_FILES['avatar'];

if ($file['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to upload image. Please try again.'
    ]);
    exit();
}

$maxSize = 2 * 1024 * 1024; // 2 MB
if ($file['size'] > $maxSize) {
    http_response_code(413);
    echo json_encode([
        'status' => 'error',
        'message' => 'Image is too large. Maximum size is 2 MB.'
    ]);
    exit();
}

$mimeType = null;
if (class_exists('finfo')) {
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);
} elseif (function_exists('mime_content_type')) {
    $mimeType = mime_content_type($file['tmp_name']);
}

if (!$mimeType) {
    http_response_code(415);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unable to determine the file type.'
    ]);
    exit();
}
$allowedTypes = [
    'image/jpeg' => '.jpg',
    'image/png' => '.png',
    'image/webp' => '.webp',
    'image/gif' => '.gif'
];

if (!isset($allowedTypes[$mimeType])) {
    http_response_code(415);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF.'
    ]);
    exit();
}

$database = new Database();
$db = $database->connect();

$columnUpdated = false;
$columnErrors = [];
$activeColumn = 'profile_image';
$timestampColumn = 'profile_image_updated_at';
$existingProfileImage = null;
$existingUpdatedAt = null;

if (!$db) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed while saving the image.'
    ]);
    exit();
}

$columnExists = false;
try {
    $columnCheck = $db->query("SHOW COLUMNS FROM user_profile LIKE 'profile_image'");
    if ($columnCheck && $columnCheck->rowCount() > 0) {
        $columnExists = true;
    }

    if (!$columnExists) {
        $db->exec("ALTER TABLE user_profile ADD COLUMN profile_image VARCHAR(255) NULL AFTER lastname");
        $columnCheck = $db->query("SHOW COLUMNS FROM user_profile LIKE 'profile_image'");
        $columnExists = $columnCheck && $columnCheck->rowCount() > 0;
    }

    if (!$columnExists) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unable to find or create the profile_image column on user_profile table.'
        ]);
        exit();
    }

    $timestampCheck = $db->query("SHOW COLUMNS FROM user_profile LIKE '{$timestampColumn}'");
    if (!$timestampCheck || $timestampCheck->rowCount() === 0) {
        $db->exec("ALTER TABLE user_profile ADD COLUMN {$timestampColumn} DATETIME NULL AFTER {$activeColumn}");
    }
} catch (PDOException $e) {
    $columnErrors[] = $e->getMessage();
}

try {
    $profileStmt = $db->prepare("SELECT {$activeColumn} AS profile_image, {$timestampColumn} AS updated_at FROM user_profile WHERE user_id = :user_id LIMIT 1");
    $profileStmt->bindParam(':user_id', $userId);
    $profileStmt->execute();
    $profileData = $profileStmt->fetch(PDO::FETCH_ASSOC);
    if ($profileData) {
        $existingProfileImage = $profileData['profile_image'] ?? null;
        $existingUpdatedAt = $profileData['updated_at'] ?? null;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    exit();
}

$cooldownRemaining = null;
$lastUpdatedTimestamp = null;
if ($existingUpdatedAt) {
    try {
        $timezone = new DateTimeZone('Asia/Manila');
        $lastUpdated = new DateTime($existingUpdatedAt, $timezone);
        $now = new DateTime('now', $timezone);
        $interval = $now->getTimestamp() - $lastUpdated->getTimestamp();
        if ($interval < 86400) {
            $cooldownRemaining = 86400 - $interval;
            $lastUpdatedTimestamp = $lastUpdated->getTimestamp();
        }
    } catch (Exception $e) {
        // Ignore parsing errors, treat as no cooldown
    }
}

if ($cooldownRemaining !== null) {
    $remainingHours = floor($cooldownRemaining / 3600);
    $remainingMinutes = ceil(($cooldownRemaining % 3600) / 60);
    $cooldownEndsAt = $lastUpdatedTimestamp ? $lastUpdatedTimestamp + 86400 : null;
    http_response_code(429);
    echo json_encode([
        'status' => 'error',
        'message' => 'You can only update your profile picture once every 24 hours.',
        'cooldownRemainingSeconds' => $cooldownRemaining,
        'cooldownRemainingMinutes' => max(1, $remainingMinutes + ($remainingHours * 60)),
        'cooldownEndsAt' => $cooldownEndsAt,
        'lastUpdatedAt' => $existingUpdatedAt
    ]);
    exit();
}

$uploadDir = __DIR__ . '/../../uploads/profile_images/';

if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to create upload directory.'
    ]);
    exit();
}

try {
    $randomSuffix = bin2hex(random_bytes(4));
} catch (Exception $e) {
    $randomSuffix = uniqid();
}

$sanitizedId = preg_replace('/[^A-Za-z0-9]/', '', $userId);
$fileName = sprintf('resident_%s_%s%s', $sanitizedId ?: 'user', $randomSuffix, $allowedTypes[$mimeType]);
$destinationPath = $uploadDir . $fileName;

if (!move_uploaded_file($file['tmp_name'], $destinationPath)) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Unable to save the uploaded file.'
    ]);
    exit();
}

$relativePath = 'uploads/profile_images/' . $fileName;
$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$imageUrl = $protocol . $host . '/' . $relativePath;

// Remove old file if it exists and is different
if ($existingProfileImage) {
    $trimmedExisting = ltrim($existingProfileImage, '/');
    $existingPath = __DIR__ . '/../../' . $trimmedExisting;
    if (strpos($trimmedExisting, 'uploads/profile_images/') === 0 && file_exists($existingPath)) {
        @unlink($existingPath);
    }
}

$timezone = new DateTimeZone('Asia/Manila');
$now = new DateTime('now', $timezone);
$nowFormatted = $now->format('Y-m-d H:i:s');

try {
    $query = "UPDATE user_profile SET {$activeColumn} = :path, {$timestampColumn} = :updated_at WHERE user_id = :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':path', $relativePath);
    $stmt->bindParam(':updated_at', $nowFormatted);
    $stmt->bindParam(':user_id', $userId);
    $stmt->execute();
    $columnUpdated = $stmt->rowCount() > 0;
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
    exit();
}

http_response_code(200);
echo json_encode([
    'status' => 'success',
    'message' => 'Profile image uploaded successfully.',
    'data' => [
        'imageUrl' => $imageUrl,
        'relativePath' => $relativePath,
        'columnUpdated' => $columnUpdated,
        'updatedColumn' => $activeColumn,
        'columnErrors' => $columnErrors,
        'updatedAt' => $nowFormatted
    ]
]);
exit();
?>
