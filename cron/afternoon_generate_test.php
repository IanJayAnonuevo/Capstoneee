#!/usr/bin/env php
<?php
/**
 * LOCAL TEST - Afternoon Auto-Generate Cron Job (2:00 PM)
 * Generates tasks and routes for TODAY's PM session
 */

// Configuration
$apiUrl = 'http://localhost/kolektrash/backend/api/auto_generate_all.php';
$cronToken = 'kolektrash_cron_2024';
$logFile = __DIR__ . '/../logs/cron_afternoon_test.log';

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
writeLog("AFTERNOON GENERATION TEST (LOCAL)");
writeLog("Generating for: $today");

// Prepare request body - PM session only
$postData = [
    'start_date' => $today,
    'end_date' => $today,
    'overwrite' => false,
    'session' => 'PM',
    'cron_token' => $cronToken
];

// Make API request
writeLog("Sending request to API...");
writeLog("URL: $apiUrl");
writeLog("Data: " . json_encode($postData));

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

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
    writeLog("SUCCESS: Afternoon tasks and routes generated");
    writeLog("Tasks generated: " . ($result['tasks']['total_generated'] ?? 0));
    
    if (isset($result['tasks']['session_issues'])) {
        writeLog("Session issues: " . json_encode($result['tasks']['session_issues']));
    }
    
    if (isset($result['routes'])) {
        foreach ($result['routes'] as $routeResult) {
            writeLog("Routes for {$routeResult['date']}: {$routeResult['routes_generated']} route(s)");
        }
    }
    
    // Log full result for debugging
    writeLog("Full result: " . json_encode($result, JSON_PRETTY_PRINT));
} else {
    $message = $result['message'] ?? 'Unknown error';
    writeLog("ERROR: $message");
    writeLog("Full response: " . json_encode($result, JSON_PRETTY_PRINT));
    exit(1);
}

writeLog("Afternoon generation completed");
writeLog("=========================================");
exit(0);
?>
