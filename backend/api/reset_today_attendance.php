<?php
/**
 * Reset Today's Attendance - Public Diagnostic Endpoint
 * Deletes all attendance records for today
 * No authentication required (for testing only)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
date_default_timezone_set('Asia/Manila');

require_once '../config/database.php';

// Simple password protection
$password = $_GET['password'] ?? '';
if ($password !== 'reset123') {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Use: ?password=reset123'
    ], JSON_PRETTY_PRINT);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    $today = date('Y-m-d');
    
    // First, show what will be deleted
    $stmt = $db->prepare("
        SELECT 
            a.attendance_id,
            a.user_id,
            COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name,
            a.session,
            a.verification_status,
            a.created_at
        FROM attendance a
        JOIN user u ON a.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE a.attendance_date = ?
        ORDER BY a.session, a.created_at
    ");
    $stmt->execute([$today]);
    $recordsToDelete = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Delete all attendance records for today
    $stmt = $db->prepare("DELETE FROM attendance WHERE attendance_date = ?");
    $stmt->execute([$today]);
    $deletedCount = $stmt->rowCount();
    
    echo json_encode([
        'success' => true,
        'message' => "Deleted $deletedCount attendance records for $today",
        'today' => $today,
        'current_time' => date('Y-m-d H:i:s'),
        'deleted_count' => $deletedCount,
        'deleted_records' => $recordsToDelete
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
