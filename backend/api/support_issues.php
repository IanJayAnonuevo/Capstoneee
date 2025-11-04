<?php
// Support Staff API - Handle issues submitted by residents and barangay heads
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// Only allow GET and POST requests
if (!in_array($_SERVER['REQUEST_METHOD'], ['GET', 'POST', 'PUT'])) {
    http_response_code(405);
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Method not allowed'
    ));
    exit();
}

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Get all issues for support staff
    $query = "SELECT 
                    ir.id,
                    ir.issue_type,
                    ir.description,
                    ir.photo_url,
                    ir.created_at,
                    ir.status,
                    ir.priority,
                    ir.resolution_notes,
                    ir.resolution_photo_url,
                    ir.resolved_at,
                    ir.resolved_by,
                    ir.reporter_id,
                    ir.reporter_name,
                    ir.barangay,
            COALESCE(ir.exact_location, ir.location) AS exact_location,
                    up.firstname,
                    up.lastname,
                    up.contact_num,
                    b.barangay_name,
                    resolver.firstname AS resolver_firstname,
                    resolver.lastname AS resolver_lastname
                FROM issue_reports ir
                LEFT JOIN user_profile up ON ir.reporter_id = up.user_id
                LEFT JOIN barangay b ON up.barangay_id = b.barangay_id
                LEFT JOIN user_profile resolver ON ir.resolved_by = resolver.user_id
                ORDER BY ir.created_at DESC";

        // Add filters if provided
        if (isset($_GET['status'])) {
            $status = $_GET['status'];
            if (in_array($status, ['pending', 'active', 'resolved', 'closed'])) {
                $query = "SELECT 
                            ir.id,
                            ir.issue_type,
                            ir.description,
                            ir.photo_url,
                            ir.created_at,
                            ir.status,
                            ir.priority,
                            ir.resolution_notes,
                            ir.resolution_photo_url,
                            ir.resolved_at,
                            ir.resolved_by,
                            ir.reporter_id,
                            ir.reporter_name,
                            ir.barangay,
                            COALESCE(ir.exact_location, ir.location) AS exact_location,
                            up.firstname,
                            up.lastname,
                            up.contact_num,
                            b.barangay_name,
                            resolver.firstname AS resolver_firstname,
                            resolver.lastname AS resolver_lastname
                        FROM issue_reports ir
                        LEFT JOIN user_profile up ON ir.reporter_id = up.user_id
                        LEFT JOIN barangay b ON up.barangay_id = b.barangay_id
                        LEFT JOIN user_profile resolver ON ir.resolved_by = resolver.user_id
                        WHERE ir.status = :status
                        ORDER BY ir.created_at DESC";
            }
        }

        $stmt = $db->prepare($query);
        
        if (isset($status)) {
            $stmt->bindValue(':status', $status);
        }
        
        $stmt->execute();
        
        $issues = array();
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $reporterName = trim(($row['firstname'] ?? '') . ' ' . ($row['lastname'] ?? ''));
            $resolverName = trim(($row['resolver_firstname'] ?? '') . ' ' . ($row['resolver_lastname'] ?? ''));
            
            $issue = array(
                'id' => $row['id'],
                'issue_type' => $row['issue_type'],
                'description' => $row['description'],
                'photo_url' => $row['photo_url'],
                'created_at' => $row['created_at'],
                'status' => $row['status'] ?? 'pending',
                'priority' => $row['priority'] ?? 'medium',
                'resolution_notes' => $row['resolution_notes'],
                'resolution_photo_url' => $row['resolution_photo_url'],
                'resolved_at' => $row['resolved_at'],
                'resolved_by' => $row['resolved_by'],
                'resolved_by_name' => $resolverName !== '' ? $resolverName : null,
                'reporter_id' => $row['reporter_id'],
                'reporter_name' => $reporterName !== '' ? $reporterName : $row['reporter_name'],
                'barangay' => $row['barangay_name'] ?? $row['barangay'],
                'exact_location' => $row['exact_location'],
                'contact_num' => $row['contact_num']
            );
            
            array_push($issues, $issue);
        }
        
        echo json_encode(array(
            'status' => 'success',
            'data' => $issues,
            'count' => count($issues)
        ));
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Handle issue status updates and assignments
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['action'])) {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Missing action parameter'
            ));
            exit();
        }
        
        $action = $input['action'];
        
        switch ($action) {
            case 'update_status':
                if (!isset($input['issue_id']) || !isset($input['status'])) {
                    echo json_encode(array(
                        'status' => 'error',
                        'message' => 'Missing required fields: issue_id, status'
                    ));
                    exit();
                }
                
                $issue_id = $input['issue_id'];
                $status = $input['status'];
                $resolved_by = $input['resolved_by'] ?? null;
                $resolution_notes = $input['resolution_notes'] ?? null;
                $priority = $input['priority'] ?? null;
                
                // Validate status
                $valid_statuses = ['pending', 'active', 'resolved', 'closed'];
                if (!in_array($status, $valid_statuses)) {
                    echo json_encode(array(
                        'status' => 'error',
                        'message' => 'Invalid status. Must be one of: ' . implode(', ', $valid_statuses)
                    ));
                    exit();
                }
                
                // Build update query
                $query = "UPDATE issue_reports SET status = :status";
                $params = array(':status' => $status, ':issue_id' => $issue_id);
                
                if ($resolved_by) {
                    $query .= ", resolved_by = :resolved_by";
                    $params[':resolved_by'] = $resolved_by;
                }
                
                if ($resolution_notes) {
                    $query .= ", resolution_notes = :resolution_notes";
                    $params[':resolution_notes'] = $resolution_notes;
                }
                
                if ($priority) {
                    $query .= ", priority = :priority";
                    $params[':priority'] = $priority;
                }
                
                if ($status === 'resolved' || $status === 'closed') {
                    $query .= ", resolved_at = NOW()";
                }
                
                $query .= " WHERE id = :issue_id";
                
                $stmt = $db->prepare($query);
                
                foreach ($params as $key => $value) {
                    $stmt->bindValue($key, $value);
                }
                
                if ($stmt->execute()) {
                    echo json_encode(array(
                        'status' => 'success',
                        'message' => 'Issue status updated successfully',
                        'data' => array(
                            'issue_id' => $issue_id,
                            'status' => $status,
                            'updated_at' => date('Y-m-d H:i:s')
                        )
                    ));
                } else {
                    echo json_encode(array(
                        'status' => 'error',
                        'message' => 'Failed to update issue status'
                    ));
                }
                break;
                
            case 'assign_priority':
                if (!isset($input['issue_id']) || !isset($input['priority'])) {
                    echo json_encode(array(
                        'status' => 'error',
                        'message' => 'Missing required fields: issue_id, priority'
                    ));
                    exit();
                }
                
                $issue_id = $input['issue_id'];
                $priority = $input['priority'];
                
                // Validate priority
                $valid_priorities = ['low', 'medium', 'high', 'urgent'];
                if (!in_array($priority, $valid_priorities)) {
                    echo json_encode(array(
                        'status' => 'error',
                        'message' => 'Invalid priority. Must be one of: ' . implode(', ', $valid_priorities)
                    ));
                    exit();
                }
                
                $query = "UPDATE issue_reports SET priority = :priority WHERE id = :issue_id";
                $stmt = $db->prepare($query);
                $stmt->bindValue(':priority', $priority);
                $stmt->bindValue(':issue_id', $issue_id);
                
                if ($stmt->execute()) {
                    echo json_encode(array(
                        'status' => 'success',
                        'message' => 'Issue priority updated successfully',
                        'data' => array(
                            'issue_id' => $issue_id,
                            'priority' => $priority
                        )
                    ));
                } else {
                    echo json_encode(array(
                        'status' => 'error',
                        'message' => 'Failed to update issue priority'
                    ));
                }
                break;
                
            default:
                echo json_encode(array(
                    'status' => 'error',
                    'message' => 'Invalid action'
                ));
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Handle file uploads for resolution photos
        $issue_id = $_POST['issue_id'] ?? null;
        $status = $_POST['status'] ?? 'resolved';
        $resolved_by = $_POST['resolved_by'] ?? null;
        $resolution_notes = $_POST['resolution_notes'] ?? null;
        
        if (!$issue_id) {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Missing required field: issue_id'
            ));
            exit();
        }
        
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
        
        foreach ($params as $key => $value) {
            $stmt->bindValue($key, $value);
        }
        
        if ($stmt->execute()) {
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Issue resolved successfully',
                'data' => array(
                    'issue_id' => $issue_id,
                    'status' => $status,
                    'resolution_photo_url' => $resolution_photo_url,
                    'updated_at' => date('Y-m-d H:i:s')
                )
            ));
        } else {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Failed to resolve issue'
            ));
        }
    }
    
} catch (PDOException $e) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ));
} catch (Exception $e) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Error: ' . $e->getMessage()
    ));
}
?>



