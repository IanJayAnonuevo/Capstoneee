<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/database.php';

try {
  $date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
  $role = isset($_GET['role']) ? strtolower(trim($_GET['role'])) : null; // 'driver' | 'collector' | null
  $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
  $db = (new Database())->connect();

  // Check if daily_route table exists
  $tableCheck = $db->query("SHOW TABLES LIKE 'daily_route'")->fetch();
  if (!$tableCheck) {
    echo json_encode([ 'success' => false, 'message' => 'daily_route table does not exist' ]);
    exit();
  }

  // Get table columns to avoid selecting non-existent columns
  $columns = $db->query("SHOW COLUMNS FROM daily_route")->fetchAll(PDO::FETCH_COLUMN);
  $selectFields = [];
  if (in_array('id', $columns)) $selectFields[] = 'dr.id';
  if (in_array('date', $columns)) $selectFields[] = 'dr.date';
  if (in_array('start_time', $columns)) $selectFields[] = 'dr.start_time';
  if (in_array('end_time', $columns)) $selectFields[] = 'dr.end_time';
  if (in_array('barangay_name', $columns)) $selectFields[] = 'dr.barangay_name';
  if (in_array('cluster_id', $columns)) $selectFields[] = 'dr.cluster_id';
  if (in_array('truck_id', $columns)) $selectFields[] = 'dr.truck_id';
  if (in_array('team_id', $columns)) $selectFields[] = 'dr.team_id';
  if (in_array('status', $columns)) $selectFields[] = 'dr.status';
  
  if (empty($selectFields)) {
    echo json_encode([ 'success' => false, 'message' => 'daily_route table has no recognizable columns' ]);
    exit();
  }

  // Base query
  $selectList = implode(', ', $selectFields);
  $sql = "SELECT {$selectList}, t.plate_num, ct.team_id,
                 COUNT(drs.id) AS total_stops,
                 COALESCE(SUM(CASE WHEN drs.status IN ('visited','completed','done') THEN 1 ELSE 0 END), 0) AS completed_stops
    FROM daily_route dr
    LEFT JOIN truck t ON dr.truck_id = t.truck_id
    LEFT JOIN collection_team ct ON dr.team_id = ct.team_id
    LEFT JOIN daily_route_stop drs ON drs.daily_route_id = dr.id
    WHERE dr.date = :d";

  $params = [ ':d' => $date ];

  // Apply optional acceptance filtering for personnel 'My Routes'
  // Rule: a personnel does NOT see a generated route until THEY have accepted it.
  if ($userId && ($role === 'driver' || $role === 'collector')) {
    if ($role === 'driver') {
      // Only routes for this driver AND where the driver has accepted/confirmed
      $sql .= " AND ct.driver_id = :uid AND ct.status IN ('accepted','confirmed')";
      $params[':uid'] = $userId;
    } else if ($role === 'collector') {
      // Only routes for teams where this collector is a member AND they accepted/confirmed
      $sql .= " AND EXISTS (
                  SELECT 1 FROM collection_team_member ctm
                  WHERE ctm.team_id = dr.team_id
                    AND ctm.collector_id = :uid
                    AND ctm.response_status IN ('accepted','confirmed')
                )";
      $params[':uid'] = $userId;
    }
  }

  $groupByFields = $selectFields;
  $groupByFields[] = 't.plate_num';
  $groupByFields[] = 'ct.team_id';
  $groupByFields = array_values(array_unique($groupByFields));
  $sql .= " GROUP BY " . implode(', ', $groupByFields) . " ORDER BY dr.start_time";

  $stmt = $db->prepare($sql);
  $stmt->execute($params);
  $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode([ 'success' => true, 'date' => $date, 'routes' => $routes ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 'success' => false, 'message' => $e->getMessage() ]);
}
?>


