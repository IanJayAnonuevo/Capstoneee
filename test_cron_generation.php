<?php
// Test cron generation for December 01, 2025
require_once __DIR__ . '/backend/config/database.php';

$database = new Database();
$db = $database->connect();

echo "Testing cron generation for December 01, 2025...\n\n";

// Call the cron endpoint
$url = 'http://localhost/kolektrash/cron/morning_generate_http.php';

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
if ($error) {
    echo "CURL Error: $error\n";
}

echo "\nResponse:\n";
echo $response;
echo "\n\n";

// Check database for generated tasks
$stmt = $db->prepare("SELECT COUNT(*) as count FROM collection_team ct 
    LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id 
    WHERE cs.scheduled_date = '2025-12-01'");
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Total teams for Dec 01, 2025: " . $result['count'] . "\n";

// Check daily_route
$stmt = $db->prepare("SELECT COUNT(*) as count FROM daily_route WHERE date = '2025-12-01'");
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Total routes for Dec 01, 2025: " . $result['count'] . "\n";
