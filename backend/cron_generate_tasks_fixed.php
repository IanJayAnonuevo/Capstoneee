<?php
/**
 * Hostinger-Compatible Automatic Task Generation - FIXED VERSION
 * This script can be called via cron job or web-based triggers
 */

// Set timezone
date_default_timezone_set('Asia/Manila');

// Log function
function writeLog($message) {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/cron_generate_tasks_' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    echo $logMessage; // Also output to console if run via CLI
}

// Check if running via CLI or web
$isCLI = php_sapi_name() === 'cli';

if (!$isCLI) {
    // If running via web, check for authentication token
    $token = $_GET['token'] ?? '';
    $expectedToken = 'kolektrash_auto_generate_2024'; // Change this to a secure token
    
    if ($token !== $expectedToken) {
        http_response_code(403);
        die('Unauthorized access');
    }
    
    // Set headers for web access
    header('Content-Type: application/json');
}

try {
    writeLog("Starting automatic task generation for Hostinger");
    
    // Include database configuration
    require_once __DIR__ . '/config/database.php';
    
    // Get tomorrow's date
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    writeLog("Generating tasks for: $tomorrow");
    
    // Prepare API call data
    $apiData = [
        'start_date' => $tomorrow,
        'end_date' => $tomorrow,
        'overwrite' => false
    ];
    
    // FIXED: Use HTTPS and proper domain
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'kolektrash.systemproj.com';
    $apiUrl = $protocol . '://' . $host . '/backend/api/generate_tasks_from_predefined.php';
    
    // If running via CLI, use localhost
    if ($isCLI) {
    $apiUrl = 'http://localhost/kolektrash/backend/api/generate_tasks_from_predefined.php';
    }
    
    writeLog("Calling API: $apiUrl");
    
    // Make HTTP request to the API
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Content-Length: ' . strlen(json_encode($apiData))
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 300); // 5 minutes timeout
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Follow redirects
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5); // Maximum 5 redirects
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception("cURL Error: $curlError");
    }
    
    if ($httpCode !== 200) {
        throw new Exception("HTTP Error: $httpCode");
    }
    
    $result = json_decode($response, true);
    
    if (!$result) {
        throw new Exception("Invalid JSON response from API");
    }
    
    if ($result['success']) {
        $total = $result['total_generated'] ?? 0;
        $skipped = $result['skipped_duplicates'] ?? 0;
        writeLog("SUCCESS: Generated $total tasks, Skipped $skipped duplicates");
        
        if ($isCLI) {
            echo "Task generation completed successfully!\n";
            echo "Generated: $total tasks\n";
            echo "Skipped: $skipped duplicates\n";
        } else {
            echo json_encode([
                'success' => true,
                'message' => "Generated $total tasks successfully",
                'total_generated' => $total,
                'skipped_duplicates' => $skipped
            ]);
        }
    } else {
        $errorMsg = $result['message'] ?? 'Unknown error';
        throw new Exception("API Error: $errorMsg");
    }
    
} catch (Exception $e) {
    $errorMsg = $e->getMessage();
    writeLog("ERROR: $errorMsg");
    
    if ($isCLI) {
        echo "Error: $errorMsg\n";
        exit(1);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $errorMsg
        ]);
    }
}

writeLog("Automatic task generation completed");
?>
