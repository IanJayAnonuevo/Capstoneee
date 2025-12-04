<?php
/**
 * Delete Attendance Records by Date
 * This API allows deletion of attendance records for a specific date
 * 
 * Usage:
 * - Delete specific date: ?date=2025-12-05&password=reset123
 * - Delete today: ?password=reset123 (date defaults to today)
 * - Delete specific session: ?date=2025-12-05&session=AM&password=reset123
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

date_default_timezone_set('Asia/Manila');

require_once __DIR__ . '/../config/database.php';

// Simple authentication - only allow if password is provided
$password = $_GET['password'] ?? $_POST['password'] ?? '';
if ($password !== 'reset123') {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Use: ?password=reset123'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    // Get parameters
    $date = $_GET['date'] ?? $_POST['date'] ?? date('Y-m-d');
    $session = $_GET['session'] ?? $_POST['session'] ?? null;
    
    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        throw new Exception('Invalid date format. Use YYYY-MM-DD');
    }
    
    // Build query based on parameters
    if ($session) {
        // Validate session
        if (!in_array(strtoupper($session), ['AM', 'PM'])) {
            throw new Exception('Invalid session. Use AM or PM');
        }
        
        // First, show what will be deleted
        $stmt = $db->prepare("
            SELECT 
                a.attendance_id,
                a.user_id,
                COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name,
                u.role,
                a.session,
                a.verification_status,
                a.time_in,
                a.created_at
            FROM attendance a
            JOIN user u ON a.user_id = u.user_id
            LEFT JOIN user_profile up ON u.user_id = up.user_id
            WHERE a.attendance_date = ? AND a.session = ?
            ORDER BY a.session, a.created_at
        ");
        $stmt->execute([$date, strtoupper($session)]);
        $recordsToDelete = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Delete attendance records for specific date and session
        $stmt = $db->prepare("DELETE FROM attendance WHERE attendance_date = ? AND session = ?");
        $stmt->execute([$date, strtoupper($session)]);
        $deletedCount = $stmt->rowCount();
        
        $message = "Deleted $deletedCount attendance records for $date ($session session)";
    } else {
        // First, show what will be deleted
        $stmt = $db->prepare("
            SELECT 
                a.attendance_id,
                a.user_id,
                COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name,
                u.role,
                a.session,
                a.verification_status,
                a.time_in,
                a.created_at
            FROM attendance a
            JOIN user u ON a.user_id = u.user_id
            LEFT JOIN user_profile up ON u.user_id = up.user_id
            WHERE a.attendance_date = ?
            ORDER BY a.session, a.created_at
        ");
        $stmt->execute([$date]);
        $recordsToDelete = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Delete all attendance records for the date
        $stmt = $db->prepare("DELETE FROM attendance WHERE attendance_date = ?");
        $stmt->execute([$date]);
        $deletedCount = $stmt->rowCount();
        
        $message = "Deleted $deletedCount attendance records for $date (all sessions)";
    }
    
    echo json_encode([
        'success' => true,
        'message' => $message,
        'date' => $date,
        'session' => $session ?? 'all',
        'current_time' => date('Y-m-d H:i:s'),
        'deleted_count' => $deletedCount,
        'deleted_records' => $recordsToDelete
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
