<?php
/**
 * Hostinger-Compatible Automatic Task AND Route Generation
 * This script generates both tasks and routes automatically
 */

// Set timezone
date_default_timezone_set('Asia/Manila');

// Log function
function writeLog($message) {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/cron_generate_tasks_and_routes_' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    echo $logMessage; // Also output to console if run via CLI
}

// Check if running via CLI or web
$isCLI = php_sapi_name() === 'cli';
$sessionFilter = null;

if ($isCLI && isset($argv)) {
    foreach ($argv as $arg) {
        if (strpos($arg, '--session=') === 0) {
            $value = strtoupper(substr($arg, 10));
            if (in_array($value, ['AM', 'PM'], true)) {
                $sessionFilter = $value;
            } else {
                writeLog("Invalid session argument '$value'. Use AM or PM.");
            }
        }
    }
}

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
    writeLog("Starting automatic task AND route generation for Hostinger");
    
    // Include database configuration and route generator
    require_once __DIR__ . '/config/database.php';
    require_once __DIR__ . '/lib/RouteGenerator.php';
    
    // Get tomorrow's date
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    writeLog("Generating tasks and routes for: $tomorrow");
    
    // STEP 1: Generate Tasks
    writeLog("Step 1: Generating task assignments...");
    
    // Prepare API call data for task generation
    $apiData = [
        'start_date' => $tomorrow,
        'end_date' => $tomorrow,
        'overwrite' => false,
        'cron_token' => 'kolektrash_cron_2024' // Authentication bypass for cron
    ];
    if ($sessionFilter) {
        $apiData['session'] = $sessionFilter;
        writeLog("Restricting generation to {$sessionFilter} session.");
    }
    
    // Call the task generation API
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'kolektrash.systemproj.com';
    
    // For localhost (both CLI and web), include /kolektrash path
    if ($isCLI || strpos($host, 'localhost') !== false) {
        if (strpos(__DIR__, 'xampp') === false) {
             $apiUrl = 'http://localhost/backend/api/generate_tasks_from_predefined.php';
        } else {
             $apiUrl = 'http://localhost/kolektrash/backend/api/generate_tasks_from_predefined.php';
        }
    } else {
        // For production (Hostinger)
        $apiUrl = $protocol . '://' . $host . '/backend/api/generate_tasks_from_predefined.php';
    }
    
    
    writeLog("Calling task generation API: $apiUrl");
    
    // Make HTTP request to the task generation API
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
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_MAXREDIRS, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        throw new Exception("Task generation cURL Error: $curlError");
    }
    
    if ($httpCode !== 200) {
        writeLog("HTTP Error $httpCode. Response body: " . substr($response, 0, 500));
        throw new Exception("Task generation HTTP Error: $httpCode");
    }
    
    $taskResult = json_decode($response, true);
    
    if (!$taskResult) {
        throw new Exception("Invalid JSON response from task generation API");
    }
    
    if (!$taskResult['success']) {
        $errorMsg = $taskResult['message'] ?? 'Unknown error';
        throw new Exception("Task generation API Error: $errorMsg");
    }
    
    $tasksGenerated = $taskResult['total_generated'] ?? 0;
    $tasksSkipped = $taskResult['skipped_duplicates'] ?? 0;
    $trucksAvailable = $taskResult['trucks_available'] ?? 'N/A';
    $skippedTrucks = count($taskResult['skipped_insufficient_trucks'] ?? []);
    $notificationsSent = $taskResult['cancellation_notifications_sent'] ?? 0;
    
    if (!empty($taskResult['session_issues'])) {
        foreach ($taskResult['session_issues'] as $issue) {
            writeLog("Session issue ({$issue['date']} {$issue['session']}): {$issue['message']}");
        }
    }
    
    writeLog("Task generation SUCCESS: Generated $tasksGenerated tasks, Skipped $tasksSkipped duplicates");
    writeLog("Trucks Available: $trucksAvailable");
    
    if ($skippedTrucks > 0) {
        writeLog("WARNING: Skipped $skippedTrucks schedules due to insufficient trucks");
        writeLog("Cancellation notifications sent: $notificationsSent");
    }
    
    // STEP 2: Generate Routes (only if tasks were generated)
    $routesGenerated = 0;
    $stopsGenerated = 0;
    
    if ($tasksGenerated > 0) {
        writeLog("Step 2: Generating routes for assigned tasks...");
        
        // Wait a moment for database to be updated
        sleep(2);
        
        // Generate routes using the existing RouteGenerator
        $database = new Database();
        $db = $database->connect();
        
        $routeResult = generateDailyRoutes($db, $tomorrow, 'preserve_manual', 'all', null);
        
        $routesGenerated = $routeResult['createdRoutes'];
        $stopsGenerated = $routeResult['createdStops'];
        
        writeLog("Route generation SUCCESS: Generated $routesGenerated routes with $stopsGenerated stops");
    } else {
        writeLog("No tasks generated, skipping route generation");
    }
    
    // Final summary
    writeLog("COMPLETE: Generated $tasksGenerated tasks and $routesGenerated routes with $stopsGenerated stops");
    
    if ($isCLI) {
        echo "Task and route generation completed successfully!\n";
        echo "Tasks: $tasksGenerated generated, $tasksSkipped skipped\n";
        echo "Routes: $routesGenerated generated\n";
        echo "Stops: $stopsGenerated generated\n";
    } else {
        echo json_encode([
            'success' => true,
            'message' => "Generated $tasksGenerated tasks and $routesGenerated routes successfully",
            'tasks_generated' => $tasksGenerated,
            'tasks_skipped' => $tasksSkipped,
            'trucks_available' => $trucksAvailable ?? 'N/A',
            'skipped_insufficient_trucks' => $skippedTrucks ?? 0,
            'cancellation_notifications_sent' => $notificationsSent ?? 0,
            'routes_generated' => $routesGenerated,
            'stops_generated' => $stopsGenerated,
            'date' => $tomorrow
        ]);
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

writeLog("Automatic task and route generation completed");
?>
