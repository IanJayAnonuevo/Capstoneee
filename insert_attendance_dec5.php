<?php
/**
 * Insert Sample Attendance for December 5, 2025
 * Run this script via: php insert_attendance_dec5.php
 */

require_once __DIR__ . '/backend/config/database.php';

$db = new Database();
$conn = $db->connect();

if (!$conn) {
    die("Database connection failed!\n");
}

echo "=== Inserting Attendance for December 5, 2025 ===\n\n";

// Get available personnel
$stmt = $conn->query("SELECT user_id, username, user_role FROM user WHERE user_role IN ('driver', 'collector') LIMIT 10");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Available Personnel:\n";
foreach ($users as $user) {
    echo "- ID: {$user['user_id']}, Username: {$user['username']}, Role: {$user['user_role']}\n";
}

if (empty($users)) {
    die("\nNo drivers or collectors found in database!\n");
}

echo "\n=== Inserting Attendance Records ===\n";

// Sample attendance data
$attendanceRecords = [
    [
        'user_id' => $users[0]['user_id'] ?? 1,
        'attendance_date' => '2025-12-05',
        'session' => 'AM',
        'time_in' => '2025-12-05 05:30:00',
        'time_out' => '2025-12-05 12:00:00',
        'status' => 'present',
        'verification_status' => 'verified'
    ],
];

// Add more records if there are more users
if (count($users) > 1) {
    $attendanceRecords[] = [
        'user_id' => $users[1]['user_id'],
        'attendance_date' => '2025-12-05',
        'session' => 'PM',
        'time_in' => '2025-12-05 13:15:00',
        'time_out' => '2025-12-05 17:30:00',
        'status' => 'present',
        'verification_status' => 'verified'
    ];
}

if (count($users) > 2) {
    $attendanceRecords[] = [
        'user_id' => $users[2]['user_id'],
        'attendance_date' => '2025-12-05',
        'session' => 'AM',
        'time_in' => '2025-12-05 05:45:00',
        'time_out' => NULL, // Not yet timed out
        'status' => 'present',
        'verification_status' => 'verified'
    ];
}

// Insert records
$sql = "INSERT INTO attendance (user_id, attendance_date, session, time_in, time_out, status, verification_status, created_at)
        VALUES (:user_id, :attendance_date, :session, :time_in, :time_out, :status, :verification_status, NOW())
        ON DUPLICATE KEY UPDATE
            time_in = VALUES(time_in),
            time_out = VALUES(time_out),
            status = VALUES(status),
            verification_status = VALUES(verification_status)";

$stmt = $conn->prepare($sql);

foreach ($attendanceRecords as $record) {
    try {
        $stmt->execute($record);
        $timeOut = $record['time_out'] ? $record['time_out'] : 'Not yet';
        echo "✓ Inserted: User {$record['user_id']}, Session {$record['session']}, Time-in: {$record['time_in']}, Time-out: {$timeOut}\n";
    } catch (PDOException $e) {
        echo "✗ Error inserting record for user {$record['user_id']}: " . $e->getMessage() . "\n";
    }
}

// Verify inserted records
echo "\n=== Verifying Inserted Records ===\n";
$stmt = $conn->query("
    SELECT a.*, u.username 
    FROM attendance a
    JOIN user u ON a.user_id = u.user_id
    WHERE a.attendance_date = '2025-12-05'
    ORDER BY a.session, a.user_id
");

$records = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (empty($records)) {
    echo "No records found for December 5, 2025\n";
} else {
    echo "Found " . count($records) . " attendance record(s):\n";
    foreach ($records as $record) {
        echo sprintf(
            "- User: %s (ID: %d), Session: %s, Time-in: %s, Time-out: %s, Status: %s\n",
            $record['username'],
            $record['user_id'],
            $record['session'],
            $record['time_in'],
            $record['time_out'] ?? 'NULL',
            $record['status']
        );
    }
}

echo "\n✓ Done!\n";
?>
