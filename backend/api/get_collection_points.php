<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: application/json');

require_once '../config/database.php';

try {
    $db = (new Database())->connect();
    
    // Get optional barangay filter
    $barangay_id = isset($_GET['barangay_id']) ? intval($_GET['barangay_id']) : null;
    
    // Build query
    $sql = "
        SELECT 
            cp.point_id,
            cp.barangay_id,
            cp.location_name,
            cp.latitude,
            cp.longitude,
            cp.status,
            cp.is_mrf,
            cp.last_collected,
            cp.geofence_radius,
            b.barangay_name
        FROM collection_point cp
        LEFT JOIN barangay b ON cp.barangay_id = b.barangay_id
    ";
    
    if ($barangay_id) {
        $sql .= " WHERE cp.barangay_id = :barangay_id";
    }
    
    $sql .= " ORDER BY b.barangay_name, cp.location_name";
    
    $stmt = $db->prepare($sql);
    
    if ($barangay_id) {
        $stmt->bindParam(':barangay_id', $barangay_id, PDO::PARAM_INT);
    }
    
    $stmt->execute();
    $points = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert numeric strings to proper types
    foreach ($points as &$point) {
        $point['point_id'] = (int)$point['point_id'];
        $point['barangay_id'] = (int)$point['barangay_id'];
        $point['latitude'] = (float)$point['latitude'];
        $point['longitude'] = (float)$point['longitude'];
        $point['is_mrf'] = (bool)$point['is_mrf'];
        $point['geofence_radius'] = (int)$point['geofence_radius'];
    }
    
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
