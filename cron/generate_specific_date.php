<?php
/**
 * HTTP-accessible Task Generation for Specific Date
 * URL: https://kolektrash.systemproj.com/cron/generate_specific_date.php?date=2025-11-30&session=AM
 */

// Configuration
$apiUrl = 'https://kolektrash.systemproj.com/backend/api/auto_generate_all.php';
$cronToken = 'kolektrash_cron_2024';

// Get parameters from URL
$targetDate = $_GET['date'] ?? date('Y-m-d');
$targetSession = isset($_GET['session']) ? strtoupper($_GET['session']) : null;
$overwrite = isset($_GET['overwrite']) ? (bool)$_GET['overwrite'] : true;

// Set timezone
date_default_timezone_set('Asia/Manila');

// Prepare request body
$postData = [
    'start_date' => $targetDate,
    'end_date' => $targetDate,
    'overwrite' => $overwrite,
    'cron_token' => $cronToken
];

if ($targetSession) {
    $postData['session'] = $targetSession;
}

// Make API request
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

header('Content-Type: application/json');

if ($error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'CURL Error: ' . $error,
        'date' => $targetDate,
        'session' => $targetSession
    ]);
    exit;
}

if ($httpCode !== 200) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'HTTP Error: ' . $httpCode,
        'response' => $response,
        'date' => $targetDate,
        'session' => $targetSession
    ]);
    exit;
}

$result = json_decode($response, true);

if ($result && $result['success']) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Tasks and routes generated successfully',
        'date' => $targetDate,
        'session' => $targetSession,
        'result' => $result
    ], JSON_PRETTY_PRINT);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $result['message'] ?? 'Unknown error',
        'date' => $targetDate,
        'session' => $targetSession,
        'result' => $result
    ], JSON_PRETTY_PRINT);
}
?>
