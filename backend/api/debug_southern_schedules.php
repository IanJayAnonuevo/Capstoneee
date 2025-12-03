<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Check schedules for specific barangays
    $barangays = ['Anib', 'San Vicente', 'Malaguico', 'North Centro', 'South Centro'];
    
    $results = [];
    
    foreach ($barangays as $barangay) {
        $stmt = $db->prepare("
            SELECT 
                ps.id,
                b.barangay_name,
                ps.day_of_week,
                ps.week_of_month,
                ps.schedule_type,
                ps.cluster_id,
                ps.start_time,
                ps.end_time,
                ps.session,
                ps.is_active,
                CASE 
                    WHEN ps.start_time >= '12:00:00' THEN 'PM'
                    ELSE 'AM'
                END as inferred_session
            FROM predefined_schedules ps
            JOIN barangay b ON ps.barangay_id = b.barangay_id
            WHERE b.barangay_name = :barangay
            ORDER BY ps.day_of_week, ps.start_time
        ");
        
        $stmt->execute([':barangay' => $barangay]);
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $results[$barangay] = $schedules;
    }
    
    // Also get all Sunday schedules
    $stmt = $db->prepare("
        SELECT 
            ps.id,
            b.barangay_name,
            ps.day_of_week,
            ps.week_of_month,
            ps.schedule_type,
            ps.cluster_id,
            ps.start_time,
            ps.end_time,
            ps.session,
            ps.is_active,
            CASE 
                WHEN ps.week_of_month IS NULL THEN 'Every Sunday'
                WHEN ps.week_of_month = 5 THEN 'Week 5 only (Nov 30 matches!)'
                ELSE CONCAT('Week ', ps.week_of_month, ' only')
            END as week_description
        FROM predefined_schedules ps
        JOIN barangay b ON ps.barangay_id = b.barangay_id
        WHERE ps.day_of_week = 'Sunday'
        AND ps.is_active = 1
        ORDER BY ps.start_time, b.barangay_name
    ");
    
    $stmt->execute();
    $sunday_schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'note' => 'November 30, 2025 is a Sunday (Week 5 of the month)',
        'barangay_schedules' => $results,
        'all_sunday_schedules' => $sunday_schedules,
        'sunday_count' => count($sunday_schedules)
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
