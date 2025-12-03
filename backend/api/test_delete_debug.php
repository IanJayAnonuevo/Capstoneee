<?php
// Test script to debug delete_account.php errors
// This bypasses RBAC to see the actual database error

require_once '../config/Database.php';

// Set timezone
date_default_timezone_set('Asia/Manila');

$database = new Database();
$db = $database->connect();

// Test user ID - change this to an actual test user ID
$test_user_id = 999; // Use a non-existent user first to test

echo "=== DELETE ACCOUNT DEBUG TEST ===\n\n";
echo "Testing with user_id: $test_user_id\n\n";

try {
    $db->beginTransaction();
    
    echo "Step 1: Delete collection_team_member... ";
    $stmt = $db->prepare("DELETE FROM collection_team_member WHERE collector_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 2: Delete collection_team... ";
    $stmt = $db->prepare("DELETE FROM collection_team WHERE driver_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 3: Delete collection_schedule... ";
    $stmt = $db->prepare("DELETE FROM collection_schedule WHERE created_by = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 4: Delete collection... ";
    $stmt = $db->prepare("DELETE FROM collection WHERE collector_id = :user_id OR driver_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 5: Delete iec_view... ";
    $stmt = $db->prepare("DELETE FROM iec_view WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 6: Delete waste_log... ";
    $stmt = $db->prepare("DELETE FROM waste_log WHERE collector_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 7: Delete attendance... ";
    $stmt = $db->prepare("DELETE FROM attendance WHERE user_id = :user_id OR recorded_by = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 8: Delete attendance_request... ";
    $stmt = $db->prepare("DELETE FROM attendance_request WHERE user_id = :user_id OR foreman_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 9: Delete notification... ";
    $stmt = $db->prepare("DELETE FROM notification WHERE recipient_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 10: Delete gps_route_log... ";
    $stmt = $db->prepare("DELETE FROM gps_route_log WHERE driver_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 11: Delete task_events... ";
    $checkTable = $db->query("SHOW TABLES LIKE 'task_assignment'");
    if ($checkTable->rowCount() > 0) {
        $stmt = $db->prepare("DELETE FROM task_events WHERE assignment_id IN (SELECT id FROM task_assignment WHERE driver_id = :user_id OR collector_id = :user_id)");
        $stmt->bindParam(':user_id', $test_user_id);
        $stmt->execute();
        echo "OK (" . $stmt->rowCount() . " rows)\n";
    } else {
        echo "SKIPPED (table doesn't exist)\n";
    }
    
    echo "Step 12: Delete issue_reports... ";
    $stmt = $db->prepare("DELETE FROM issue_reports WHERE reporter_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 13: Delete pickup_requests... ";
    $stmt = $db->prepare("DELETE FROM pickup_requests WHERE requester_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 14: Delete feedback... ";
    $stmt = $db->prepare("DELETE FROM feedback WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 15: Delete admin... ";
    $stmt = $db->prepare("DELETE FROM admin WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 16: Delete barangay_head... ";
    $stmt = $db->prepare("DELETE FROM barangay_head WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 17: Delete user_profile... ";
    $stmt = $db->prepare("DELETE FROM user_profile WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    echo "Step 18: Delete user... ";
    $stmt = $db->prepare("DELETE FROM user WHERE user_id = :user_id");
    $stmt->bindParam(':user_id', $test_user_id);
    $stmt->execute();
    echo "OK (" . $stmt->rowCount() . " rows)\n";
    
    $db->rollBack(); // Rollback for testing - remove this to actually delete
    echo "\n=== TEST COMPLETED SUCCESSFULLY ===\n";
    echo "Transaction rolled back (no actual deletion)\n";
    
} catch (PDOException $e) {
    $db->rollBack();
    echo "\n\n=== ERROR OCCURRED ===\n";
    echo "Error Message: " . $e->getMessage() . "\n";
    echo "Error Code: " . $e->getCode() . "\n";
    echo "SQL State: " . $e->errorInfo[0] . "\n";
    echo "\nThis is the error that's causing the 500 Internal Server Error!\n";
}
?>
