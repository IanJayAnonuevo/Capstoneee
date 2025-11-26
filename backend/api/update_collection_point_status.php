<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * @return float Distance in meters
 */
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
  $earthRadius = 6371000; // meters
  $dLat = deg2rad($lat2 - $lat1);
  $dLon = deg2rad($lon2 - $lon1);
  
  $a = sin($dLat/2) * sin($dLat/2) +
       cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
       sin($dLon/2) * sin($dLon/2);
  $c = 2 * atan2(sqrt($a), sqrt(1-$a));
  
  return $earthRadius * $c;
}

try {
  $truck_id = isset($_GET['truck_id']) ? intval($_GET['truck_id']) : 0;
  $lat = isset($_GET['lat']) ? floatval($_GET['lat']) : 0;
  $lng = isset($_GET['lng']) ? floatval($_GET['lng']) : 0;

  if ($truck_id <= 0 || $lat == 0 || $lng == 0) {
    throw new Exception('Invalid parameters: truck_id, lat, lng required');
  }

  $db = (new Database())->connect();

  // Get all pending collection points
  $sql = "
    SELECT point_id, latitude, longitude, geofence_radius, location_name
    FROM collection_point
    WHERE status = 'pending'
  ";
  $stmt = $db->prepare($sql);
  $stmt->execute();
  $points = $stmt->fetchAll(PDO::FETCH_ASSOC);

  $updated = [];
  $now = date('Y-m-d H:i:s');

  // Check each point for geofence trigger
  foreach ($points as $point) {
    $distance = calculateDistance(
      $lat, 
      $lng, 
      floatval($point['latitude']), 
      floatval($point['longitude'])
    );

    $radius = intval($point['geofence_radius']);
    
    // If truck is within geofence radius, mark as completed
    if ($distance <= $radius) {
      $updateSql = "
        UPDATE collection_point
        SET status = 'completed',
            last_collected = :now
        WHERE point_id = :point_id
      ";
      $updateStmt = $db->prepare($updateSql);
      $updateStmt->bindValue(':now', $now);
      $updateStmt->bindValue(':point_id', $point['point_id'], PDO::PARAM_INT);
      $updateStmt->execute();

      $updated[] = [
        'point_id' => $point['point_id'],
        'location_name' => $point['location_name'],
        'distance' => round($distance, 2)
      ];
    }
  }

  echo json_encode([
    'success' => true,
    'updated_count' => count($updated),
    'updated_points' => $updated,
    'truck_position' => ['lat' => $lat, 'lng' => $lng]
  ]);

} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 
    'success' => false, 
    'message' => $e->getMessage() 
  ]);
}
?>
