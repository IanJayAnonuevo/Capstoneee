<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: text/html; charset=utf-8');
require_once '../config/database.php';

echo "<!DOCTYPE html><html><head><title>Check Special Pickup Data</title>";
echo "<style>body{font-family:monospace;padding:20px;background:#1a1a1a;color:#0f0;}";
echo ".success{color:#0f0;} .error{color:#f00;} .info{color:#ff0;} table{border-collapse:collapse;margin:10px 0;} th,td{border:1px solid #0f0;padding:8px;text-align:left;}</style></head><body>";
echo "<h2>Special Pickup Data Check</h2>";

try {
    $database = new Database();
    $db = $database->connect();
    
    // 1. Check latest schedules
    echo "<h3>1. Latest Collection Schedules (Last 5)</h3>";
    $schedQuery = $db->prepare("
        SELECT cs.*, pr.barangay, pr.status as request_status
        FROM collection_schedule cs
        LEFT JOIN pickup_requests pr ON cs.special_pickup_id = pr.id
        ORDER BY cs.schedule_id DESC
        LIMIT 5
    ");
    $schedQuery->execute();
    $schedules = $schedQuery->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($schedules) > 0) {
        echo "<table><tr><th>ID</th><th>Barangay</th><th>Date</th><th>Time</th><th>Type</th><th>Session</th><th>Special Pickup ID</th><th>Request Status</th></tr>";
        foreach ($schedules as $s) {
            echo "<tr>";
            echo "<td>" . $s['schedule_id'] . "</td>";
            echo "<td>" . ($s['barangay'] ?? 'N/A') . "</td>";
            echo "<td>" . ($s['scheduled_date'] ?? 'N/A') . "</td>";
            echo "<td>" . ($s['start_time'] ?? 'N/A') . "</td>";
            echo "<td>" . ($s['schedule_type'] ?? 'N/A') . "</td>";
            echo "<td>" . ($s['session'] ?? 'N/A') . "</td>";
            echo "<td>" . ($s['special_pickup_id'] ?? 'NULL') . "</td>";
            echo "<td>" . ($s['request_status'] ?? 'N/A') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='error'>No schedules found</p>";
    }
    
    // 2. Check latest teams
    echo "<h3>2. Latest Collection Teams (Last 5)</h3>";
    $teamQuery = $db->prepare("
        SELECT ct.*, cs.special_pickup_id
        FROM collection_team ct
        LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
        ORDER BY ct.team_id DESC
        LIMIT 5
    ");
    $teamQuery->execute();
    $teams = $teamQuery->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($teams) > 0) {
        echo "<table><tr><th>Team ID</th><th>Schedule ID</th><th>Truck ID</th><th>Driver ID</th><th>Status</th><th>Special Pickup ID</th></tr>";
        foreach ($teams as $t) {
            echo "<tr>";
            echo "<td>" . $t['team_id'] . "</td>";
            echo "<td>" . $t['schedule_id'] . "</td>";
            echo "<td>" . $t['truck_id'] . "</td>";
            echo "<td>" . $t['driver_id'] . "</td>";
            echo "<td>" . $t['status'] . "</td>";
            echo "<td>" . ($t['special_pickup_id'] ?? 'NULL') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='error'>No teams found</p>";
    }
    
    // 3. Check latest notifications
    echo "<h3>3. Latest Notifications (Last 10)</h3>";
    $notifQuery = $db->prepare("
        SELECT n.*, u.username, u.email, u.role_id
        FROM notification n
        LEFT JOIN user u ON n.recipient_id = u.user_id
        ORDER BY n.notification_id DESC
        LIMIT 10
    ");
    $notifQuery->execute();
    $notifs = $notifQuery->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($notifs) > 0) {
        echo "<table><tr><th>ID</th><th>Recipient</th><th>Message</th><th>Created</th><th>Status</th></tr>";
        foreach ($notifs as $n) {
            $recipient = ($n['username'] ?? 'Unknown') . ' (Role: ' . ($n['role_id'] ?? 'N/A') . ')';
            echo "<tr>";
            echo "<td>" . $n['notification_id'] . "</td>";
            echo "<td>" . $recipient . "</td>";
            echo "<td>" . htmlspecialchars(substr($n['message'] ?? 'N/A', 0, 80)) . "...</td>";
            echo "<td>" . ($n['created_at'] ?? 'N/A') . "</td>";
            echo "<td>" . ($n['response_status'] ?? 'N/A') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p class='error'>No notifications found</p>";
    }
    
    // 4. Check PHP error log for recent errors
    echo "<h3>4. Recent PHP Errors (if accessible)</h3>";
    $errorLogPath = 'C:/xampp/apache/logs/error.log';
    if (file_exists($errorLogPath)) {
        $lines = file($errorLogPath);
        $recentLines = array_slice($lines, -20);
        echo "<pre style='background:#000;padding:10px;overflow:auto;max-height:300px;'>";
        foreach ($recentLines as $line) {
            if (stripos($line, 'notification') !== false || stripos($line, 'special') !== false) {
                echo "<span class='error'>" . htmlspecialchars($line) . "</span>";
            } else {
                echo htmlspecialchars($line);
            }
        }
        echo "</pre>";
    } else {
        echo "<p class='info'>Error log not accessible at: $errorLogPath</p>";
    }
    
} catch (Exception $e) {
    echo "<p class='error'>ERROR: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre class='error'>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "</body></html>";
?>
