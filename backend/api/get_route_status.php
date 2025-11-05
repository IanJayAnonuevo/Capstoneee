<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/database.php';

try {
  $teamId = isset($_GET['team_id']) ? (int)$_GET['team_id'] : 0;
  
  if ($teamId <= 0) {
    throw new Exception('Invalid team_id');
  }

  $db = (new Database())->connect();

  // Get route status from daily_route table
  $stmt = $db->prepare("
    SELECT 
      dr.id as route_id,
      dr.status as route_status,
      dr.updated_at,
      b.barangay_name
    FROM daily_route dr
    LEFT JOIN barangay b ON dr.barangay_id = b.barangay_id
    WHERE dr.team_id = ?
    ORDER BY dr.updated_at DESC
    LIMIT 1
  ");
  
  $stmt->execute([$teamId]);
  $route = $stmt->fetch(PDO::FETCH_ASSOC);

  if (!$route) {
    // Fallback to collection_schedule if no daily_route found
    $stmt = $db->prepare("
      SELECT 
        cs.schedule_id as route_id,
        cs.status as route_status,
        cs.updated_at,
        b.barangay_name
      FROM collection_schedule cs
      LEFT JOIN barangay b ON cs.barangay_id = b.barangay_id
      LEFT JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
      WHERE ct.team_id = ?
      ORDER BY cs.updated_at DESC
      LIMIT 1
    ");
    
    $stmt->execute([$teamId]);
    $route = $stmt->fetch(PDO::FETCH_ASSOC);
  }

  if ($route) {
    echo json_encode([
      'success' => true,
      'route_id' => $route['route_id'],
      'route_status' => $route['route_status'],
      'updated_at' => $route['updated_at'],
      'barangay_name' => $route['barangay_name']
    ]);
  } else {
    echo json_encode([
      'success' => true,
      'route_id' => null,
      'route_status' => 'not_found',
      'updated_at' => null,
      'barangay_name' => null
    ]);
  }

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => $e->getMessage()
  ]);
}
?>

