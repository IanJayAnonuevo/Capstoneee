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
        'overwrite' => false
    ];
    
    // Call the task generation API
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'kolektrash.systemproj.com';
    $apiUrl = $protocol . '://' . $host . '/backend/api/generate_tasks_from_predefined.php';
    
    // If running via CLI, use localhost
    if ($isCLI) {
    $apiUrl = 'http://localhost/kolektrash/backend/api/generate_tasks_from_predefined.php';
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
    writeLog("Task generation SUCCESS: Generated $tasksGenerated tasks, Skipped $tasksSkipped duplicates");
    
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
