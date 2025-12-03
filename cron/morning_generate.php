#!/usr/bin/env php
<?php
/**
 * Morning Auto-Generate Cron Job (6:00 AM)
 * Generates tasks and routes for TODAY's AM session
 * 
 * Hostinger Cron Command:
 * 0 6 * * * /usr/bin/php /home/u366677621/domains/YOUR_DOMAIN/public_html/cron/morning_generate.php
 */

// Configuration
$apiUrl = 'https://kolektrash.systemproj.com/backend/api/auto_generate_all.php';
$cronToken = 'kolektrash_cron_2024';
$logFile = __DIR__ . '/../logs/cron_morning.log';

// Calculate dates
date_default_timezone_set('Asia/Manila');
$today = date('Y-m-d');

// Ensure log directory exists
$logDir = dirname($logFile);
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

// Log function
function writeLog($message) {
    global $logFile;
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    echo $logMessage;
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

writeLog("=========================================");
writeLog("MORNING GENERATION (6:00 AM)");
writeLog("Generating for: $today");

// Prepare request body - AM session only
$postData = [
    'start_date' => $today,
    'end_date' => $today,
    'overwrite' => false,
    'session' => 'AM',
    'cron_token' => $cronToken
];

// Make API request
writeLog("Sending request to API...");

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // For development, remove in production

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    writeLog("CURL ERROR: $error");
    exit(1);
}

if ($httpCode !== 200) {
    writeLog("HTTP ERROR: $httpCode");
    writeLog("Response: $response");
    exit(1);
}

$result = json_decode($response, true);

if ($result && $result['success']) {
    writeLog("SUCCESS: Morning tasks and routes generated");
    writeLog("Tasks generated: " . ($result['tasks']['total_generated'] ?? 0));
    
    if (isset($result['routes'])) {
        foreach ($result['routes'] as $routeResult) {
            writeLog("Routes for {$routeResult['date']}: {$routeResult['routes_generated']} route(s)");
        }
    }
} else {
    $message = $result['message'] ?? 'Unknown error';
    writeLog("ERROR: $message");
    exit(1);
}

writeLog("Morning generation completed");
writeLog("=========================================");
exit(0);
?>
