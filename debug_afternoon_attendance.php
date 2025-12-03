<?php
require_once __DIR__ . '/backend/config/database.php';

date_default_timezone_set('Asia/Manila');

try {
    $db = (new Database())->connect();
    
    if (!$db) {
        die("Database connection failed\n");
    }
    
    $today = date('Y-m-d');
    $session = 'PM';
    
    echo "Checking attendance for: $today, Session: $session\n";
    echo str_repeat("=", 80) . "\n";
    
    // Check what the cron job query returns
    $stmt = $db->prepare("
        SELECT 
            a.attendance_id,
            a.user_id,
            a.time_in,
            a.verification_status,
            u.role_id,
            COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name
        FROM attendance a
        JOIN user u ON a.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE 
            a.attendance_date = :date
            AND a.session = :session
            AND a.verification_status = 'verified'
            AND u.role_id IN (3,4)
        ORDER BY a.time_in ASC, a.user_id ASC
    ");
    
    $stmt->execute([
        ':date' => $today,
        ':session' => $session
    ]);
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "Found " . count($results) . " verified personnel\n";
    echo str_repeat("=", 80) . "\n";
    
    if (count($results) > 0) {
        foreach ($results as $row) {
            printf(
                "ID: %d | User: %s | Role: %d | Time In: %s | Status: %s\n",
                $row['attendance_id'],
                $row['full_name'],
                $row['role_id'],
                $row['time_in'],
                $row['verification_status']
            );
        }
    } else {
        echo "No verified attendance found!\n\n";
        
        // Check if there are ANY attendance records for today
        $checkStmt = $db->prepare("
            SELECT 
                a.attendance_id,
                a.user_id,
                a.session,
                a.verification_status,
                a.status,
                u.role_id,
                COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name
            FROM attendance a
            JOIN user u ON a.user_id = u.user_id
            LEFT JOIN user_profile up ON u.user_id = up.user_id
            WHERE 
                a.attendance_date = :date
                AND u.role_id IN (3,4)
            ORDER BY a.session, a.user_id
        ");
        
        $checkStmt->execute([':date' => $today]);
        $allRecords = $checkStmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "All attendance records for today ($today):\n";
        echo str_repeat("-", 80) . "\n";
        
        if (count($allRecords) > 0) {
            foreach ($allRecords as $row) {
                printf(
                    "ID: %d | User: %s | Role: %d | Session: %s | Status: %s | Verification: %s\n",
                    $row['attendance_id'],
                    $row['full_name'],
                    $row['role_id'],
                    $row['session'],
                    $row['status'],
                    $row['verification_status']
                );
            }
        } else {
            echo "No attendance records found for today at all!\n";
        }
    }
    
    echo str_repeat("=", 80) . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
