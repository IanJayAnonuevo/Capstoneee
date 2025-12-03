<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../includes/schedule_history_helper.php';

$database = new Database();
$db = $database->connect();

try {
    // Get current user for history logging
    $currentUser = kolektrash_current_user();
    $actorUserId = $currentUser ? (int)$currentUser['user_id'] : null;
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Invalid JSON body');
    }

    // Accept several possible keys for the identifier to be robust
    $idKeys = ['schedule_template_id', 'template_id', 'id', 'schedule_id', 'predefined_id'];
    $id = 0;
    foreach ($idKeys as $k) {
        if (isset($input[$k]) && $input[$k] !== '') {
            $id = intval($input[$k]);
            break;
        }
    }
    if ($id <= 0) {
        throw new Exception('Missing schedule id');
    }

    // Get before payload for history logging
    $beforePayload = null;
    if ($actorUserId) {
        $beforePayload = get_schedule_before_payload($db, $id);
    }

    $fields = [];
    $params = [];

    $allowed = ['barangay_id', 'day_of_week', 'start_time', 'end_time', 'week_of_month'];
    foreach ($allowed as $key) {
        if (array_key_exists($key, $input)) {
            $fields[] = "$key = ?";
            $params[] = $input[$key];
        }
    }

    if (empty($fields)) {
        throw new Exception('No fields to update');
    }

    // Add updated_by to the update
    if ($actorUserId) {
        $fields[] = 'updated_by = ?';
        $params[] = $actorUserId;
    }

    $params[] = $id;
    $sql = 'UPDATE predefined_schedules SET ' . implode(', ', $fields) . ', updated_at = NOW() WHERE schedule_template_id = ?';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    // Log history if user is authenticated
    if ($actorUserId && $beforePayload) {
        $afterPayload = get_schedule_after_payload($db, $id);
        
        log_schedule_history(
            $db,
            $id,
            'update',
            $actorUserId,
            $beforePayload,
            $afterPayload,
            'Schedule updated'
        );
    }

    echo json_encode(['success' => true, 'message' => 'Schedule updated']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>


