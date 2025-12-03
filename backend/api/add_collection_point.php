<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: application/json');

require_once '../config/database.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $db = (new Database())->connect();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    if (!isset($input['barangay_id']) || !isset($input['location_name']) || 
        !isset($input['latitude']) || !isset($input['longitude'])) {
        throw new Exception('Missing required fields: barangay_id, location_name, latitude, longitude');
    }
    
    $barangay_id = intval($input['barangay_id']);
    $location_name = trim($input['location_name']);
    $latitude = floatval($input['latitude']);
    $longitude = floatval($input['longitude']);
    $is_mrf = isset($input['is_mrf']) ? (bool)$input['is_mrf'] : false;
    $status = isset($input['status']) ? $input['status'] : 'pending';
    $geofence_radius = isset($input['geofence_radius']) ? intval($input['geofence_radius']) : 50;
    
    // Validate status
    if (!in_array($status, ['pending', 'completed'])) {
        throw new Exception('Invalid status. Must be "pending" or "completed"');
    }
    
    // Validate coordinates
    if ($latitude < -90 || $latitude > 90 || $longitude < -180 || $longitude > 180) {
        throw new Exception('Invalid coordinates');
    }
    
    // Check if barangay exists
    $stmt = $db->prepare("SELECT barangay_id FROM barangay WHERE barangay_id = :barangay_id");
    $stmt->bindParam(':barangay_id', $barangay_id, PDO::PARAM_INT);
    $stmt->execute();
    
    if (!$stmt->fetch()) {
        throw new Exception('Barangay not found');
    }
    
    // Insert collection point
    $sql = "
        INSERT INTO collection_point 
        (barangay_id, location_name, latitude, longitude, is_mrf, status, geofence_radius)
        VALUES 
        (:barangay_id, :location_name, :latitude, :longitude, :is_mrf, :status, :geofence_radius)
    ";
    
    $stmt = $db->prepare($sql);
    $stmt->bindParam(':barangay_id', $barangay_id, PDO::PARAM_INT);
    $stmt->bindParam(':location_name', $location_name, PDO::PARAM_STR);
    $stmt->bindParam(':latitude', $latitude);
    $stmt->bindParam(':longitude', $longitude);
    $stmt->bindParam(':is_mrf', $is_mrf, PDO::PARAM_BOOL);
    $stmt->bindParam(':status', $status, PDO::PARAM_STR);
    $stmt->bindParam(':geofence_radius', $geofence_radius, PDO::PARAM_INT);
    
    $stmt->execute();
    $point_id = $db->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Collection point added successfully',
        'point_id' => (int)$point_id
    ]);
    
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
