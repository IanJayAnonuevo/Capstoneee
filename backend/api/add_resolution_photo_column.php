<?php
require_once __DIR__ . '/_bootstrap.php';
// Headers - Allow all origins for development
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

try {
    // Check if resolution_photo_url column already exists
    $checkColumnQuery = "SHOW COLUMNS FROM issue_reports LIKE 'resolution_photo_url'";
    $checkStmt = $db->query($checkColumnQuery);
    
    if ($checkStmt->rowCount() > 0) {
        echo json_encode(array(
            'status' => 'success',
            'message' => 'Column resolution_photo_url already exists'
        ));
        exit();
    }
    
    // Add resolution_photo_url column to issue_reports table
    $alterTableQuery = "ALTER TABLE issue_reports 
        ADD COLUMN resolution_photo_url VARCHAR(500) NULL AFTER resolution_notes";
    
    $stmt = $db->prepare($alterTableQuery);
    
    if ($stmt->execute()) {
        echo json_encode(array(
            'status' => 'success',
            'message' => 'Column resolution_photo_url added successfully to issue_reports table'
        ));
    } else {
        echo json_encode(array(
            'status' => 'error',
            'message' => 'Failed to add resolution_photo_url column'
        ));
    }
    
} catch (PDOException $e) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ));
}
?>
