<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    // Get route_id parameter
    $route_id = isset($_GET['route_id']) ? intval($_GET['route_id']) : 0;

    if ($route_id <= 0) {
        echo json_encode([
            'success' => false,
            'message' => 'Invalid route ID'
        ]);
        exit();
    }

    // Query to get route details with all stops
    $query = "SELECT 
                dr.id,
                dr.date,
                dr.cluster_id,
                dr.barangay_id,
                dr.barangay_name,
                dr.truck_id,
                dr.team_id,
                dr.start_time,
                dr.end_time,
                dr.status,
                dr.source,
                dr.version,
                dr.distance_km,
                dr.duration_min,
                dr.capacity_used_kg,
                dr.notes,
                drs.id as stop_id,
                drs.seq,
                drs.collection_point_id,
                drs.name as stop_name,
                drs.lat,
                drs.lng,
                drs.window_start,
                drs.window_end,
                drs.eta,
                drs.etd,
                drs.planned_volume_kg,
                drs.status as stop_status
              FROM daily_route dr
              LEFT JOIN daily_route_stop drs ON dr.id = drs.daily_route_id
              WHERE dr.id = ?
              ORDER BY drs.seq ASC";

    $stmt = $db->prepare($query);
    $stmt->execute([$route_id]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($results)) {
        echo json_encode([
            'success' => false,
            'message' => 'Route not found'
        ]);
        exit();
    }

    // Build route object
    $route = [
        'id' => $results[0]['id'],
        'date' => $results[0]['date'],
        'cluster_id' => $results[0]['cluster_id'],
        'barangay_id' => $results[0]['barangay_id'],
        'barangay_name' => $results[0]['barangay_name'],
        'truck_id' => $results[0]['truck_id'],
        'team_id' => $results[0]['team_id'],
        'start_time' => $results[0]['start_time'],
        'end_time' => $results[0]['end_time'],
        'status' => $results[0]['status'],
        'source' => $results[0]['source'],
        'version' => $results[0]['version'],
        'distance_km' => $results[0]['distance_km'],
        'duration_min' => $results[0]['duration_min'],
        'capacity_used_kg' => $results[0]['capacity_used_kg'],
        'notes' => $results[0]['notes'],
        'stops' => []
    ];

    // Build stops array
    foreach ($results as $row) {
        if ($row['stop_id']) {
            $route['stops'][] = [
                'id' => $row['stop_id'],
                'seq' => $row['seq'],
                'collection_point_id' => $row['collection_point_id'],
                'name' => $row['stop_name'],
                'lat' => floatval($row['lat']),
                'lng' => floatval($row['lng']),
                'window_start' => $row['window_start'],
                'window_end' => $row['window_end'],
                'eta' => $row['eta'],
                'etd' => $row['etd'],
                'planned_volume_kg' => $row['planned_volume_kg'],
                'status' => $row['stop_status']
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'route' => $route
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
