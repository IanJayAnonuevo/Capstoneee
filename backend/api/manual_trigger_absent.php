<?php
/**
 * Manual Trigger for Auto Mark Absent
 * Use this to manually trigger the auto-mark-absent process
 * No authentication required (for testing only)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
date_default_timezone_set('Asia/Manila');

$session = $_GET['session'] ?? 'AM';
$testMode = true;

// Call the auto_mark_absent.php script
$scriptUrl = 'https://kolektrash.systemproj.com/cron/auto_mark_absent.php?test=true&session=' . $session;

$ch = curl_init($scriptUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    echo json_encode([
        'success' => false,
        'message' => 'CURL Error: ' . $error,
        'url' => $scriptUrl
    ], JSON_PRETTY_PRINT);
    exit;
}

$result = json_decode($response, true);

echo json_encode([
    'success' => true,
    'message' => 'Manual trigger completed',
    'session' => $session,
    'http_code' => $httpCode,
    'script_url' => $scriptUrl,
    'script_response' => $result,
    'raw_response' => $response
], JSON_PRETTY_PRINT);
?>
