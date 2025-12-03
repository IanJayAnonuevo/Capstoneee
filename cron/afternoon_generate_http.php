<?php
/**
 * HTTP-accessible Afternoon Auto-Generate Endpoint
 * This file can be called via HTTP GET/POST from cron-job.org
 * 
 * URL: https://kolektrash.systemproj.com/cron/afternoon_generate_http.php
 */

// Configuration
$apiUrl = 'https://kolektrash.systemproj.com/backend/api/auto_generate_all.php';
$cronToken = 'kolektrash_cron_2024';
$logFile = __DIR__ . '/../logs/cron_afternoon.log';

// Set timezone
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
    file_put_contents($logFile, $logMessage, FILE_APPEND);
    return $logMessage;
}

// Start logging
$output = [];
$output[] = writeLog("=========================================");
$output[] = writeLog("AFTERNOON GENERATION (2:00 PM) - HTTP");
$output[] = writeLog("Generating for: $today");

// Prepare request body - PM session only
$postData = [
    'start_date' => $today,
    'end_date' => $today,
    'overwrite' => false,
    'session' => 'PM',
    'cron_token' => $cronToken
];

// Make API request
$output[] = writeLog("Sending request to API...");

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
    $output[] = writeLog("CURL ERROR: $error");
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'CURL Error: ' . $error,
        'log' => $output
    ]);
    exit;
}

if ($httpCode !== 200) {
    $output[] = writeLog("HTTP ERROR: $httpCode");
    $output[] = writeLog("Response: $response");
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'HTTP Error: ' . $httpCode,
        'response' => $response,
        'log' => $output
    ]);
    exit;
}

$result = json_decode($response, true);

if ($result && $result['success']) {
    $output[] = writeLog("SUCCESS: Afternoon tasks and routes generated");
    $output[] = writeLog("Tasks generated: " . ($result['tasks']['total_generated'] ?? 0));
    
    if (isset($result['routes'])) {
        foreach ($result['routes'] as $routeResult) {
            $output[] = writeLog("Routes for {$routeResult['date']}: {$routeResult['routes_generated']} route(s)");
        }
    }
    
    $output[] = writeLog("Afternoon generation completed");
    $output[] = writeLog("=========================================");
    
    header('Content-Type: application/json');
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Afternoon generation completed successfully',
        'result' => $result,
        'log' => $output
    ]);
} else {
    $message = $result['message'] ?? 'Unknown error';
    $output[] = writeLog("ERROR: $message");
    $output[] = writeLog("=========================================");
    
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $message,
        'result' => $result,
        'log' => $output
    ]);
}
?>
