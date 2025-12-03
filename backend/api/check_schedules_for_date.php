<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

$date = $_GET['date'] ?? date('Y-m-d');

try {
    $database = new Database();
    $db = $database->connect();
    
    // Get day of week and week of month
    $dayOfWeekNum = date('w', strtotime($date));
    $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    $dayOfWeek = $dayNames[$dayOfWeekNum];
    $weekOfMonth = ceil(date('j', strtotime($date)) / 7);
    
    // Get predefined schedules for this day
    $stmt = $db->prepare("
        SELECT 
            ps.*,
            b.barangay_name,
            CASE 
                WHEN ps.start_time >= '12:00:00' THEN 'PM'
                ELSE 'AM'
            END as inferred_session
        FROM predefined_schedules ps
        JOIN barangay b ON ps.barangay_id = b.barangay_id
        WHERE ps.day_of_week = :day
        AND ps.is_active = 1
        AND (ps.week_of_month = :week OR ps.week_of_month IS NULL OR ps.schedule_type != 'weekly_cluster')
        ORDER BY ps.start_time, b.barangay_name
    ");
    
    $stmt->execute([
        ':day' => $dayOfWeek,
        ':week' => $weekOfMonth
    ]);
    
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group by session
    $am_schedules = array_filter($schedules, function($s) {
        $session = !empty($s['session']) ? strtoupper($s['session']) : ($s['start_time'] >= '12:00:00' ? 'PM' : 'AM');
        return $session === 'AM';
    });
    
    $pm_schedules = array_filter($schedules, function($s) {
        $session = !empty($s['session']) ? strtoupper($s['session']) : ($s['start_time'] >= '12:00:00' ? 'PM' : 'AM');
        return $session === 'PM';
    });
    
    echo json_encode([
        'success' => true,
        'date' => $date,
        'day_of_week' => $dayOfWeek,
        'week_of_month' => $weekOfMonth,
        'total_schedules' => count($schedules),
        'am_count' => count($am_schedules),
        'pm_count' => count($pm_schedules),
        'am_schedules' => array_values($am_schedules),
        'pm_schedules' => array_values($pm_schedules),
        'all_schedules' => $schedules
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
