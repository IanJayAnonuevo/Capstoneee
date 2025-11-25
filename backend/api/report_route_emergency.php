<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';

function kolektrash_format_display_name(?string $first, ?string $last, ?string $username): ?string {
  $first = trim((string)$first);
  $last = trim((string)$last);
  $username = trim((string)$username);
  $full = trim(($first . ' ' . $last));
  if ($full !== '') {
    return $full;
  }
  return $username !== '' ? $username : null;
}

function kolektrash_safe_json_decode(?string $raw): array {
  if (!$raw) {
    return [];
  }
  $decoded = json_decode($raw, true);
  return is_array($decoded) ? $decoded : [];
}

try {
  $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
  $isMultipart = stripos($contentType, 'multipart/form-data') !== false;
  $rawInput = file_get_contents('php://input');
  $input = $isMultipart ? $_POST : (json_decode($rawInput ?: '[]', true) ?? []);

  $routeId = isset($input['route_id']) ? (int)$input['route_id'] : 0;
  if ($routeId <= 0) {
    throw new Exception('Invalid route_id');
  }

  $currentUser = kolektrash_current_user();
  $reportedBy = isset($input['reported_by']) ? (int)$input['reported_by'] : ($currentUser['user_id'] ?? null);

  $reasonKey = strtolower(trim($input['type'] ?? $input['reason'] ?? 'other'));
  if ($reasonKey === '') { $reasonKey = 'other'; }
  $reasonMap = [
    'breakdown' => 'Breakdown',
    'flat_tire' => 'Flat Tire',
    'flat tire' => 'Flat Tire',
    'accident' => 'Accident',
    'medical' => 'Medical Emergency',
    'weather' => 'Severe Weather',
    'other' => 'Other Issue'
  ];
  $reasonLabel = $reasonMap[$reasonKey] ?? ucfirst($reasonKey);

  $impact = strtolower(trim($input['impact'] ?? 'delay'));
  if (!in_array($impact, ['delay', 'cancel'], true)) {
    $impact = 'delay';
  }

  $notes = trim($input['notes'] ?? $input['description'] ?? '');
  $delayMinutes = isset($input['delay_minutes']) ? max(0, (int)$input['delay_minutes']) : null;

  $db = (new Database())->connect();

  // Ensure supporting tables exist outside of the transaction to avoid implicit commits.
  $db->exec("CREATE TABLE IF NOT EXISTS route_emergency_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id BIGINT UNSIGNED NOT NULL,
    reported_by INT NULL,
    emergency_type VARCHAR(50) NOT NULL,
    impact ENUM('delay','cancel') NOT NULL DEFAULT 'delay',
    notes TEXT NULL,
    attachment_path VARCHAR(255) NULL,
    delay_minutes INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    resolved_by INT NULL,
    INDEX idx_route(route_id),
    INDEX idx_impact(impact)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

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

  $db->exec("CREATE TABLE IF NOT EXISTS notification (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    recipient_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_status ENUM('unread','read') DEFAULT 'unread',
    INDEX idx_recipient (recipient_id),
    INDEX idx_status (response_status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

  $db->beginTransaction();

  $routeStmt = $db->prepare('SELECT id, date, cluster_id, team_id, barangay_id, barangay_name, status, notes FROM daily_route WHERE id = ? FOR UPDATE');
  $routeStmt->execute([$routeId]);
  $route = $routeStmt->fetch(PDO::FETCH_ASSOC);
  if (!$route) {
    throw new Exception('Route not found');
  }

  $teamId = $route['team_id'] ? (int)$route['team_id'] : null;
  $barangayId = $route['barangay_id'] ?: null;
  $barangayName = $route['barangay_name'] ?: null;
  $routeDate = $route['date'] ?? null;
  $clusterId = $route['cluster_id'] ?? null;

  $targetBarangays = [];
  $appendBarangay = static function($value) use (&$targetBarangays) {
    if ($value === null) { return; }
    $normalized = trim((string)$value);
    if ($normalized === '') { return; }
    if (!in_array($normalized, $targetBarangays, true)) {
      $targetBarangays[] = $normalized;
    }
  };
  $appendBarangay($barangayId);

  // Collect barangays from the actual stops (via collection points)
  $stopBarangayStmt = $db->prepare("
    SELECT DISTINCT cp.barangay_id
    FROM daily_route_stop drs
    LEFT JOIN collection_point cp ON cp.point_id = drs.collection_point_id
    WHERE drs.daily_route_id = ? AND cp.barangay_id IS NOT NULL
  ");
  $stopBarangayStmt->execute([$routeId]);
  foreach ($stopBarangayStmt->fetchAll(PDO::FETCH_COLUMN) as $stopBarangay) {
    $appendBarangay($stopBarangay);
  }

  // Include every barangay scheduled for the same team on the same date
  if ($teamId && $routeDate) {
    $teamBarangayStmt = $db->prepare("
      SELECT DISTINCT barangay_id
      FROM daily_route
      WHERE date = ? AND team_id = ? AND barangay_id IS NOT NULL
    ");
    $teamBarangayStmt->execute([$routeDate, $teamId]);
    foreach ($teamBarangayStmt->fetchAll(PDO::FETCH_COLUMN) as $teamBarangay) {
      $appendBarangay($teamBarangay);
    }
  }

  // Include every barangay in the same cluster that has a scheduled collection on the route date
  if ($routeDate && $clusterId) {
    $scheduleBarangayStmt = $db->prepare("
      SELECT DISTINCT cs.barangay_id
      FROM collection_schedule cs
      LEFT JOIN barangay b ON b.barangay_id = cs.barangay_id
      WHERE cs.scheduled_date = ? AND b.cluster_id = ?
    ");
    $scheduleBarangayStmt->execute([$routeDate, $clusterId]);
    foreach ($scheduleBarangayStmt->fetchAll(PDO::FETCH_COLUMN) as $scheduledBarangay) {
      $appendBarangay($scheduledBarangay);
    }
  }

  // Fallback: include the entire cluster when no barangay could be determined
  if (empty($targetBarangays) && $clusterId) {
    $clusterBarangayStmt = $db->prepare("SELECT barangay_id FROM barangay WHERE cluster_id = ?");
    $clusterBarangayStmt->execute([$clusterId]);
    foreach ($clusterBarangayStmt->fetchAll(PDO::FETCH_COLUMN) as $clusterBarangay) {
      $appendBarangay($clusterBarangay);
    }
  }

  $reporterName = null;
  if ($reportedBy) {
    $nameStmt = $db->prepare('SELECT u.username, up.firstname, up.lastname FROM user u LEFT JOIN user_profile up ON up.user_id = u.user_id WHERE u.user_id = ?');
    $nameStmt->execute([$reportedBy]);
    $nameRow = $nameStmt->fetch(PDO::FETCH_ASSOC);
    if ($nameRow) {
      $reporterName = kolektrash_format_display_name($nameRow['firstname'] ?? null, $nameRow['lastname'] ?? null, $nameRow['username'] ?? null);
    }
  }

  $attachmentPath = null;
  if ($isMultipart && isset($_FILES['evidence']) && is_array($_FILES['evidence']) && $_FILES['evidence']['error'] !== UPLOAD_ERR_NO_FILE) {
    $file = $_FILES['evidence'];
    if ($file['error'] !== UPLOAD_ERR_OK) {
      throw new Exception('File upload failed (code ' . $file['error'] . ')');
    }
    $allowedExtensions = ['jpg','jpeg','png','gif','webp','mp4','mov','m4v','avi','mkv','heic','heif'];
    $ext = strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION));
    if (!in_array($ext, $allowedExtensions, true)) {
      throw new Exception('Unsupported file type for emergency evidence');
    }
    if ($file['size'] > 25 * 1024 * 1024) {
      throw new Exception('File exceeds 25MB limit');
    }
    $projectRoot = dirname(__DIR__, 2);
    $uploadDir = $projectRoot . '/uploads/emergencies';
    if (!is_dir($uploadDir) && !mkdir($uploadDir, 0775, true) && !is_dir($uploadDir)) {
      throw new Exception('Failed to create emergency upload directory');
    }
    $filename = 'route-' . $routeId . '-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $ext;
    $targetPath = $uploadDir . '/' . $filename;
    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
      throw new Exception('Unable to save uploaded file');
    }
    $attachmentPath = 'uploads/emergencies/' . $filename;
  }

  $logStmt = $db->prepare('INSERT INTO route_emergency_log (route_id, reported_by, emergency_type, impact, notes, attachment_path, delay_minutes) VALUES (?,?,?,?,?,?,?)');
  $logStmt->execute([$routeId, $reportedBy, $reasonLabel, $impact, $notes !== '' ? $notes : null, $attachmentPath, $delayMinutes]);
  $logId = (int)$db->lastInsertId();

  $notesData = kolektrash_safe_json_decode($route['notes'] ?? null);
  $nowIso = date('c');
  $emergencyPayload = [
    'active' => true,
    'impact' => $impact,
    'type' => $reasonKey,
    'type_label' => $reasonLabel,
    'notes' => $notes,
    'delay_minutes' => $delayMinutes,
    'reported_by' => $reportedBy,
    'reported_name' => $reporterName,
    'reported_at' => $nowIso,
    'attachment' => $attachmentPath,
    'log_id' => $logId
  ];
  $notesData['emergency'] = $emergencyPayload;

  $notesStmt = $db->prepare('UPDATE daily_route SET notes = ?, updated_at = NOW() WHERE id = ?');
  $notesStmt->execute([json_encode($notesData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $routeId]);

  if ($impact === 'cancel' && $route['status'] !== 'cancelled') {
    $statusStmt = $db->prepare("UPDATE daily_route SET status = 'cancelled', updated_at = NOW() WHERE id = ?");
    $statusStmt->execute([$routeId]);
  }

  if ($teamId) {
    $eventStmt = $db->prepare('INSERT INTO task_events(assignment_id,user_id,event_type,before_json,after_json) VALUES(?,?,?,?,?)');
    $eventStmt->execute([
      $teamId,
      $reportedBy ? (string)$reportedBy : null,
      'route_emergency_reported',
      json_encode(['status' => $route['status']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
      json_encode([
        'route_id' => $routeId,
        'impact' => $impact,
        'reason' => $reasonLabel,
        'notes' => $notes,
        'attachment' => $attachmentPath
      ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ]);
  }

  $recipientIds = [];
  if (!empty($targetBarangays)) {
    $residentStmt = $db->prepare("
      SELECT u.user_id
      FROM user u
      LEFT JOIN user_profile up ON up.user_id = u.user_id
      LEFT JOIN role r ON r.role_id = u.role_id
      WHERE TRIM(LOWER(up.barangay_id)) = TRIM(LOWER(:bid))
        AND (r.role_name = 'resident' OR r.role_name IS NULL)
    ");

    $barangayHeadStmt = $db->prepare("
      SELECT u.user_id
      FROM user u
      LEFT JOIN user_profile up ON up.user_id = u.user_id
      LEFT JOIN role r ON r.role_id = u.role_id
      WHERE TRIM(LOWER(up.barangay_id)) = TRIM(LOWER(:bid))
        AND r.role_name = 'barangay_head'
    ");

    foreach ($targetBarangays as $targetBarangayId) {
      $residentStmt->execute([':bid' => $targetBarangayId]);
      $recipientIds = array_merge($recipientIds, $residentStmt->fetchAll(PDO::FETCH_COLUMN));

      $barangayHeadStmt->execute([':bid' => $targetBarangayId]);
      $recipientIds = array_merge($recipientIds, $barangayHeadStmt->fetchAll(PDO::FETCH_COLUMN));
    }
  }

  $foremanSql = "SELECT u.user_id
                 FROM user u
                 LEFT JOIN role r ON r.role_id = u.role_id
                 WHERE r.role_name = 'foreman'";
  $foremanStmt = $db->query($foremanSql);
  if ($foremanStmt) {
    $recipientIds = array_merge($recipientIds, $foremanStmt->fetchAll(PDO::FETCH_COLUMN));
  }

  $recipientIds = array_values(array_unique(array_filter(array_map('intval', $recipientIds))));

  $title = $impact === 'cancel' ? 'Collection cancelled' : 'Collection delayed';
  $messageBody = ($barangayName ? "{$barangayName} route: " : '') .
    ($reasonLabel ? "{$reasonLabel} reported" : 'Emergency reported') .
    ($impact === 'cancel' ? '. Collection is cancelled until further notice.' : '. Expect delays while the team resolves the issue.');
  if ($notes !== '') {
    $messageBody .= ' Details: ' . $notes;
  }

  $payloadBase = [
    'type' => 'route_emergency',
    'title' => $title,
    'message' => $messageBody,
    'route_id' => $routeId,
    'route_date' => $routeDate,
    'barangay_id' => $barangayId,
    'barangay_name' => $barangayName,
    'impact' => $impact,
    'reason' => $reasonLabel,
    'notes' => $notes,
    'delay_minutes' => $delayMinutes,
    'reported_at' => $nowIso,
    'reported_by' => $reportedBy,
    'reported_name' => $reporterName,
    'attachment' => $attachmentPath,
    'log_id' => $logId,
    'affected_barangays' => $targetBarangays
  ];

  $notifCount = 0;
  if (!empty($recipientIds)) {
    $notifStmt = $db->prepare("INSERT INTO notification (recipient_id, message, created_at, response_status) VALUES (?, ?, NOW(), 'unread')");
    foreach ($recipientIds as $rid) {
      $notifStmt->execute([$rid, json_encode($payloadBase, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
      $notifCount++;
    }
  }

  $db->commit();

  echo json_encode([
    'success' => true,
    'emergency' => $emergencyPayload,
    'notified' => $notifCount
  ]);
} catch (Throwable $e) {
  if (isset($db) && $db->inTransaction()) {
    $db->rollBack();
  }
  http_response_code(400);
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
?>

