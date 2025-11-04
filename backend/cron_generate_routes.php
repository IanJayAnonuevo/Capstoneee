<?php
/**
 * Hostinger-Compatible Automatic Route Generation
 * This script generates routes after task assignments are created
 */

// Set timezone
date_default_timezone_set('Asia/Manila');

// Log function
function writeLog($message) {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/cron_generate_routes_' . date('Y-m-d') . '.log';
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
    writeLog("Starting automatic route generation for Hostinger");
    
    // Include database configuration and route generator
    require_once __DIR__ . '/config/database.php';
    require_once __DIR__ . '/lib/RouteGenerator.php';
    
    // Get tomorrow's date (same as task generation)
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    writeLog("Generating routes for: $tomorrow");
    
    // Check if there are any task assignments for tomorrow
    $database = new Database();
    $db = $database->connect();
    
    // Check if there are collection schedules for tomorrow
    $stmt = $db->prepare("SELECT COUNT(*) FROM collection_schedule WHERE scheduled_date = ? AND status IN ('scheduled', 'pending')");
    $stmt->execute([$tomorrow]);
    $scheduleCount = $stmt->fetchColumn();
    
    if ($scheduleCount == 0) {
        writeLog("No task assignments found for $tomorrow, skipping route generation");
        
        if ($isCLI) {
            echo "No task assignments found for $tomorrow, skipping route generation\n";
        } else {
            echo json_encode([
                'success' => true,
                'message' => "No task assignments found for $tomorrow, skipping route generation",
                'routes_generated' => 0
            ]);
        }
        exit(0);
    }
    
    writeLog("Found $scheduleCount task assignments for $tomorrow, generating routes...");
    
    // Generate routes using the existing RouteGenerator
    $result = generateDailyRoutes($db, $tomorrow, 'preserve_manual', 'all', null);
    
    $routesGenerated = $result['createdRoutes'];
    $stopsGenerated = $result['createdStops'];
    
    writeLog("SUCCESS: Generated $routesGenerated routes with $stopsGenerated stops");
    
    if ($isCLI) {
        echo "Route generation completed successfully!\n";
        echo "Generated: $routesGenerated routes\n";
        echo "Stops: $stopsGenerated stops\n";
    } else {
        echo json_encode([
            'success' => true,
            'message' => "Generated $routesGenerated routes with $stopsGenerated stops",
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

writeLog("Automatic route generation completed");
?>
