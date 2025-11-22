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
  $routeId = isset($input['route_id']) ? (int)$input['route_id'] : 0;
  $collectorId = isset($input['collector_id']) ? (int)$input['collector_id'] : null;
  $note = isset($input['note']) ? trim($input['note']) : '';
  if ($note === '') {
    $note = 'Collector reported that the truck is full.';
  }

  if ($routeId <= 0) {
    throw new Exception('Invalid route_id');
  }

  $db = (new Database())->connect();

  $routeStmt = $db->prepare('SELECT id, team_id, barangay_id, barangay_name, notes FROM daily_route WHERE id = ?');
  $routeStmt->execute([$routeId]);
  $route = $routeStmt->fetch(PDO::FETCH_ASSOC);
  if (!$route) {
    throw new Exception('Route not found');
  }

  $teamId = isset($route['team_id']) ? (int)$route['team_id'] : 0;
  if ($teamId <= 0) {
    throw new Exception('Route has no assigned team');
  }

  $teamStmt = $db->prepare('SELECT driver_id FROM collection_team WHERE team_id = ?');
  $teamStmt->execute([$teamId]);
  $team = $teamStmt->fetch(PDO::FETCH_ASSOC);
  $driverId = isset($team['driver_id']) ? (int)$team['driver_id'] : 0;
  if ($driverId <= 0) {
    throw new Exception('Assigned truck driver not found for this team');
  }

  $collectorName = null;
  if ($collectorId) {
    $collectorStmt = $db->prepare('SELECT username FROM user WHERE user_id = ?');
    $collectorStmt->execute([$collectorId]);
    $collectorName = $collectorStmt->fetchColumn() ?: null;
  }

  $db->exec("CREATE TABLE IF NOT EXISTS notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_status ENUM('unread', 'read') DEFAULT 'unread',
    INDEX idx_recipient (recipient_id),
    INDEX idx_status (response_status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $payload = [
    'type' => 'truck_full_request',
    'title' => 'Truck capacity reached',
    'message' => 'Collectors reported the truck is full. Please coordinate landfill trip.',
    'route_id' => $routeId,
    'team_id' => $teamId,
    'note' => $note,
    'collector_id' => $collectorId,
    'collector_name' => $collectorName,
    'barangay_id' => $route['barangay_id'] ?? null,
    'barangay_name' => $route['barangay_name'] ?? null,
    'timestamp' => date('c')
  ];

  $notifStmt = $db->prepare('INSERT INTO notification (recipient_id, message, created_at, response_status) VALUES (?, ?, NOW(), \'unread\')');
  $notifStmt->execute([$driverId, json_encode($payload)]);

  $db->exec("CREATE TABLE IF NOT EXISTS task_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    user_id VARCHAR(50) NULL,
    event_type VARCHAR(64) NOT NULL,
    before_json JSON NULL,
    after_json JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_assignment (assignment_id),
    INDEX idx_event_type (event_type)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $eventStmt = $db->prepare('INSERT INTO task_events(assignment_id,user_id,event_type,before_json,after_json) VALUES(?,?,?,?,?)');
  $eventStmt->execute([
    $teamId,
    $collectorId ? (string)$collectorId : null,
    'collector_reported_truck_full',
    null,
    json_encode([
      'route_id' => $routeId,
      'driver_id' => $driverId,
      'note' => $note,
      'collector_name' => $collectorName
    ])
  ]);

  // Set truck_full flag in route notes to trigger reroute to Mantila
  // This will cause the truck driver to reroute to Mantila without adding a stop
  $currentNotes = $route['notes'] ?? null;
  $notesData = [];
  if ($currentNotes) {
    $decoded = json_decode($currentNotes, true);
    if (is_array($decoded)) {
      $notesData = $decoded;
    }
  }
  $notesData['truck_full'] = true;
  $notesData['truck_full_timestamp'] = date('c');
  $notesData['truck_full_collector_id'] = $collectorId;
  
  $updateNotesStmt = $db->prepare('UPDATE daily_route SET notes = ? WHERE id = ?');
  $updateNotesStmt->execute([json_encode($notesData), $routeId]);

  echo json_encode(['success' => true, 'truck_full_flag_set' => true, 'message' => 'Truck full flag set. Route will reroute to Mantila.']);
} catch (Throwable $e) {
  http_response_code(400);
  echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
