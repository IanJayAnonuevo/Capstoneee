<?php
/**
 * HTTP-accessible Auto Mark Absent for PM Session
 * URL: https://kolektrash.systemproj.com/cron/auto_mark_absent_pm_http.php
 * Schedule: Daily at 2:05 PM
 */

// Set CORS headers for HTTP access
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Configuration
$apiUrl = 'https://kolektrash.systemproj.com/cron/auto_mark_absent.php';
$logFile = __DIR__ . '/../logs/cron_auto_absent_pm.log';

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
$output[] = writeLog("AUTO MARK ABSENT - PM SESSION (2:05 PM)");
$output[] = writeLog("Date: $today");

// Make request to auto_mark_absent.php
$output[] = writeLog("Executing auto mark absent...");

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
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
    $output[] = writeLog("SUCCESS: Auto-absent marking completed");
    $output[] = writeLog("Marked absent: " . ($result['total_marked_absent'] ?? 0));
    $output[] = writeLog("Already present: " . ($result['already_present'] ?? 0));
    $output[] = writeLog("=========================================");
    
    header('Content-Type: application/json');
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'PM auto-absent marking completed successfully',
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
