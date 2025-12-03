<?php
/**
 * Debug Auto Generate - Shows actual errors
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/plain');

echo "=== DEBUG AUTO GENERATE ===\n\n";

$apiUrl = 'https://kolektrash.systemproj.com/backend/api/auto_generate_all.php';

$postData = [
    'start_date' => date('Y-m-d'),
    'end_date' => date('Y-m-d'),
    'overwrite' => true,
    'session' => 'AM'
];

echo "Sending request to: $apiUrl\n";
echo "Data: " . json_encode($postData, JSON_PRETTY_PRINT) . "\n\n";

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

echo "HTTP Code: $httpCode\n";
echo "CURL Error: " . ($error ?: 'None') . "\n\n";

echo "=== RAW RESPONSE ===\n";
echo $response;
echo "\n\n";

echo "=== RESPONSE LENGTH ===\n";
echo "Length: " . strlen($response) . " bytes\n\n";

// Try to decode JSON
echo "=== JSON DECODE ATTEMPT ===\n";
$decoded = json_decode($response, true);
if (json_last_error() === JSON_ERROR_NONE) {
    echo "✅ Valid JSON\n";
    echo json_encode($decoded, JSON_PRETTY_PRINT);
} else {
    echo "❌ JSON Error: " . json_last_error_msg() . "\n";
    echo "First 500 chars of response:\n";
    echo substr($response, 0, 500);
}
?>
