<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/database.php';

try {
  if (!isset($_GET['id'])) { throw new Exception('Missing id'); }
  $id = (int)$_GET['id'];
  $db = (new Database())->connect();

  // Get daily_route data
  $head = $db->prepare("SELECT * FROM daily_route WHERE id = ?");
  $head->execute([$id]);
  $route = $head->fetch(PDO::FETCH_ASSOC);
  
  if (!$route) {
    throw new Exception("Route with ID {$id} not found in daily_route table");
  }

  // Get stops from daily_route_stop
  $stops = $db->prepare("SELECT * FROM daily_route_stop WHERE daily_route_id = ? ORDER BY seq");
  $stops->execute([$id]);
  $route['stops'] = $stops->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([ 'success' => true, 'route' => $route ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 'success' => false, 'message' => $e->getMessage() ]);
}
?>