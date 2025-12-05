<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
  $db = (new Database())->connect();
  
  // Get date parameter (default to today)
  $date = $_GET['date'] ?? date('Y-m-d');

  // Get all collection points with their status for today's routes
  // Use a subquery to get the most recent status for each collection point
  $sql = "
    SELECT 
      cp.point_id,
      cp.barangay_id,
      cp.location_name,
      cp.latitude,
      cp.longitude,
      cp.is_mrf,
      cp.last_collected,
      cp.geofence_radius,
      COALESCE(
        (SELECT 
          CASE 
            WHEN drs.status = 'visited' THEN 'completed'
            WHEN drs.status = 'pending' THEN 'pending'
            WHEN drs.status = 'skipped' THEN 'skipped'
          END
         FROM daily_route_stop drs
         JOIN daily_route dr ON drs.daily_route_id = dr.id
         WHERE drs.collection_point_id = cp.point_id
           AND DATE(dr.date) = :date
         ORDER BY 
           CASE drs.status 
             WHEN 'visited' THEN 1
             WHEN 'pending' THEN 2
             WHEN 'skipped' THEN 3
           END
         LIMIT 1
        ),
        'not_scheduled'
      ) as status
    FROM collection_point cp
    ORDER BY cp.barangay_id, cp.location_name
  ";

  $stmt = $db->prepare($sql);
  $stmt->execute(['date' => $date]);
  $points = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([ 
    'success' => true, 
    'points' => $points,
    'count' => count($points),
    'date' => $date
  ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 
    'success' => false, 
    'message' => $e->getMessage() 
  ]);
}
?>
