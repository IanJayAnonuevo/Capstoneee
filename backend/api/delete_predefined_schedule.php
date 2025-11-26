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

    // Try identifier first
    $idKeys = ['schedule_template_id', 'template_id', 'id', 'schedule_id', 'predefined_id'];
    $id = 0;
    foreach ($idKeys as $k) {
        if (isset($input[$k]) && $input[$k] !== '') {
            $id = intval($input[$k]);
            break;
        }
    }

    if ($id > 0) {
        // Get before payload for history logging
        $beforePayload = null;
        if ($actorUserId) {
            $beforePayload = get_schedule_before_payload($db, $id);
        }
        
        // Update with deleted_by and deleted_at
        $sql = 'UPDATE predefined_schedules SET is_active = 0, deleted_by = ?, deleted_at = NOW(), updated_at = NOW() WHERE schedule_template_id = ? LIMIT 1';
        $stmt = $db->prepare($sql);
        $stmt->execute([$actorUserId, $id]);
        
        if ($stmt->rowCount() < 1) {
            echo json_encode(['success' => false, 'message' => 'No schedule found for given id']);
            exit();
        }
        
        // Log history if user is authenticated
        if ($actorUserId && $beforePayload) {
            log_schedule_history(
                $db,
                $id,
                'delete',
                $actorUserId,
                $beforePayload,
                null, // No after payload for delete
                'Schedule deleted'
            );
        }
        
        echo json_encode(['success' => true, 'message' => 'Schedule deleted']);
        exit();
    }

    // Fallback: match by natural keys (barangay + schedule_type + day_of_week + start_time + optional cluster/week)
    $required = ['barangay_id', 'schedule_type'];
    foreach ($required as $r) {
        if (!isset($input[$r]) || $input[$r] === '') {
            throw new Exception('Missing field: ' . $r);
        }
    }

    $barangayId = $input['barangay_id'];
    $scheduleType = $input['schedule_type'];
    $dayOfWeek = isset($input['day_of_week']) ? $input['day_of_week'] : (isset($input['match_day_of_week']) ? $input['match_day_of_week'] : null);
    $startTime = isset($input['start_time']) ? $input['start_time'] : (isset($input['match_start_time']) ? $input['match_start_time'] : null);

    if ($dayOfWeek === null || $startTime === null) {
        throw new Exception('Missing day_of_week or start_time to identify schedule');
    }

    $clusterId = isset($input['cluster_id']) ? $input['cluster_id'] : null;
    $weekOfMonthFilter = isset($input['week_of_month']) ? intval($input['week_of_month']) : null;

    $where = 'WHERE barangay_id = ? AND schedule_type = ? AND day_of_week = ? AND TIME(start_time) = TIME(?)';
    $params = [$barangayId, $scheduleType, $dayOfWeek, $startTime];

    if ($clusterId !== null && $clusterId !== '') {
        $where .= ' AND cluster_id = ?';
        $params[] = $clusterId;
    }
    if ($weekOfMonthFilter !== null) {
        $where .= ' AND (week_of_month = ? OR week_of_month IS NULL)';
        $params[] = $weekOfMonthFilter;
    }

    // Get schedule_template_id and before payload for history logging
    $scheduleTemplateId = null;
    $beforePayload = null;
    if ($actorUserId) {
        $findQuery = $db->prepare("SELECT schedule_template_id FROM predefined_schedules $where LIMIT 1");
        $findQuery->execute($params);
        $found = $findQuery->fetch(PDO::FETCH_ASSOC);
        if ($found) {
            $scheduleTemplateId = (int)$found['schedule_template_id'];
            $beforePayload = get_schedule_before_payload($db, $scheduleTemplateId);
        }
    }

    $sql = 'UPDATE predefined_schedules SET is_active = 0, deleted_by = ?, deleted_at = NOW(), updated_at = NOW() ' . $where . ' LIMIT 1';
    $stmt = $db->prepare($sql);
    $stmt->execute(array_merge([$actorUserId], $params));

    if ($stmt->rowCount() < 1) {
        echo json_encode(['success' => false, 'message' => 'No matching schedule found to delete']);
        exit();
    }

    // Log history if user is authenticated and we found the schedule
    if ($actorUserId && $scheduleTemplateId && $beforePayload) {
        log_schedule_history(
            $db,
            $scheduleTemplateId,
            'delete',
            $actorUserId,
            $beforePayload,
            null, // No after payload for delete
            'Schedule deleted by fields'
        );
    }

    echo json_encode(['success' => true, 'message' => 'Schedule deleted by fields']);
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>



