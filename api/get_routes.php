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

    // Get filter parameters
    $status = isset($_GET['status']) && $_GET['status'] !== 'all' ? $_GET['status'] : null;
    $barangay = isset($_GET['barangay']) && $_GET['barangay'] !== 'all' ? $_GET['barangay'] : null;
    $team_id = isset($_GET['team_id']) && $_GET['team_id'] !== 'all' ? intval($_GET['team_id']) : null;
    $date = isset($_GET['date']) && !empty($_GET['date']) ? $_GET['date'] : null;
    $search = isset($_GET['search']) && !empty($_GET['search']) ? $_GET['search'] : null;
    $include_counts = isset($_GET['include_counts']) && $_GET['include_counts'] === 'true';

    // Build WHERE clause
    $where_conditions = [];
    $params = [];

    if ($status) {
        $where_conditions[] = "dr.status = ?";
        $params[] = $status;
    }

    if ($barangay) {
        $where_conditions[] = "dr.barangay_name = ?";
        $params[] = $barangay;
    }

    if ($team_id) {
        $where_conditions[] = "dr.team_id = ?";
        $params[] = $team_id;
    }

    if ($date) {
        $where_conditions[] = "dr.date = ?";
        $params[] = $date;
    }

    $search_param = null;
    if ($search) {
        $search_param = "%{$search}%";
        $where_conditions[] = "(dr.id LIKE ? OR dr.barangay_name LIKE ?)";
        $params[] = $search_param;
        $params[] = $search_param;
    }

    $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";

    // Get routes with stop count
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
                dr.created_at,
                dr.updated_at,
                COUNT(drs.id) as stop_count
              FROM daily_route dr
              LEFT JOIN daily_route_stop drs ON dr.id = drs.daily_route_id
              {$where_clause}
              GROUP BY dr.id, dr.date, dr.cluster_id, dr.barangay_id, dr.barangay_name, 
                       dr.truck_id, dr.team_id, dr.start_time, dr.end_time, dr.status, 
                       dr.source, dr.version, dr.distance_km, dr.duration_min, 
                       dr.capacity_used_kg, dr.notes, dr.created_at, dr.updated_at
              ORDER BY dr.date DESC, dr.start_time ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format routes
    $formatted_routes = array_map(function($route) {
        return [
            'id' => intval($route['id']),
            'date' => $route['date'],
            'cluster_id' => $route['cluster_id'],
            'barangay_id' => $route['barangay_id'],
            'barangay_name' => $route['barangay_name'],
            'truck_id' => intval($route['truck_id']),
            'team_id' => intval($route['team_id']),
            'start_time' => $route['start_time'],
            'end_time' => $route['end_time'],
            'status' => $route['status'],
            'source' => $route['source'],
            'version' => intval($route['version']),
            'distance_km' => $route['distance_km'] ? floatval($route['distance_km']) : null,
            'duration_min' => $route['duration_min'] ? intval($route['duration_min']) : null,
            'capacity_used_kg' => $route['capacity_used_kg'] ? intval($route['capacity_used_kg']) : null,
            'notes' => $route['notes'],
            'stop_count' => intval($route['stop_count']),
            'created_at' => $route['created_at'],
            'updated_at' => $route['updated_at']
        ];
    }, $routes);

    $response = [
        'success' => true,
        'routes' => $formatted_routes,
        'total' => count($formatted_routes)
    ];

    // Get status summary if requested
    if ($include_counts) {
        // Build WHERE clause for summary (without status filter)
        $summary_where_conditions = [];
        $summary_params = [];

        if ($barangay) {
            $summary_where_conditions[] = "barangay_name = ?";
            $summary_params[] = $barangay;
        }

        if ($team_id) {
            $summary_where_conditions[] = "team_id = ?";
            $summary_params[] = $team_id;
        }

        if ($date) {
            $summary_where_conditions[] = "date = ?";
            $summary_params[] = $date;
        }

        if ($search) {
            $summary_where_conditions[] = "(id LIKE ? OR barangay_name LIKE ?)";
            $summary_params[] = $search_param;
            $summary_params[] = $search_param;
        }

        $summary_where_clause = !empty($summary_where_conditions) ? "WHERE " . implode(" AND ", $summary_where_conditions) : "";

        $summary_query = "SELECT 
                            status,
                            COUNT(*) as count
                          FROM daily_route
                          {$summary_where_clause}
                          GROUP BY status";

        $summary_stmt = $db->prepare($summary_query);
        $summary_stmt->execute($summary_params);
        $summary_results = $summary_stmt->fetchAll(PDO::FETCH_ASSOC);

        // Initialize summary with all statuses
        $summary = [
            'scheduled' => 0,
            'in_progress' => 0,
            'completed' => 0,
            'missed' => 0,
            'cancelled' => 0
        ];

        // Fill in actual counts
        foreach ($summary_results as $row) {
            $summary[$row['status']] = intval($row['count']);
        }

        $response['summary'] = $summary;
    }

    echo json_encode($response);

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
