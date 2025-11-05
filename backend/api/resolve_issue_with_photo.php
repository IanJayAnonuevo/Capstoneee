<?php
require_once __DIR__ . '/_bootstrap.php';
// Headers - Allow all origins for development
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Method not allowed'
    ));
    exit();
}

// Get POST data from form-data
$issue_id = $_POST['issue_id'] ?? null;
$status = $_POST['status'] ?? 'resolved';
$resolved_by = $_POST['resolved_by'] ?? null;
$resolution_notes = $_POST['resolution_notes'] ?? null;

// Validate required fields
if (!$issue_id) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Missing required field: issue_id'
    ));
    exit();
}

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

try {
    $resolution_photo_url = null;
    
    // Handle file upload if photo is provided
    if (isset($_FILES['resolution_photo']) && $_FILES['resolution_photo']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../../uploads/issue_resolutions/';
        
        // Create directory if it doesn't exist
        if (!is_dir($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Get file extension
        $file_extension = strtolower(pathinfo($_FILES['resolution_photo']['name'], PATHINFO_EXTENSION));
        
        // Validate file type
        $allowed_extensions = ['jpg', 'jpeg', 'png', 'gif'];
        if (!in_array($file_extension, $allowed_extensions)) {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid file type. Only JPG, JPEG, PNG, and GIF are allowed.'
            ));
            exit();
        }
        
        // Generate unique filename
        $filename = 'resolution_' . $issue_id . '_' . time() . '.' . $file_extension;
        $upload_path = $upload_dir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['resolution_photo']['tmp_name'], $upload_path)) {
            $resolution_photo_url = 'uploads/issue_resolutions/' . $filename;
        } else {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to upload resolution photo'
            ));
            exit();
        }
    }
    
    // Build update query
    $query = "UPDATE issue_reports SET 
        status = :status,
        resolved_at = NOW()";
    
    $params = array(
        ':status' => $status,
        ':issue_id' => $issue_id
    );
    
    if ($resolved_by) {
        $query .= ", resolved_by = :resolved_by";
        $params[':resolved_by'] = $resolved_by;
    }
    
    if ($resolution_notes) {
        $query .= ", resolution_notes = :resolution_notes";
        $params[':resolution_notes'] = $resolution_notes;
    }
    
    if ($resolution_photo_url) {
        $query .= ", resolution_photo_url = :resolution_photo_url";
        $params[':resolution_photo_url'] = $resolution_photo_url;
    }
    
    $query .= " WHERE id = :issue_id";
    
    $stmt = $db->prepare($query);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    // Execute the query
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Issue resolved successfully with photo',
                'data' => array(
                    'issue_id' => $issue_id,
                    'status' => $status,
                    'resolution_photo_url' => $resolution_photo_url ? 'https://kolektrash.systemproj.com/' . $resolution_photo_url : null,
                    'updated_at' => date('Y-m-d H:i:s')
                )
            ));
        } else {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Issue not found or no changes made'
            ));
        }
    } else {
        echo json_encode(array(
            'status' => 'error',
            'message' => 'Failed to resolve issue'
        ));
    }
    
} catch (PDOException $e) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ));
}
?>
