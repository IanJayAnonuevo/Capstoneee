<?php
require_once __DIR__ . '/_bootstrap.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, DELETE');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $database = new Database();
    $db = $database->connect();

    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['request_id'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Request ID is required'
            ]);
            exit;
        }

        $requestId = $data['request_id'];

        // Delete the pickup request from database
        $query = "DELETE FROM pickup_requests WHERE id = :request_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':request_id', $requestId);

        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Pickup request deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to delete pickup request'
            ]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
