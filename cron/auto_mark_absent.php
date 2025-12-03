<?php
/**
 * Auto Mark Absent - Cron Job
 * Automatically marks personnel as absent if they didn't time in within the allowed window
 * 
 * AM Session: Must time in between 5:00 AM - 6:00 AM
 * PM Session: Must time in between 1:00 PM - 2:00 PM
 * 
 * Run this at:
 * - 6:05 AM (for AM session)
 * - 2:05 PM (for PM session)
 */

// Set CORS headers for HTTP access
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');

// This is a cron script - no authentication required
// It should only be accessible via cron jobs or direct server access

require_once __DIR__ . '/../backend/config/database.php';

// Set timezone
date_default_timezone_set('Asia/Manila');

$today = date('Y-m-d');
$currentTime = date('H:i:s');
$currentHour = (int)date('H');

// Check for test mode (allows testing outside scheduled hours)
$testMode = isset($_GET['test']) && $_GET['test'] === 'true';
$forceSession = isset($_GET['session']) ? strtoupper($_GET['session']) : null;

// Determine which session to process
if ($testMode && $forceSession) {
    // Test mode: use forced session
    $session = $forceSession;
    if ($session === 'AM') {
        $cutoffTime = '06:00:00';
        $windowStart = '05:00:00';
    } else {
        $cutoffTime = '14:00:00';
        $windowStart = '13:00:00';
    }
} elseif ($currentHour == 6 && (int)date('i') >= 0 && (int)date('i') <= 10) {
    // AM Session: Only run between 6:00 AM - 6:10 AM
    $session = 'AM';
    $cutoffTime = '06:00:00';
    $windowStart = '05:00:00';
} elseif ($currentHour == 14 && (int)date('i') >= 0 && (int)date('i') <= 10) {
    // PM Session: Only run between 2:00 PM - 2:10 PM
    $session = 'PM';
    $cutoffTime = '14:00:00';
    $windowStart = '13:00:00';
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Not the right time to run this script. Run between 6:00-6:10 AM or 2:00-2:10 PM. Current time: ' . date('H:i:s') . '. Or use test mode: ?test=true&session=AM'
    ]);
    exit;
}

try {
    $database = new Database();
    $db = $database->connect();
    
    $db->beginTransaction();
    
    // Get all drivers and collectors (role_id 3 and 4)
    $stmt = $db->prepare("
        SELECT u.user_id, u.username, COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name, u.role_id
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.role_id IN (3, 4)
    ");
    $stmt->execute();
    $allPersonnel = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $markedAbsent = [];
    $alreadyPresent = [];
    $alreadyAbsent = [];
    
    foreach ($allPersonnel as $person) {
        // Check if they have attendance record for today's session
        $stmt = $db->prepare("
            SELECT attendance_id, time_in, verification_status
            FROM attendance
            WHERE user_id = ? AND attendance_date = ? AND session = ?
        ");
        $stmt->execute([$person['user_id'], $today, $session]);
        $attendance = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($attendance) {
            // They have a record - check if they timed in on time
            if ($attendance['verification_status'] === 'verified') {
                $alreadyPresent[] = [
                    'user_id' => $person['user_id'],
                    'name' => $person['full_name'],
                    'time_in' => $attendance['time_in']
                ];
            } elseif ($attendance['verification_status'] === 'pending' || is_null($attendance['verification_status']) || empty($attendance['verification_status'])) {
                // Update pending or NULL records to absent
                $stmt = $db->prepare("
                    UPDATE attendance 
                    SET verification_status = 'absent', 
                        time_in = NULL, 
                        time_out = NULL,
                        updated_at = NOW()
                    WHERE attendance_id = ?
                ");
                $stmt->execute([$attendance['attendance_id']]);
                
                $markedAbsent[] = [
                    'user_id' => $person['user_id'],
                    'name' => $person['full_name'],
                    'role' => $person['role_id'] == 3 ? 'Driver' : 'Collector'
                ];
            } else {
                // Already absent or other status
                $alreadyAbsent[] = [
                    'user_id' => $person['user_id'],
                    'name' => $person['full_name'],
                    'status' => $attendance['verification_status']
                ];
            }
        } else {
            // No record - mark as absent
            $stmt = $db->prepare("
                INSERT INTO attendance (
                    user_id, 
                    attendance_date, 
                    session, 
                    time_in, 
                    time_out, 
                    verification_status,
                    created_at
                ) VALUES (?, ?, ?, NULL, NULL, 'absent', NOW())
            ");
            $stmt->execute([$person['user_id'], $today, $session]);
            
            $markedAbsent[] = [
                'user_id' => $person['user_id'],
                'name' => $person['full_name'],
                'role' => $person['role_id'] == 3 ? 'Driver' : 'Collector'
            ];
            
            // Send notification to the person
            $notifPayload = [
                'type' => 'marked_absent',
                'date' => $today,
                'session' => $session,
                'reason' => "Did not time in between $windowStart and $cutoffTime",
                'message' => "You have been marked as absent for $today ($session session) because you did not time in within the allowed window ($windowStart - $cutoffTime)."
            ];
            
            $stmtNotif = $db->prepare("
                INSERT INTO notification (recipient_id, message, created_at, response_status) 
                VALUES (?, ?, NOW(), 'unread')
            ");
            $stmtNotif->execute([$person['user_id'], json_encode($notifPayload)]);
        }
    }
    
    // Send summary notification to admin
    if (!empty($markedAbsent)) {
        $adminPayload = [
            'type' => 'auto_absent_summary',
            'date' => $today,
            'session' => $session,
            'total_marked_absent' => count($markedAbsent),
            'personnel' => $markedAbsent,
            'message' => count($markedAbsent) . " personnel automatically marked as absent for $today ($session session) due to late/no time-in."
        ];
        
        $stmtAdminNotif = $db->prepare("
            INSERT INTO notification (recipient_id, message, created_at, response_status) 
            SELECT u.user_id, ?, NOW(), 'unread'
            FROM user u
            WHERE u.role_id = 1
        ");
        $stmtAdminNotif->execute([json_encode($adminPayload)]);
    }
    
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Auto-absent marking completed',
        'session' => $session,
        'date' => $today,
        'cutoff_time' => $cutoffTime,
        'marked_absent' => $markedAbsent,
        'total_marked_absent' => count($markedAbsent),
        'already_present' => count($alreadyPresent),
        'already_absent' => count($alreadyAbsent),
        'notifications_sent' => count($markedAbsent) > 0
    ]);
    
} catch (Exception $e) {
    if ($db && $db->inTransaction()) {
        $db->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
