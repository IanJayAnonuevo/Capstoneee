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
            // If status is 'scheduled' and assignment data is provided, create schedule and team
            if ($status === 'scheduled' && isset($input['assignment'])) {
                try {
                    $assignment = $input['assignment'];
                    error_log('Processing assignment data: ' . print_r($assignment, true));
                    
                    // Get request details for notifications
                    $requestQuery = $db->prepare("
                        SELECT pr.*, u.user_id, b.barangay_id
                        FROM pickup_requests pr
                        LEFT JOIN user u ON pr.requester_id = u.user_id
                        LEFT JOIN barangay b ON pr.barangay = b.barangay_name
                        WHERE pr.id = :request_id
                    ");
                    $requestQuery->execute([':request_id' => $request_id]);
                    $requestDetails = $requestQuery->fetch(PDO::FETCH_ASSOC);
                    error_log('Request details: ' . print_r($requestDetails, true));
                    
                    // Create collection schedule entry for special pickup
                    error_log('Checking conditions - driver_id: ' . ($assignment['driver_id'] ?? 'NOT SET') . ', truck_id: ' . ($assignment['truck_id'] ?? 'NOT SET') . ', requestDetails: ' . ($requestDetails ? 'EXISTS' : 'NULL'));
                    
                    if (isset($assignment['driver_id']) && isset($assignment['truck_id']) && $requestDetails) {
                        error_log('Creating collection schedule...');
                        // Insert into collection_schedule
                        $scheduleQuery = $db->prepare("
                            INSERT INTO collection_schedule 
                            (barangay_id, scheduled_date, start_time, schedule_type, session, special_pickup_id)
                            VALUES 
                            (:barangay_id, :scheduled_date, :start_time, 'special_pickup', 'special', :special_pickup_id)
                        ");
                        $scheduleQuery->execute([
                            ':barangay_id' => $requestDetails['barangay_id'] ?? null,
                            ':scheduled_date' => $assignment['schedule_date'],
                            ':start_time' => $assignment['schedule_time'],
                            ':special_pickup_id' => $request_id
                        ]);
                        
                        $scheduleId = $db->lastInsertId();
                        error_log('Created schedule ID: ' . $scheduleId);
                        
                        // Create collection team
                        error_log('Creating collection team...');
                        $teamQuery = $db->prepare("
                            INSERT INTO collection_team 
                            (schedule_id, truck_id, driver_id, status)
                            VALUES 
                            (:schedule_id, :truck_id, :driver_id, 'pending')
                        ");
                        $teamQuery->execute([
                            ':schedule_id' => $scheduleId,
                            ':truck_id' => $assignment['truck_id'],
                            ':driver_id' => $assignment['driver_id']
                        ]);
                        
                        $teamId = $db->lastInsertId();
                        error_log('Created team ID: ' . $teamId);
                        
                        // Send notification to driver
                        error_log('Sending notification to driver ID: ' . $assignment['driver_id']);
                        $driverMessage = 'You have been assigned to a special pickup at ' . $requestDetails['barangay'] . ' on ' . date('M d, Y', strtotime($assignment['schedule_date'])) . ' at ' . date('g:i A', strtotime($assignment['schedule_time']));
                        $notifQuery = $db->prepare("
                            INSERT INTO notification 
                            (recipient_id, message, response_status)
                            VALUES 
                            (:recipient_id, :message, 'unread')
                        ");
                        $notifQuery->execute([
                            ':recipient_id' => $assignment['driver_id'],
                            ':message' => $driverMessage
                        ]);
                        error_log('Driver notification sent');
                        
                        // Add collectors to team
                        if (isset($assignment['collector_ids']) && is_array($assignment['collector_ids'])) {
                            error_log('Adding ' . count($assignment['collector_ids']) . ' collectors...');
                            foreach ($assignment['collector_ids'] as $collectorId) {
                                $memberQuery = $db->prepare("
                                    INSERT INTO collection_team_member 
                                    (team_id, collector_id, response_status)
                                    VALUES 
                                    (:team_id, :collector_id, 'pending')
                                ");
                                $memberQuery->execute([
                                    ':team_id' => $teamId,
                                    ':collector_id' => $collectorId
                                ]);
                                
                                // Send notification to collector
                                $collectorMessage = 'You have been assigned to a special pickup at ' . $requestDetails['barangay'] . ' on ' . date('M d, Y', strtotime($assignment['schedule_date'])) . ' at ' . date('g:i A', strtotime($assignment['schedule_time']));
                                $collectorNotifQuery = $db->prepare("
                                    INSERT INTO notification 
                                    (recipient_id, message, response_status)
                                    VALUES 
                                    (:recipient_id, :message, 'unread')
                                ");
                                $collectorNotifQuery->execute([
                                    ':recipient_id' => $collectorId,
                                    ':message' => $collectorMessage
                                ]);
                                error_log('Collector notification sent to ID: ' . $collectorId);
                            }
                        }
                    }
                    
                    // Send notification to requester
                    if ($requestDetails && $requestDetails['user_id']) {
                        error_log('Sending notification to requester ID: ' . $requestDetails['user_id']);
                        $requesterMessage = 'Your special pickup request has been scheduled for ' . date('M d, Y', strtotime($assignment['schedule_date'])) . ' at ' . date('g:i A', strtotime($assignment['schedule_time']));
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
                    
                    error_log('Assignment processing completed successfully');
                } catch (Exception $assignmentError) {
                    error_log('ERROR in assignment processing: ' . $assignmentError->getMessage());
                    error_log('Stack trace: ' . $assignmentError->getTraceAsString());
                    // Don't fail the whole request, just log the error
                    // The status update already succeeded
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
