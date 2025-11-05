<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

// Set local timezone (adjust if needed)
date_default_timezone_set('Asia/Manila');

// Very simple protection – use a secret key in the URL: ?key=YOUR_SECRET
$providedKey = isset($_GET['key']) ? (string)$_GET['key'] : '';
// You should change this value and keep it private (env var if available)
$expectedKey = getenv('KT_BROADCAST_SECRET') ?: 'CHANGE_THIS_SECRET_KEY';
if ($providedKey !== $expectedKey) {
  http_response_code(403);
  echo json_encode(['success' => false, 'message' => 'Forbidden']);
  exit;
}

// type: open | warning | closed
$type = isset($_GET['type']) ? strtolower(trim($_GET['type'])) : 'open';
$messages = [
  'open'    => '📢 System Notice: “Time-in window is open from 5:00 AM to 6:00 AM. Please complete your attendance before operations begin.”',
  'warning' => '⏰ You haven’t timed in yet! Please log in immediately to avoid being marked absent for today’s operation.',
  'closed'  => '⛔ Time-In Closed: The time-in period is now over. You can no longer record attendance for today.'
];
$message = $messages[$type] ?? $messages['open'];

try {
  $db = (new Database())->connect();

  // Ensure table exists
  $db->exec("CREATE TABLE IF NOT EXISTS notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_status ENUM('unread','read') DEFAULT 'unread',
    INDEX idx_recipient (recipient_id),
    INDEX idx_status (response_status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  // Collect all GarbageCollectors and TruckDrivers
  $sqlUsers = "SELECT u.user_id
               FROM user u
               JOIN role r ON u.role_id = r.role_id
               WHERE r.role_name IN ('GarbageCollector', 'TruckDriver')
                 AND (u.status = 'active' OR u.status IS NULL)";
  $userIds = $db->query($sqlUsers)->fetchAll(PDO::FETCH_COLUMN);

  if (!$userIds) {
    echo json_encode(['success' => true, 'inserted' => 0, 'type' => $type]);
    exit;
  }

  // Avoid duplicates for the same day and same message
  $checkStmt = $db->prepare("SELECT COUNT(*) FROM notification WHERE recipient_id = ? AND DATE(created_at) = CURDATE() AND message = ?");
  $insertStmt = $db->prepare("INSERT INTO notification (recipient_id, message, created_at, response_status) VALUES (?, ?, NOW(), 'unread')");

  $inserted = 0;
  foreach ($userIds as $uid) {
    $checkStmt->execute([$uid, $message]);
    $exists = (int)$checkStmt->fetchColumn() > 0;
    if ($exists) continue;
    $insertStmt->execute([$uid, $message]);
    $inserted++;
  }

  echo json_encode(['success' => true, 'inserted' => $inserted, 'type' => $type]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>


