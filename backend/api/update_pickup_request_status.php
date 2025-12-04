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

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);

// Debug logging
error_log('Received data: ' . print_r($input, true));

// Validate required fields
if (!isset($input['request_id']) || !isset($input['status'])) {
    error_log('Missing fields - request_id: ' . (isset($input['request_id']) ? 'present' : 'missing') . ', status: ' . (isset($input['status']) ? 'present' : 'missing'));
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Missing required fields: request_id, status'
    ));
    exit();
}

$request_id = $input['request_id'];
$status = $input['status'];
$scheduled_date = $input['scheduled_date'] ?? null;
$scheduled_time = $input['scheduled_time'] ?? null;
$admin_remarks = $input['admin_remarks'] ?? null;
$declined_reason = $input['declined_reason'] ?? null;
$processed_by = $input['processed_by'] ?? null;
$priority = $input['priority'] ?? null;

// Validate status
$valid_statuses = ['pending', 'scheduled', 'completed', 'declined'];
if (!in_array($status, $valid_statuses)) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Invalid status. Must be one of: ' . implode(', ', $valid_statuses)
    ));
    exit();
}

// Validate priority if provided
if ($priority) {
    $valid_priorities = ['low', 'medium', 'high', 'urgent'];
    if (!in_array($priority, $valid_priorities)) {
        echo json_encode(array(
            'status' => 'error',
            'message' => 'Invalid priority. Must be one of: ' . implode(', ', $valid_priorities)
        ));
        exit();
    }
}

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

try {
    // Build update query
    $query = "UPDATE pickup_requests SET status = :status";
    $params = array(':status' => $status, ':request_id' => $request_id);
    
    if ($scheduled_date) {
        $query .= ", scheduled_date = :scheduled_date";
        $params[':scheduled_date'] = $scheduled_date;
    }
    
    if ($admin_remarks) {
        $query .= ", admin_remarks = :admin_remarks";
        $params[':admin_remarks'] = $admin_remarks;
    }
    
    if ($declined_reason) {
        $query .= ", declined_reason = :declined_reason";
        $params[':declined_reason'] = $declined_reason;
    }
    
    if ($processed_by) {
        $query .= ", processed_by = :processed_by";
        $params[':processed_by'] = $processed_by;
    }
    
    if ($priority) {
        $query .= ", priority = :priority";
        $params[':priority'] = $priority;
    }
    
    if ($status === 'completed') {
        $query .= ", completed_date = NOW()";
    }
    
    $query .= " WHERE id = :request_id";
    
    $stmt = $db->prepare($query);
    
    // Bind parameters
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    
    // Execute the query
    if ($stmt->execute()) {
        if ($stmt->rowCount() > 0) {
            // If status is 'scheduled', create a simple collection_schedule entry
            // Team assignment will be handled by auto-generation
            if ($status === 'scheduled' && $scheduled_date && $scheduled_time) {
                try {
                    error_log('Creating collection schedule for special pickup...');
                    
                    // Get request details
                    $requestQuery = $db->prepare("
                        SELECT pr.*, u.user_id, b.barangay_id
                        FROM pickup_requests pr
                        LEFT JOIN user u ON pr.requester_id = u.user_id
                        LEFT JOIN barangay b ON pr.barangay = b.barangay_name
                        WHERE pr.id = :request_id
                    ");
                    $requestQuery->execute([':request_id' => $request_id]);
                    $requestDetails = $requestQuery->fetch(PDO::FETCH_ASSOC);
                    
                    if ($requestDetails && $requestDetails['barangay_id']) {
                        // Determine session based on time
                        $hour = (int)date('H', strtotime($scheduled_time));
                        $session = $hour < 12 ? 'AM' : 'PM';
                        
                        // Insert into collection_schedule (without team assignment)
                        $scheduleQuery = $db->prepare("
                            INSERT INTO collection_schedule 
                            (barangay_id, scheduled_date, start_time, schedule_type, session, special_pickup_id, status)
                            VALUES 
                            (:barangay_id, :scheduled_date, :start_time, 'special_pickup', :session, :special_pickup_id, 'pending')
                        ");
                        $scheduleQuery->execute([
                            ':barangay_id' => $requestDetails['barangay_id'],
                            ':scheduled_date' => $scheduled_date,
                            ':start_time' => $scheduled_time,
                            ':session' => $session,
                            ':special_pickup_id' => $request_id
                        ]);
                        
                        $scheduleId = $db->lastInsertId();
                        error_log('Created schedule ID: ' . $scheduleId . ' for special pickup');
                        
                        // Send notification to requester only
                        if ($requestDetails['user_id']) {
                            $requesterMessage = json_encode([
                                'type' => 'special_pickup_scheduled',
                                'barangay' => $requestDetails['barangay'],
                                'date' => $scheduled_date,
                                'time' => $scheduled_time,
                                'message' => 'Your special pickup request has been scheduled for ' . date('M d, Y', strtotime($scheduled_date)) . ' at ' . date('g:i A', strtotime($scheduled_time)) . '. A team will be automatically assigned.'
                            ]);
                            
                            $requesterNotifQuery = $db->prepare("
                                INSERT INTO notification 
                                (recipient_id, message, response_status)
                                VALUES 
                                (:recipient_id, :message, 'unread')
                            ");
                            $requesterNotifQuery->execute([
                                ':recipient_id' => $requestDetails['user_id'],
                                ':message' => $requesterMessage
                            ]);
                            error_log('Requester notification sent');
                        }
                    }
                    
                    error_log('Schedule creation completed successfully');
                } catch (Exception $scheduleError) {
                    error_log('ERROR in schedule creation: ' . $scheduleError->getMessage());
                    error_log('Stack trace: ' . $scheduleError->getTraceAsString());
                    // Don't fail the whole request, just log the error
                }
            }
            
            echo json_encode(array(
                'status' => 'success',
                'message' => 'Pickup request status updated successfully',
                'data' => array(
                    'request_id' => $request_id,
                    'status' => $status,
                    'updated_at' => date('Y-m-d H:i:s')
                )
            ));
        } else {
            echo json_encode(array(
                'status' => 'error',
                'message' => 'Pickup request not found or no changes made'
            ));
        }
    } else {
        echo json_encode(array(
            'status' => 'error',
            'message' => 'Failed to update pickup request status'
        ));
    }
    
} catch (PDOException $e) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ));
}
?>
