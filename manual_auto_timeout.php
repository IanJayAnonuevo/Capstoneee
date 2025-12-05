<?php
/**
 * Manual Auto-Timeout Trigger for Testing
 * This script manually calls the auto-timeout API for specific users
 */

// User IDs from your screenshot
$users = [
    ['user_id' => 16, 'name' => 'Paul Ezra Bermal', 'session' => 'AM'],
    ['user_id' => 30, 'name' => 'Alvin Monida', 'session' => 'AM'],
];

$date = '2025-12-05';
$apiUrl = 'https://kolektrash.systemproj.com/backend/api/auto_timeout_on_task_completion.php';

echo "=== Manual Auto-Timeout Trigger ===\n\n";
echo "Date: $date\n";
echo "API: $apiUrl\n\n";

foreach ($users as $user) {
    echo "Processing: {$user['name']} (ID: {$user['user_id']}, Session: {$user['session']})\n";
    
    $data = [
        'user_id' => $user['user_id'],
        'date' => $date,
        'session' => $user['session']
    ];
    
    // You need to add the actual bearer token here
    // Get it from browser DevTools > Application > Local Storage > access_token
    $token = 'YOUR_ACCESS_TOKEN_HERE';
    
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    echo "  HTTP Code: $httpCode\n";
    echo "  Response: " . json_encode($result, JSON_PRETTY_PRINT) . "\n\n";
}

echo "Done!\n";
?>
