<?php
// Debug AM task generation
require_once __DIR__ . '/backend/config/database.php';

$database = new Database();
$db = $database->connect();

date_default_timezone_set('Asia/Manila');
$today = date('Y-m-d');

echo "=== DEBUGGING AM TASK GENERATION ===\n\n";
echo "Current Date/Time: " . date('Y-m-d H:i:s') . "\n";
echo "Target Date: $today\n\n";

// 1. Check if there are predefined schedules for today
echo "1. Checking predefined schedules for $today...\n";
$stmt = $db->prepare("
    SELECT 
        cs.schedule_id,
        cs.scheduled_date,
        cs.start_time,
        cs.end_time,
        b.barangay_name
    FROM collection_schedule cs
    LEFT JOIN barangay b ON cs.barangay_id = b.barangay_id
    WHERE cs.scheduled_date = ?
    ORDER BY cs.start_time
");
$stmt->execute([$today]);
$schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Found " . count($schedules) . " schedules\n";
foreach ($schedules as $sched) {
    echo "  - {$sched['barangay_name']}: {$sched['start_time']}\n";
}
echo "\n";

// 2. Check if teams already exist
echo "2. Checking existing teams for $today...\n";
$stmt = $db->prepare("
    SELECT COUNT(*) as count
    FROM collection_team ct
    LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
    WHERE cs.scheduled_date = ?
");
$stmt->execute([$today]);
$existingTeams = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "Existing teams: $existingTeams\n\n";

// 3. Check if routes already exist
echo "3. Checking existing routes for $today...\n";
$stmt = $db->prepare("SELECT COUNT(*) as count FROM daily_route WHERE date = ?");
$stmt->execute([$today]);
$existingRoutes = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "Existing routes: $existingRoutes\n\n";

// 4. Test the API endpoint
echo "4. Testing API endpoint...\n";
$apiUrl = 'http://localhost/kolektrash/backend/api/auto_generate_all.php';
$postData = [
    'start_date' => $today,
    'end_date' => $today,
    'overwrite' => true, // Force overwrite for testing
    'session' => 'AM',
    'cron_token' => 'kolektrash_cron_2024'
];

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($error) {
    echo "CURL Error: $error\n";
}

echo "\nAPI Response:\n";
echo $response . "\n\n";

// 5. Check results after API call
echo "5. Checking results after API call...\n";
$stmt = $db->prepare("
    SELECT COUNT(*) as count
    FROM collection_team ct
    LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
    WHERE cs.scheduled_date = ?
");
$stmt->execute([$today]);
$newTeams = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "Teams now: $newTeams (was $existingTeams)\n";

$stmt = $db->prepare("SELECT COUNT(*) as count FROM daily_route WHERE date = ?");
$stmt->execute([$today]);
$newRoutes = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
echo "Routes now: $newRoutes (was $existingRoutes)\n\n";

echo "=== SUMMARY ===\n";
echo "Schedules found: " . count($schedules) . "\n";
echo "Teams generated: " . ($newTeams - $existingTeams) . "\n";
echo "Routes generated: " . ($newRoutes - $existingRoutes) . "\n";
?>
