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
        
        if (!isset($data['issue_id'])) {
            http_response_code(400);
            echo json_encode([
                'status' => 'error',
                'message' => 'Issue ID is required'
            ]);
            exit;
        }

        $issueId = $data['issue_id'];

        // Delete the issue report from database
        $query = "DELETE FROM issue_reports WHERE id = :issue_id";
        $stmt = $db->prepare($query);
        $stmt->bindParam(':issue_id', $issueId);

        if ($stmt->execute()) {
            echo json_encode([
                'status' => 'success',
                'message' => 'Issue report deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => 'Failed to delete issue report'
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
