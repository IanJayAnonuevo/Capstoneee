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
    
    // Validate required field
    if (!isset($input['point_id'])) {
        throw new Exception('Missing required field: point_id');
    }
    
    $point_id = intval($input['point_id']);
    
    // Check if collection point exists
    $stmt = $db->prepare("SELECT point_id FROM collection_point WHERE point_id = :point_id");
    $stmt->bindParam(':point_id', $point_id, PDO::PARAM_INT);
    $stmt->execute();
    
    if (!$stmt->fetch()) {
        throw new Exception('Collection point not found');
    }
    
    // Build update query dynamically based on provided fields
    $updates = [];
    $params = [':point_id' => $point_id];
    
    if (isset($input['barangay_id'])) {
        $barangay_id = intval($input['barangay_id']);
        
        // Verify barangay exists
        $stmt = $db->prepare("SELECT barangay_id FROM barangay WHERE barangay_id = :barangay_id");
        $stmt->bindParam(':barangay_id', $barangay_id, PDO::PARAM_INT);
        $stmt->execute();
        
        if (!$stmt->fetch()) {
            throw new Exception('Barangay not found');
        }
        
        $updates[] = "barangay_id = :barangay_id";
        $params[':barangay_id'] = $barangay_id;
    }
    
    if (isset($input['location_name'])) {
        $updates[] = "location_name = :location_name";
        $params[':location_name'] = trim($input['location_name']);
    }
    
    if (isset($input['latitude'])) {
        $latitude = floatval($input['latitude']);
        if ($latitude < -90 || $latitude > 90) {
            throw new Exception('Invalid latitude');
        }
        $updates[] = "latitude = :latitude";
        $params[':latitude'] = $latitude;
    }
    
    if (isset($input['longitude'])) {
        $longitude = floatval($input['longitude']);
        if ($longitude < -180 || $longitude > 180) {
            throw new Exception('Invalid longitude');
        }
        $updates[] = "longitude = :longitude";
        $params[':longitude'] = $longitude;
    }
    
    if (isset($input['is_mrf'])) {
        $updates[] = "is_mrf = :is_mrf";
        $params[':is_mrf'] = (bool)$input['is_mrf'];
    }
    
    if (isset($input['status'])) {
        $status = $input['status'];
        if (!in_array($status, ['pending', 'completed'])) {
            throw new Exception('Invalid status. Must be "pending" or "completed"');
        }
        $updates[] = "status = :status";
        $params[':status'] = $status;
    }
    
    if (isset($input['geofence_radius'])) {
        $updates[] = "geofence_radius = :geofence_radius";
        $params[':geofence_radius'] = intval($input['geofence_radius']);
    }
    
    if (empty($updates)) {
        throw new Exception('No fields to update');
    }
    
    // Execute update
    $sql = "UPDATE collection_point SET " . implode(', ', $updates) . " WHERE point_id = :point_id";
    $stmt = $db->prepare($sql);
    
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Collection point updated successfully'
    ]);
    
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
