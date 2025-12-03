<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/database.php';

try {
  // Support both 'id' and 'route_id' parameters for backwards compatibility
  $id = null;
  if (isset($_GET['route_id'])) {
    $id = (int)$_GET['route_id'];
  } elseif (isset($_GET['id'])) {
    $id = (int)$_GET['id'];
  } else {
    throw new Exception('Missing route id');
  }
  
  $barangay_id = isset($_GET['barangay_id']) ? $_GET['barangay_id'] : null;
  
  $db = (new Database())->connect();

  // Get daily_route data
  $head = $db->prepare("SELECT * FROM daily_route WHERE id = ?");
  $head->execute([$id]);
  $route = $head->fetch(PDO::FETCH_ASSOC);
  
  if (!$route) {
    throw new Exception("Route with ID {$id} not found in daily_route table");
  }

  // Get stops from daily_route_stop
  // If barangay_id is provided, filter stops by barangay
  if ($barangay_id !== null) {
    $stops = $db->prepare("
      SELECT drs.* 
      FROM daily_route_stop drs
      JOIN collection_point cp ON drs.collection_point_id = cp.point_id
      WHERE drs.daily_route_id = ? AND cp.barangay_id = ?
      ORDER BY drs.seq
    ");
    $stops->execute([$id, $barangay_id]);
  } else {
    $stops = $db->prepare("SELECT * FROM daily_route_stop WHERE daily_route_id = ? ORDER BY seq");
    $stops->execute([$id]);
  }
  
  $route['stops'] = $stops->fetchAll(PDO::FETCH_ASSOC);

  // Extract emergency information from notes JSON if present
  $emergency = null;
  if (!empty($route['notes'])) {
    $notesData = json_decode($route['notes'], true);
    if (is_array($notesData) && isset($notesData['emergency'])) {
      $emergency = $notesData['emergency'];
    }
  }
  $route['emergency'] = $emergency;

  echo json_encode([ 'success' => true, 'route' => $route ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 'success' => false, 'message' => $e->getMessage() ]);
}
?>