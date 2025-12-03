<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
    $route_id = isset($_GET['route_id']) ? (int)$_GET['route_id'] : null;
    
    if (!$route_id) {
        throw new Exception('Missing route_id parameter');
    }
    
    $db = (new Database())->connect();
    
    // Get per-barangay stop breakdown for this route
    $query = "SELECT 
                cp.barangay_id,
                b.barangay_name,
                COUNT(drs.id) as total_stops,
                COUNT(CASE WHEN drs.status = 'visited' THEN drs.id END) as completed_stops
              FROM daily_route_stop drs
              JOIN collection_point cp ON drs.collection_point_id = cp.point_id
              JOIN barangay b ON cp.barangay_id = b.barangay_id
              WHERE drs.daily_route_id = ?
              GROUP BY cp.barangay_id, b.barangay_name
              ORDER BY drs.seq";
    
    $stmt = $db->prepare($query);
    $stmt->execute([$route_id]);
    $breakdown = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format the response
    $formatted = array_map(function($item) {
        return [
            'barangay_id' => $item['barangay_id'],
            'barangay_name' => $item['barangay_name'],
            'total_stops' => (int)$item['total_stops'],
            'completed_stops' => (int)$item['completed_stops']
        ];
    }, $breakdown);
    
    echo json_encode([
        'success' => true,
        'breakdown' => $formatted
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
