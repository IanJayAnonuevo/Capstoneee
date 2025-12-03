<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once '../config/database.php';

try {
  $db = (new Database())->connect();
  
  // Build query with filters
  $query = "SELECT 
    rel.id,
    rel.route_id,
    rel.reported_by,
    rel.emergency_type,
    rel.impact,
    rel.notes,
    rel.attachment_path,
    rel.delay_minutes,
    rel.created_at,
    rel.resolved_at,
    rel.resolved_by,
    rel.resolution_notes,
    rel.foreman_action,
    rel.foreman_notes,
    dr.cluster_id,
    dr.barangay_name,
    dr.date as route_date,
    dr.team_id,
    reporter.firstname as reporter_firstname,
    reporter.lastname as reporter_lastname,
    reporter_user.username as reporter_username,
    resolver.firstname as resolver_firstname,
    resolver.lastname as resolver_lastname
  FROM route_emergency_log rel
  LEFT JOIN daily_route dr ON dr.id = rel.route_id
  LEFT JOIN user_profile reporter ON reporter.user_id = rel.reported_by
  LEFT JOIN user reporter_user ON reporter_user.user_id = rel.reported_by
  LEFT JOIN user_profile resolver ON resolver.user_id = rel.resolved_by
  WHERE 1=1";
  
  $params = [];
  
  // Filter by status (active/resolved)
  if (isset($_GET['status'])) {
    $status = strtolower(trim($_GET['status']));
    if ($status === 'active') {
      $query .= " AND rel.resolved_at IS NULL";
    } elseif ($status === 'resolved') {
      $query .= " AND rel.resolved_at IS NOT NULL";
    }
  }
  
  // Filter by impact
  if (isset($_GET['impact']) && $_GET['impact'] !== 'all') {
    $query .= " AND rel.impact = :impact";
    $params[':impact'] = $_GET['impact'];
  }
  
  // Filter by emergency type
  if (isset($_GET['type']) && $_GET['type'] !== 'all') {
    $query .= " AND rel.emergency_type = :type";
    $params[':type'] = $_GET['type'];
  }
  
  // Filter by date
  if (isset($_GET['date'])) {
    $query .= " AND DATE(rel.created_at) = :date";
    $params[':date'] = $_GET['date'];
  }
  
  // Search functionality
  if (isset($_GET['search']) && trim($_GET['search']) !== '') {
    $search = '%' . trim($_GET['search']) . '%';
    $query .= " AND (
      dr.barangay_name LIKE :search1 OR
      dr.cluster_id LIKE :search2 OR
      rel.emergency_type LIKE :search3 OR
      rel.notes LIKE :search4 OR
      CONCAT(reporter.firstname, ' ', reporter.lastname) LIKE :search5
    )";
    $params[':search1'] = $search;
    $params[':search2'] = $search;
    $params[':search3'] = $search;
    $params[':search4'] = $search;
    $params[':search5'] = $search;
  }
  
  $query .= " ORDER BY rel.created_at DESC";
  
  $stmt = $db->prepare($query);
  $stmt->execute($params);
  
  $emergencies = [];
  while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $reporterName = trim(($row['reporter_firstname'] ?? '') . ' ' . ($row['reporter_lastname'] ?? ''));
    if ($reporterName === '') {
      $reporterName = $row['reporter_username'] ?? 'Unknown Driver';
    }
    
    $resolverName = trim(($row['resolver_firstname'] ?? '') . ' ' . ($row['resolver_lastname'] ?? ''));
    
    $emergencies[] = [
      'id' => (int)$row['id'],
      'route_id' => (int)$row['route_id'],
      'route_name' => trim(($row['cluster_id'] ?? '') . ' ' . ($row['barangay_name'] ?? '')),
      'barangay_name' => $row['barangay_name'] ?? 'Unknown',
      'cluster_id' => $row['cluster_id'] ?? null,
      'route_date' => $row['route_date'] ?? null,
      'team_id' => $row['team_id'] ? (int)$row['team_id'] : null,
      'driver_id' => $row['reported_by'] ? (int)$row['reported_by'] : null,
      'driver_name' => $reporterName,
      'emergency_type' => $row['emergency_type'],
      'impact' => $row['impact'],
      'delay_minutes' => $row['delay_minutes'] ? (int)$row['delay_minutes'] : null,
      'notes' => $row['notes'] ?? '',
      'attachment_path' => $row['attachment_path'] ?? null,
      'reported_at' => $row['created_at'],
      'resolved_at' => $row['resolved_at'] ?? null,
      'resolved_by' => $row['resolved_by'] ? (int)$row['resolved_by'] : null,
      'resolved_by_name' => $resolverName !== '' ? $resolverName : null,
      'resolution_notes' => $row['resolution_notes'] ?? null,
      'foreman_action' => $row['foreman_action'] ?? null,
      'foreman_notes' => $row['foreman_notes'] ?? null,
      'status' => $row['resolved_at'] ? 'resolved' : 'active'
    ];
  }
  
  echo json_encode([
    'success' => true,
    'count' => count($emergencies),
    'emergencies' => $emergencies,
    'timestamp' => date('c')
  ]);
  
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
?>
