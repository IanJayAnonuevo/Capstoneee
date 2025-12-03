<?php
/**
 * Manual Task Generation for Specific Date
 * Usage: php generate_for_date.php [date] [session]
 * Example: php generate_for_date.php 2025-11-30 AM
 */

// Configuration
$apiUrl = 'https://kolektrash.systemproj.com/backend/api/auto_generate_all.php';
$cronToken = 'kolektrash_cron_2024';

// Get command line arguments
$targetDate = $argv[1] ?? null;
$targetSession = isset($argv[2]) ? strtoupper($argv[2]) : null;

if (!$targetDate) {
    echo "Usage: php generate_for_date.php [date] [session]\n";
    echo "Example: php generate_for_date.php 2025-11-30 AM\n";
    echo "Session is optional (AM or PM). If not specified, generates for both.\n";
    exit(1);
}

// Validate date format
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $targetDate)) {
    echo "Error: Invalid date format. Use YYYY-MM-DD\n";
    exit(1);
}

// Validate session if provided
if ($targetSession && !in_array($targetSession, ['AM', 'PM'])) {
    echo "Error: Invalid session. Use AM or PM\n";
    exit(1);
}

date_default_timezone_set('Asia/Manila');

echo "=========================================\n";
echo "MANUAL TASK GENERATION\n";
echo "Date: $targetDate\n";
echo "Session: " . ($targetSession ?? 'Both AM and PM') . "\n";
echo "=========================================\n\n";

// Prepare request body
$postData = [
    'start_date' => $targetDate,
    'end_date' => $targetDate,
    'overwrite' => true, // Overwrite existing tasks
    'cron_token' => $cronToken
];

if ($targetSession) {
    $postData['session'] = $targetSession;
}

// Make API request
echo "Sending request to API...\n";

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
    echo "CURL ERROR: $error\n";
    exit(1);
}

if ($httpCode !== 200) {
    echo "HTTP ERROR: $httpCode\n";
    echo "Response: $response\n";
    exit(1);
}

$result = json_decode($response, true);

if ($result && $result['success']) {
    echo "✓ SUCCESS: Tasks and routes generated\n\n";
    
    // Display task generation results
    if (isset($result['tasks'])) {
        echo "TASKS GENERATED:\n";
        echo "  Total: " . ($result['tasks']['total_generated'] ?? 0) . "\n";
        echo "  Skipped (duplicates): " . ($result['tasks']['skipped_duplicates'] ?? 0) . "\n";
        
        if (!empty($result['tasks']['session_issues'])) {
            echo "\n  ⚠ SESSION ISSUES:\n";
            foreach ($result['tasks']['session_issues'] as $issue) {
                echo "    - {$issue['date']} {$issue['session']}: {$issue['message']}\n";
            }
        }
        
        if (!empty($result['tasks']['generated_tasks'])) {
            echo "\n  TASK DETAILS:\n";
            foreach ($result['tasks']['generated_tasks'] as $task) {
                echo "    • {$task['barangay_name']} ({$task['cluster_id']}) - {$task['date']} {$task['session']} @ {$task['time']}\n";
                echo "      Driver: {$task['driver']}, Truck: {$task['truck']}\n";
                echo "      Collectors: " . implode(', ', $task['collectors']) . "\n";
            }
        }
    }
    
    // Display route generation results
    if (isset($result['routes'])) {
        echo "\nROUTES GENERATED:\n";
        foreach ($result['routes'] as $routeResult) {
            echo "  {$routeResult['date']}: {$routeResult['routes_generated']} route(s)\n";
            if (!empty($routeResult['message'])) {
                echo "    Message: {$routeResult['message']}\n";
            }
        }
    }
    
    echo "\n=========================================\n";
    echo "Generation completed successfully!\n";
    echo "=========================================\n";
} else {
    $message = $result['message'] ?? 'Unknown error';
    echo "✗ ERROR: $message\n";
    
    if (isset($result['tasks']['session_issues'])) {
        echo "\nSESSION ISSUES:\n";
        foreach ($result['tasks']['session_issues'] as $issue) {
            echo "  - {$issue['date']} {$issue['session']}: {$issue['message']}\n";
        }
    }
    
    echo "\n";
    exit(1);
}

exit(0);
?>
