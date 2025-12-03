<?php
/**
 * Check when personnel were marked absent today
 * Shows detailed timing information for debugging
 */

header('Content-Type: application/json');
date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/backend/config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    $today = date('Y-m-d');
    $currentTime = date('Y-m-d H:i:s');
    
    // Get all attendance records for today
    $stmt = $db->prepare("
        SELECT 
            a.attendance_id,
            a.user_id,
            COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name,
            u.role_id,
            a.attendance_date,
            a.session,
            a.time_in,
            a.time_out,
            a.verification_status,
            a.created_at,
            a.updated_at
        FROM attendance a
        JOIN user u ON a.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE a.attendance_date = ?
        ORDER BY a.session, a.verification_status, a.created_at
    ");
    $stmt->execute([$today]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Group by session and status
    $summary = [
        'AM' => ['verified' => 0, 'absent' => 0, 'pending' => 0, 'on_leave' => 0],
        'PM' => ['verified' => 0, 'absent' => 0, 'pending' => 0, 'on_leave' => 0]
    ];
    
    $absentRecords = [];
    
    foreach ($records as $record) {
        $session = $record['session'];
        $status = $record['verification_status'] ?? 'pending';
        
        if (isset($summary[$session][$status])) {
            $summary[$session][$status]++;
        }
        
        // Track absent records with timing
        if ($status === 'absent') {
            $absentRecords[] = [
                'name' => $record['full_name'],
                'role' => $record['role_id'] == 3 ? 'Driver' : 'Collector',
                'session' => $session,
                'marked_at' => $record['created_at'],
                'updated_at' => $record['updated_at']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'today' => $today,
        'current_time' => $currentTime,
        'total_records' => count($records),
        'summary' => $summary,
        'absent_details' => $absentRecords,
        'all_records' => $records
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
