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
    
    // TODO: Add check for dependencies (routes, schedules, etc.)
    // For now, we'll do a simple delete
    
    $stmt = $db->prepare("DELETE FROM collection_point WHERE point_id = :point_id");
    $stmt->bindParam(':point_id', $point_id, PDO::PARAM_INT);
    $stmt->execute();
    
    echo json_encode([
        'success' => true,
        'message' => 'Collection point deleted successfully'
    ]);
    
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
