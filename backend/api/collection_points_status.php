<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
  $db = (new Database())->connect();

  // Get all collection points with their current status
  $sql = "
    SELECT 
      point_id,
      barangay_id,
      location_name,
      latitude,
      longitude,
      status,
      is_mrf,
      last_collected,
      geofence_radius
    FROM collection_point
    ORDER BY barangay_id, location_name
  ";

  $stmt = $db->prepare($sql);
  $stmt->execute();
  $points = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([ 
    'success' => true, 
    'points' => $points,
    'count' => count($points)
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 
    'success' => false, 
    'message' => $e->getMessage() 
  ]);
}
?>
