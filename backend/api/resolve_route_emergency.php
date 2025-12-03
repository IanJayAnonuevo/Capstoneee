<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';

try {
  $rawInput = file_get_contents('php://input');
  $input = json_decode($rawInput ?: '{}', true) ?? [];
  
  $logId = isset($input['log_id']) ? (int)$input['log_id'] : 0;
  if ($logId <= 0) {
    throw new Exception('Invalid log_id');
  }
  
  $currentUser = kolektrash_current_user();
  $resolvedBy = isset($input['resolved_by']) ? (int)$input['resolved_by'] : ($currentUser['user_id'] ?? null);
  
  if (!$resolvedBy) {
    throw new Exception('Resolver user ID is required');
  }
  
  $resolutionNotes = trim($input['resolution_notes'] ?? '');
  $foremanAction = trim($input['foreman_action'] ?? 'resolved');
  $foremanNotes = trim($input['foreman_notes'] ?? '');
  
  // Validate foreman action
  $validActions = ['acknowledged', 'resolved', 'escalated'];
  if (!in_array($foremanAction, $validActions, true)) {
    $foremanAction = 'resolved';
  }
  
  $db = (new Database())->connect();
  $db->beginTransaction();
  
  // Get emergency details
  $emergencyStmt = $db->prepare('
    SELECT rel.*, dr.barangay_name, dr.cluster_id, dr.team_id, dr.notes as route_notes
    FROM route_emergency_log rel
    LEFT JOIN daily_route dr ON dr.id = rel.route_id
    WHERE rel.id = ?
    FOR UPDATE
  ');
  $emergencyStmt->execute([$logId]);
  $emergency = $emergencyStmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$emergency) {
    throw new Exception('Emergency not found');
  }
  
  // Update emergency log
  $updateStmt = $db->prepare('
    UPDATE route_emergency_log 
    SET resolved_at = NOW(),
        resolved_by = ?,
        resolution_notes = ?,
        foreman_action = ?,
        foreman_notes = ?
    WHERE id = ?
  ');
  $updateStmt->execute([
    $resolvedBy,
    $resolutionNotes !== '' ? $resolutionNotes : null,
    $foremanAction,
    $foremanNotes !== '' ? $foremanNotes : null,
    $logId
  ]);
  
  // Update route notes to mark emergency as inactive
  $routeNotes = [];
  if ($emergency['route_notes']) {
    try {
      $routeNotes = json_decode($emergency['route_notes'], true) ?? [];
    } catch (Exception $e) {
      // Ignore JSON parse errors
    }
  }
  
  if (isset($routeNotes['emergency'])) {
    $routeNotes['emergency']['active'] = false;
    $routeNotes['emergency']['resolved_at'] = date('c');
    $routeNotes['emergency']['resolved_by'] = $resolvedBy;
    $routeNotes['emergency']['resolution_notes'] = $resolutionNotes;
    $routeNotes['emergency']['foreman_action'] = $foremanAction;
    
    $routeUpdateStmt = $db->prepare('UPDATE daily_route SET notes = ?, updated_at = NOW() WHERE id = ?');
    $routeUpdateStmt->execute([
      json_encode($routeNotes, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
      $emergency['route_id']
    ]);
  }
  
  // Log task event
  if ($emergency['team_id']) {
    $eventStmt = $db->prepare('
      INSERT INTO task_events(assignment_id, user_id, event_type, before_json, after_json) 
      VALUES(?,?,?,?,?)
    ');
    $eventStmt->execute([
      $emergency['team_id'],
      (string)$resolvedBy,
      'route_emergency_resolved',
      json_encode(['status' => 'active'], JSON_UNESCAPED_UNICODE),
      json_encode([
        'log_id' => $logId,
        'action' => $foremanAction,
        'resolution_notes' => $resolutionNotes
      ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    ]);
  }
  
  // Get foreman name for notification
  $foremanName = null;
  if ($resolvedBy) {
    $foremanNameStmt = $db->prepare('SELECT u.username, up.firstname, up.lastname FROM user u LEFT JOIN user_profile up ON up.user_id = u.user_id WHERE u.user_id = ?');
    $foremanNameStmt->execute([$resolvedBy]);
    $foremanNameRow = $foremanNameStmt->fetch(PDO::FETCH_ASSOC);
    if ($foremanNameRow) {
      $foremanName = trim(($foremanNameRow['firstname'] ?? '') . ' ' . ($foremanNameRow['lastname'] ?? ''));
      if ($foremanName === '') {
        $foremanName = $foremanNameRow['username'] ?? 'Foreman';
      }
    }
  }
  
  // Collect all affected barangays (same logic as report_route_emergency.php)
  $targetBarangays = [];
  $appendBarangay = static function($value) use (&$targetBarangays) {
    if ($value === null) { return; }
    $normalized = trim((string)$value);
    if ($normalized === '') { return; }
    if (!in_array($normalized, $targetBarangays, true)) {
      $targetBarangays[] = $normalized;
    }
  };
  
  // Add barangay from route
  if (!empty($emergency['barangay_name'])) {
    $appendBarangay($emergency['barangay_name']);
  }
  
  // Collect barangays from stops
  $stopBarangayStmt = $db->prepare("
    SELECT DISTINCT cp.barangay_id
    FROM daily_route_stop drs
    LEFT JOIN collection_point cp ON cp.point_id = drs.collection_point_id
    WHERE drs.daily_route_id = ? AND cp.barangay_id IS NOT NULL
  ");
  $stopBarangayStmt->execute([$emergency['route_id']]);
  foreach ($stopBarangayStmt->fetchAll(PDO::FETCH_COLUMN) as $stopBarangay) {
    $appendBarangay($stopBarangay);
  }
  
  // Collect all recipients
  $recipientIds = [];
  
  // 1. Send notification to driver who reported
  if ($emergency['reported_by']) {
    $recipientIds[] = $emergency['reported_by'];
  }
  
  // 2. Send notifications to residents and barangay heads in affected barangays
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
  
  // 3. Send notifications to all foremen
  $foremanSql = "SELECT u.user_id
                 FROM user u
                 LEFT JOIN role r ON r.role_id = u.role_id
                 WHERE r.role_name = 'foreman'";
  $foremanStmt = $db->query($foremanSql);
  if ($foremanStmt) {
    $recipientIds = array_merge($recipientIds, $foremanStmt->fetchAll(PDO::FETCH_COLUMN));
  }
  
  // Remove duplicates
  $recipientIds = array_values(array_unique(array_filter(array_map('intval', $recipientIds))));
  
  // Prepare notification messages
  $actionText = $foremanAction === 'acknowledged' ? 'acknowledged' : ($foremanAction === 'escalated' ? 'escalated' : 'resolved');
  $actionPastTense = $foremanAction === 'acknowledged' ? 'acknowledged' : ($foremanAction === 'escalated' ? 'escalated' : 'resolved');
  
  // Send notifications to all recipients
  $notifCount = 0;
  if (!empty($recipientIds)) {
    $notifStmt = $db->prepare("
      INSERT INTO notification (recipient_id, message, created_at, response_status) 
      VALUES (?, ?, NOW(), 'unread')
    ");
    
    foreach ($recipientIds as $rid) {
      // Customize message based on recipient
      $isDriver = ($rid == $emergency['reported_by']);
      $isForeman = false;
      
      // Check if recipient is a foreman
      $roleCheckStmt = $db->prepare("
        SELECT r.role_name 
        FROM user u 
        LEFT JOIN role r ON r.role_id = u.role_id 
        WHERE u.user_id = ?
      ");
      $roleCheckStmt->execute([$rid]);
      $roleRow = $roleCheckStmt->fetch(PDO::FETCH_ASSOC);
      if ($roleRow && $roleRow['role_name'] === 'foreman') {
        $isForeman = true;
      }
      
      // Build message based on recipient type
      if ($isDriver) {
        $title = 'Emergency ' . ucfirst($actionText);
        $messageText = "Your emergency report for {$emergency['barangay_name']} route has been {$actionPastTense}" . 
                       ($foremanName ? " by {$foremanName}" : '') . '.' .
                       ($resolutionNotes ? " Notes: {$resolutionNotes}" : '');
      } elseif ($isForeman) {
        $title = 'Emergency ' . ucfirst($actionText);
        $messageText = "Emergency in {$emergency['barangay_name']} has been {$actionPastTense}" . 
                       ($foremanName ? " by {$foremanName}" : '') . '.' .
                       ($resolutionNotes ? " Details: {$resolutionNotes}" : '');
      } else {
        // Residents and barangay heads
        if ($foremanAction === 'resolved') {
          $title = 'Collection Resumed';
          $messageText = "Good news! The emergency in {$emergency['barangay_name']} has been resolved. " .
                         "Garbage collection will resume as scheduled." .
                         ($resolutionNotes ? " Update: {$resolutionNotes}" : '');
        } elseif ($foremanAction === 'acknowledged') {
          $title = 'Emergency Update';
          $messageText = "The emergency in {$emergency['barangay_name']} has been acknowledged by our team. " .
                         "We are monitoring the situation." .
                         ($resolutionNotes ? " Details: {$resolutionNotes}" : '');
        } else { // escalated
          $title = 'Emergency Escalated';
          $messageText = "The emergency in {$emergency['barangay_name']} has been escalated for higher-level intervention. " .
                         "We will keep you updated." .
                         ($resolutionNotes ? " Details: {$resolutionNotes}" : '');
        }
      }
      
      $message = json_encode([
        'type' => 'emergency_resolved',
        'title' => $title,
        'message' => $messageText,
        'route_id' => $emergency['route_id'],
        'barangay_name' => $emergency['barangay_name'],
        'log_id' => $logId,
        'action' => $foremanAction,
        'resolved_by' => $foremanName
      ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
      
      $notifStmt->execute([$rid, $message]);
      $notifCount++;
    }
  }
  
  $db->commit();
  
  echo json_encode([
    'success' => true,
    'message' => 'Emergency ' . $foremanAction . ' successfully',
    'log_id' => $logId,
    'notified' => $notifCount,
    'timestamp' => date('c')
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
