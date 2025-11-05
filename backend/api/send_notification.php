<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';

try {
  $input = json_decode(file_get_contents('php://input'), true) ?? [];
  $recipientId = isset($input['recipient_id']) ? (int)$input['recipient_id'] : 0;
  $message = isset($input['message']) ? trim($input['message']) : '';

  // Debug logging
  error_log("Send notification debug - recipient_id: " . $recipientId . ", message: " . $message);
  error_log("Raw input: " . file_get_contents('php://input'));

  if ($recipientId <= 0 || empty($message)) {
    throw new Exception('Invalid recipient_id or message. recipient_id: ' . $recipientId . ', message: ' . $message);
  }

  $db = (new Database())->connect();

  // Ensure notification table exists
  $db->exec("CREATE TABLE IF NOT EXISTS notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_status ENUM('unread', 'read') DEFAULT 'unread',
    INDEX idx_recipient (recipient_id),
    INDEX idx_status (response_status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  // Insert notification
  $stmt = $db->prepare("INSERT INTO notification (recipient_id, message, created_at, response_status) VALUES (?, ?, NOW(), 'unread')");
  $stmt->execute([$recipientId, $message]);

  echo json_encode(['success' => true, 'notification_id' => $db->lastInsertId()]);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
