<?php
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

// Get POST data from form data (multipart/form-data)
$reporter_id = $_POST['reporter_id'] ?? null;
$reporter_name = $_POST['reporter_name'] ?? null;
$barangay = $_POST['barangay'] ?? null;
$issue_type = $_POST['issue_type'] ?? null;
$exact_location = null;
if (isset($_POST['exact_location'])) {
    $exact_location = trim($_POST['exact_location']);
} elseif (isset($_POST['exactLocation'])) {
    $exact_location = trim($_POST['exactLocation']);
}
$description = $_POST['description'] ?? null;
$table = $_POST['table'] ?? 'issue_reports';

// Validate required fields
if (!$reporter_id || !$issue_type || !$description || !$exact_location) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Missing required fields: reporter_id, issue_type, exact_location, description'
    ));
    exit();
}

// Normalize optional strings
if ($exact_location !== null && $exact_location === '') {
    $exact_location = null;
}

// Validate issue type (supports legacy and new labels)
$valid_issue_types = array(
    'missed collection' => 'Missed Collection',
    'damaged bin' => 'Damaged Bin',
    'irregular schedule' => 'Irregular Schedule',
    'uncollected waste' => 'Uncollected Waste',
    'overflowing bins' => 'Overflowing Bins',
    'illegal dumping' => 'Illegal Dumping',
    'other' => 'Other',
    'others' => 'Others',
    // Expanded resident-facing labels
    'missed or delayed pickups' => 'Missed or delayed pickups',
    'overflowing or insufficient bins' => 'Overflowing or insufficient bins',
    'unpleasant odors from trash areas' => 'Unpleasant odors from trash areas',
    'rude or unprofessional service from collectors' => 'Rude or unprofessional service from collectors',
);

$normalized_issue_type = strtolower(trim($issue_type));
if (isset($valid_issue_types[$normalized_issue_type])) {
    $issue_type = $valid_issue_types[$normalized_issue_type];
} else {
    // Allow any custom issue type when it doesn't match the predefined list
    // This supports user-provided "Others" custom descriptions
    $issue_type = trim($issue_type);
}

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Determine the appropriate column name for storing the location
$locationColumn = 'exact_location';
try {
    $columnCheck = $db->query("SHOW COLUMNS FROM issue_reports LIKE 'exact_location'");
    if ($columnCheck->rowCount() === 0) {
        $legacyColumnCheck = $db->query("SHOW COLUMNS FROM issue_reports LIKE 'location'");
        if ($legacyColumnCheck->rowCount() > 0) {
            $locationColumn = 'location';
        }
    }
} catch (PDOException $columnError) {
    error_log('Column inspection failed in submit_issue_report.php: ' . $columnError->getMessage());
}

try {
    // If reporter_name is not provided, fetch it from the database
    if (!$reporter_name) {
        $nameQuery = "SELECT firstname, lastname FROM user_profile WHERE user_id = :user_id";
        $nameStmt = $db->prepare($nameQuery);
        $nameStmt->bindParam(':user_id', $reporter_id);
        $nameStmt->execute();
        
        if ($nameStmt->rowCount() > 0) {
            $userData = $nameStmt->fetch(PDO::FETCH_ASSOC);
            $reporter_name = trim($userData['firstname'] . ' ' . $userData['lastname']);
        } else {
            $reporter_name = 'Unknown User';
        }
    }
    
    // If barangay is not provided, fetch it from the database
    if (!$barangay) {
        $barangayQuery = "SELECT b.barangay_name FROM user_profile up 
                         LEFT JOIN barangay b ON up.barangay_id = b.barangay_id 
                         WHERE up.user_id = :user_id";
        $barangayStmt = $db->prepare($barangayQuery);
        $barangayStmt->bindParam(':user_id', $reporter_id);
        $barangayStmt->execute();
        
        if ($barangayStmt->rowCount() > 0) {
            $barangayData = $barangayStmt->fetch(PDO::FETCH_ASSOC);
            $barangay = $barangayData['barangay_name'] ?? 'Unknown Barangay';
        } else {
            $barangay = 'Unknown Barangay';
        }
    }
    
    // Handle photo upload if provided
    $photo_url = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $upload_dir = '../../uploads/issue_reports/';
        
        // Create directory if it doesn't exist
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        // Validate file type
        $allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        $file_type = $_FILES['photo']['type'];
        
        if (!in_array($file_type, $allowed_types)) {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Invalid file type. Only JPEG, PNG, and GIF images are allowed.'
            ));
            exit();
        }
        
        // Validate file size (max 5MB)
        $max_size = 5 * 1024 * 1024; // 5MB
        if ($_FILES['photo']['size'] > $max_size) {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'File size too large. Maximum size is 5MB.'
            ));
            exit();
        }
        
        // Generate unique filename
        $file_extension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $filename = 'issue_' . $reporter_id . '_' . time() . '_' . uniqid() . '.' . $file_extension;
        $file_path = $upload_dir . $filename;
        
        // Move uploaded file
        if (move_uploaded_file($_FILES['photo']['tmp_name'], $file_path)) {
            $photo_url = 'uploads/issue_reports/' . $filename;
        } else {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to upload photo'
            ));
            exit();
        }
    }
    
    // Insert into issue_reports table
    $query = "INSERT INTO issue_reports (reporter_id, reporter_name, barangay, issue_type, {$locationColumn}, description, photo_url, status, created_at) 
              VALUES (:reporter_id, :reporter_name, :barangay, :issue_type, :exact_location, :description, :photo_url, 'pending', NOW())";
    
    $stmt = $db->prepare($query);
    
    // Bind parameters
    $stmt->bindValue(':reporter_id', $reporter_id, PDO::PARAM_INT);
    $stmt->bindValue(':reporter_name', $reporter_name, PDO::PARAM_STR);
    $stmt->bindValue(':barangay', $barangay, PDO::PARAM_STR);
    $stmt->bindValue(':issue_type', $issue_type, PDO::PARAM_STR);
    if ($exact_location === null) {
        $stmt->bindValue(':exact_location', null, PDO::PARAM_NULL);
    } else {
        $stmt->bindValue(':exact_location', $exact_location, PDO::PARAM_STR);
    }
    $stmt->bindValue(':description', $description, PDO::PARAM_STR);
    $stmt->bindValue(':photo_url', $photo_url, $photo_url ? PDO::PARAM_STR : PDO::PARAM_NULL);
    
    // Execute the query
    if ($stmt->execute()) {
        $issue_id = $db->lastInsertId();
        
        // Log the issue submission for tracking
        error_log("Issue report submitted - ID: $issue_id, Reporter: $reporter_id, Type: $issue_type");
        
        echo json_encode(array(
            'status' => 'success',
            'message' => 'Issue report submitted successfully',
            'data' => array(
                'issue_id' => $issue_id,
                'status' => 'pending',
                'exact_location' => $exact_location,
                'photo_url' => $photo_url
            )
        ));
    } else {
        echo json_encode(array(
            'status' => 'error',
            'message' => 'Failed to submit issue report'
        ));
    }
    
} catch (PDOException $e) {
    error_log("Database error in submit_issue_report.php: " . $e->getMessage());
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ));
} catch (Exception $e) {
    error_log("General error in submit_issue_report.php: " . $e->getMessage());
    echo json_encode(array(
        'status' => 'error',
        'message' => 'An error occurred while processing your request'
    ));
}
?>
