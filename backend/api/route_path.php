<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
  $route_id = isset($_GET['route_id']) ? intval($_GET['route_id']) : 0;
  $type = isset($_GET['type']) ? $_GET['type'] : 'both'; // 'planned', 'actual', or 'both'

  if ($route_id <= 0) {
    throw new Exception('Invalid route_id');
  }

  $db = (new Database())->connect();

  $response = ['success' => true];

  // Get planned path
  if ($type === 'planned' || $type === 'both') {
    $sql = "
      SELECT latitude, longitude, sequence_order
      FROM route_path_history
      WHERE route_id = :route_id 
        AND is_planned = TRUE
      ORDER BY sequence_order ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':route_id', $route_id, PDO::PARAM_INT);
    $stmt->execute();
    $planned = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['planned_path'] = array_map(function($p) {
      return [floatval($p['latitude']), floatval($p['longitude'])];
    }, $planned);
  }

  // Get actual path
  if ($type === 'actual' || $type === 'both') {
    $sql = "
      SELECT latitude, longitude, timestamp
      FROM route_path_history
      WHERE route_id = :route_id 
        AND is_planned = FALSE
      ORDER BY timestamp ASC
    ";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':route_id', $route_id, PDO::PARAM_INT);
    $stmt->execute();
    $actual = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['actual_path'] = array_map(function($p) {
      return [floatval($p['latitude']), floatval($p['longitude'])];
    }, $actual);
  }

  echo json_encode($response);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 
    'success' => false, 
    'message' => $e->getMessage() 
  ]);
}
?>
