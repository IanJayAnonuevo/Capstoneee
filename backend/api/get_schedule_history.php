<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Get optional filters from query string
    $scheduleTemplateId = isset($_GET['schedule_template_id']) ? intval($_GET['schedule_template_id']) : null;
    $action = isset($_GET['action']) ? $_GET['action'] : null; // create, update, delete, restore
    $actorUserId = isset($_GET['actor_user_id']) ? intval($_GET['actor_user_id']) : null;
    
    // Validate and sanitize limit and offset (LIMIT/OFFSET cannot be prepared statement parameters)
    $limit = isset($_GET['limit']) ? max(1, min(1000, intval($_GET['limit']))) : 100; // Default limit, max 1000
    $offset = isset($_GET['offset']) ? max(0, intval($_GET['offset'])) : 0; // Default offset, min 0
    
    // Build query
    $sql = "
        SELECT 
            h.history_id,
            h.schedule_template_id,
            h.action,
            h.actor_user_id,
            h.actor_role,
            h.changed_at,
            h.before_payload,
            h.after_payload,
            h.remarks,
            u.username AS actor_username,
            CONCAT(COALESCE(up.firstname, ''), ' ', COALESCE(up.lastname, '')) AS actor_name,
            ps.barangay_name,
            ps.barangay_id,
            ps.schedule_type,
            ps.day_of_week,
            ps.start_time,
            ps.end_time
        FROM predefined_schedule_history h
        INNER JOIN user u ON h.actor_user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN predefined_schedules ps ON h.schedule_template_id = ps.schedule_template_id
        WHERE 1=1
    ";
    
    $params = [];
    
    if ($scheduleTemplateId !== null && $scheduleTemplateId > 0) {
        $sql .= " AND h.schedule_template_id = ?";
        $params[] = $scheduleTemplateId;
    }
    
    if ($action !== null && in_array($action, ['create', 'update', 'delete', 'restore'])) {
        $sql .= " AND h.action = ?";
        $params[] = $action;
    }
    
    if ($actorUserId !== null && $actorUserId > 0) {
        $sql .= " AND h.actor_user_id = ?";
        $params[] = $actorUserId;
    }
    
    // LIMIT and OFFSET cannot be used as prepared statement parameters in MariaDB/MySQL
    // They must be directly inserted into the SQL string as integers (already validated above)
    $sql .= " ORDER BY h.changed_at DESC LIMIT {$limit} OFFSET {$offset}";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get total count for pagination
    $countSql = "
        SELECT COUNT(*) as total
        FROM predefined_schedule_history h
        WHERE 1=1
    ";
    $countParams = [];
    
    if ($scheduleTemplateId !== null && $scheduleTemplateId > 0) {
        $countSql .= " AND h.schedule_template_id = ?";
        $countParams[] = $scheduleTemplateId;
    }
    
    if ($action !== null && in_array($action, ['create', 'update', 'delete', 'restore'])) {
        $countSql .= " AND h.action = ?";
        $countParams[] = $action;
    }
    
    if ($actorUserId !== null && $actorUserId > 0) {
        $countSql .= " AND h.actor_user_id = ?";
        $countParams[] = $actorUserId;
    }
    
    $countStmt = $db->prepare($countSql);
    $countStmt->execute($countParams);
    $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
    
    // Process history records
    $processedHistory = [];
    foreach ($history as $record) {
        $processedHistory[] = [
            'history_id' => (int)$record['history_id'],
            'schedule_template_id' => (int)$record['schedule_template_id'],
            'action' => $record['action'],
            'actor' => [
                'user_id' => (int)$record['actor_user_id'],
                'username' => $record['actor_username'],
                'name' => trim($record['actor_name']) ?: $record['actor_username'],
                'role' => $record['actor_role']
            ],
            'changed_at' => $record['changed_at'],
            'before_payload' => $record['before_payload'] ? json_decode($record['before_payload'], true) : null,
            'after_payload' => $record['after_payload'] ? json_decode($record['after_payload'], true) : null,
            'remarks' => $record['remarks'],
            'schedule_info' => [
                'barangay_id' => $record['barangay_id'],
                'barangay_name' => $record['barangay_name'],
                'schedule_type' => $record['schedule_type'],
                'day_of_week' => $record['day_of_week'],
                'start_time' => $record['start_time'],
                'end_time' => $record['end_time']
            ]
        ];
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Schedule history retrieved successfully',
        'history' => $processedHistory,
        'total' => (int)$total,
        'limit' => $limit,
        'offset' => $offset
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>

