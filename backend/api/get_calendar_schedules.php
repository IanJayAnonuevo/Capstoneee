<?php
require_once __DIR__ . '/_bootstrap.php';
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Optional filters from query string
    $scheduleType = isset($_GET['schedule_type']) ? $_GET['schedule_type'] : null;
    $clusterId = isset($_GET['cluster_id']) ? $_GET['cluster_id'] : null;
    $startDate = isset($_GET['start_date']) ? $_GET['start_date'] : null;
    $endDate = isset($_GET['end_date']) ? $_GET['end_date'] : null;
    
    $allSchedules = [];
    
    // 1. Get predefined recurring schedules
    $sql = "
        SELECT 
            ps.schedule_template_id,
            ps.barangay_id,
            ps.barangay_name,
            ps.cluster_id,
            ps.schedule_type,
            ps.day_of_week,
            ps.start_time,
            ps.end_time,
            ps.frequency_per_day,
            ps.week_of_month,
            ps.is_active,
            ps.created_at,
            ps.updated_at,
            b.barangay_name as actual_barangay_name,
            c.cluster_name,
            'predefined' as source_type,
            NULL as special_pickup_id,
            NULL as scheduled_date,
            NULL as pickup_status
        FROM predefined_schedules ps
        LEFT JOIN barangay b ON ps.barangay_id = b.barangay_id
        LEFT JOIN cluster c ON ps.cluster_id = c.cluster_id
        WHERE ps.is_active = 1
    ";
    
    $where = [];
    $params = [];
    
    if ($scheduleType) {
        $types = array_map('trim', explode(',', $scheduleType));
        if (count($types) > 1) {
            $placeholders = implode(',', array_fill(0, count($types), '?'));
            $where[] = "ps.schedule_type IN ($placeholders)";
            foreach ($types as $type) {
                $params[] = $type;
            }
        } else {
            $where[] = 'ps.schedule_type = ?';
            $params[] = $scheduleType;
        }
    }
    
    if ($clusterId) { 
        $where[] = 'ps.cluster_id = ?'; 
        $params[] = $clusterId; 
    }
    
    if (!empty($where)) {
        $sql .= ' AND ' . implode(' AND ', $where);
    }
    
    $sql .= ' ORDER BY ps.cluster_id, ps.day_of_week, ps.start_time';
    
    $stmt = $db->prepare($sql);
    if (!$stmt) {
        throw new Exception('Failed to prepare predefined schedules query: ' . implode(', ', $db->errorInfo()));
    }
    $stmt->execute($params);
    $predefinedSchedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Optional filter for showing completed tasks (for history view)
    $showCompleted = isset($_GET['show_completed']) && $_GET['show_completed'] === 'true';
    
    // 2. Get one-time special pickup schedules
    $specialSql = "
        SELECT 
            cs.schedule_id as schedule_template_id,
            cs.barangay_id,
            b.barangay_name,
            NULL as cluster_id,
            'special_pickup' as schedule_type,
            DAYNAME(cs.scheduled_date) as day_of_week,
            cs.start_time,
            NULL as end_time,
            1 as frequency_per_day,
            NULL as week_of_month,
            1 as is_active,
            NOW() as created_at,
            NOW() as updated_at,
            b.barangay_name as actual_barangay_name,
            NULL as cluster_name,
            'special_pickup' as source_type,
            cs.special_pickup_id,
            cs.scheduled_date,
            pr.status as pickup_status
        FROM collection_schedule cs
        LEFT JOIN barangay b ON cs.barangay_id = b.barangay_id
        LEFT JOIN pickup_requests pr ON cs.special_pickup_id = pr.id
        WHERE cs.schedule_type = 'special_pickup'
        AND cs.special_pickup_id IS NOT NULL
    ";
    
    // Filter by status based on view type
    if ($showCompleted) {
        // For history view: show only completed
        $specialSql .= " AND pr.status = 'completed'";
    } else {
        // For active calendar: hide completed
        $specialSql .= " AND pr.status NOT IN ('completed', 'cancelled')";
    }
    
    $specialParams = [];
    
    if ($startDate && $endDate) {
        $specialSql .= " AND cs.scheduled_date BETWEEN ? AND ?";
        $specialParams[] = $startDate;
        $specialParams[] = $endDate;
    }
    
    $specialSql .= " ORDER BY cs.scheduled_date, cs.start_time";
    
    $specialStmt = $db->prepare($specialSql);
    if (!$specialStmt) {
        throw new Exception('Failed to prepare special pickup query: ' . implode(', ', $db->errorInfo()));
    }
    $specialStmt->execute($specialParams);
    $specialSchedules = $specialStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Merge both types of schedules
    $allSchedules = array_merge($predefinedSchedules, $specialSchedules);
    
    // Process schedules to ensure consistent data format
    $processedSchedules = [];
    foreach ($allSchedules as $schedule) {
        $processedSchedules[] = [
            'schedule_template_id' => isset($schedule['schedule_template_id']) ? $schedule['schedule_template_id'] : null,
            'barangay_id' => $schedule['barangay_id'],
            'barangay_name' => $schedule['actual_barangay_name'] ?: $schedule['barangay_name'],
            'cluster_id' => $schedule['cluster_id'],
            'cluster_name' => $schedule['cluster_name'],
            'schedule_type' => $schedule['schedule_type'],
            'day_of_week' => $schedule['day_of_week'],
            'start_time' => $schedule['start_time'],
            'end_time' => $schedule['end_time'],
            'frequency_per_day' => $schedule['frequency_per_day'],
            'week_of_month' => $schedule['week_of_month'],
            'is_active' => $schedule['is_active'],
            'created_at' => $schedule['created_at'],
            'updated_at' => $schedule['updated_at'],
            'source_type' => $schedule['source_type'],
            'special_pickup_id' => $schedule['special_pickup_id'] ?? null,
            'scheduled_date' => $schedule['scheduled_date'] ?? null,
            'pickup_status' => $schedule['pickup_status'] ?? null
        ];
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Schedules retrieved successfully',
        'schedules' => $processedSchedules,
        'total_count' => count($processedSchedules),
        'predefined_count' => count($predefinedSchedules),
        'special_pickup_count' => count($specialSchedules)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage(),
        'schedules' => []
    ]);
}
?>
