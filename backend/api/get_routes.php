<?php
// Suppress all errors and warnings to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

// Start output buffering to catch any unexpected output
ob_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    ob_end_clean();
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();

    // Get filter parameters
    $status = isset($_GET['status']) && $_GET['status'] !== 'all' ? $_GET['status'] : null;
    $barangay = isset($_GET['barangay']) && $_GET['barangay'] !== 'all' ? $_GET['barangay'] : null;
    $team_id = isset($_GET['team_id']) && $_GET['team_id'] !== 'all' ? intval($_GET['team_id']) : null;
    $date = isset($_GET['date']) && !empty($_GET['date']) ? $_GET['date'] : null;
    $search = isset($_GET['search']) && !empty($_GET['search']) ? $_GET['search'] : null;
    $include_counts = isset($_GET['include_counts']) && $_GET['include_counts'] === 'true';
    $user_id = isset($_GET['user_id']) && !empty($_GET['user_id']) ? $_GET['user_id'] : null;
    $role = isset($_GET['role']) && !empty($_GET['role']) ? $_GET['role'] : null;

    // Build WHERE clause
    $where_conditions = [];
    $params = [];
    
    // Determine if we need to join collection_team for user filtering
    $need_team_join = ($user_id && $role);

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

    // Add user/role filtering conditions
    if ($need_team_join) {
        if ($role === 'driver') {
            $where_conditions[] = "ct.driver_id = ?";
            $params[] = $user_id;
            $where_conditions[] = "ct.status IN ('accepted', 'confirmed', 'approved')";
        } elseif ($role === 'collector') {
            $where_conditions[] = "ctm.collector_id = ?";
            $params[] = $user_id;
            $where_conditions[] = "ctm.response_status IN ('accepted', 'confirmed', 'approved')";
        }
    }
    
    $where_clause = !empty($where_conditions) ? "WHERE " . implode(" AND ", $where_conditions) : "";

    // Build JOIN clause based on whether we need team filtering
    $team_join = "";
    if ($need_team_join) {
        if ($role === 'driver') {
            $team_join = "INNER JOIN collection_team ct ON dr.team_id = ct.team_id";
        } elseif ($role === 'collector') {
            $team_join = "INNER JOIN collection_team ct ON dr.team_id = ct.team_id
                          INNER JOIN collection_team_member ctm ON ct.team_id = ctm.team_id";
        }
    }

    // Get routes with stop count and barangays passed through
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
                COUNT(DISTINCT drs.id) as stop_count,
                COUNT(DISTINCT CASE WHEN drs.status = 'visited' THEN drs.id END) as completed_stops,
                GROUP_CONCAT(DISTINCT b.barangay_name ORDER BY drs.seq SEPARATOR ', ') as barangays_passed
              FROM daily_route dr
              {$team_join}
              LEFT JOIN daily_route_stop drs ON dr.id = drs.daily_route_id
              LEFT JOIN collection_point cp ON drs.collection_point_id = cp.point_id
              LEFT JOIN barangay b ON cp.barangay_id = b.barangay_id
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
            'barangays_passed' => $route['barangays_passed'] ?: $route['barangay_name'], // Fallback to main barangay
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
            'total_stops' => intval($route['stop_count']),
            'completed_stops' => intval($route['completed_stops'] ?? 0),
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

    // Clean any unexpected output
    ob_end_clean();
    
    echo json_encode($response);

} catch (PDOException $e) {
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
