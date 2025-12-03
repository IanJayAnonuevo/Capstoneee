<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    // Get JSON input
    $data = json_decode(file_get_contents('php://input'), true);

    if (!isset($data['truck_id']) || !isset($data['status'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    $truck_id = $data['truck_id'];
    $status = $data['status'];

    // Validate status - accept common variations
    $validStatuses = ['available', 'Available', 'in use', 'In Use', 'in_use', 'In_Use', 'maintenance', 'Maintenance', 'unavailable', 'Unavailable'];
    if (!in_array($status, $validStatuses)) {
        echo json_encode(['success' => false, 'message' => 'Invalid status value: ' . $status]);
        exit;
    }

    // Normalize status to match database format (capitalize first letter)
    $normalizedStatus = ucfirst(strtolower(str_replace('_', ' ', $status)));

    // Update truck status
    $query = "UPDATE truck SET status = :status WHERE truck_id = :truck_id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':status', $normalizedStatus);
    $stmt->bindParam(':truck_id', $truck_id);

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Truck status updated successfully',
            'truck_id' => $truck_id,
            'new_status' => $normalizedStatus
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update truck status']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
