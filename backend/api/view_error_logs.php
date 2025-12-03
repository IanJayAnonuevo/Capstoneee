<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: text/html; charset=utf-8');
require_once '../config/database.php';

echo "<!DOCTYPE html><html><head><title>Check PHP Error Logs</title>";
echo "<style>body{font-family:monospace;padding:20px;background:#1a1a1a;color:#0f0;}";
echo ".success{color:#0f0;} .error{color:#f00;} .info{color:#ff0;}</style></head><body>";
echo "<h2>PHP Error Logs - Last 50 Lines</h2>";

// Try multiple possible error log locations
$possibleLogs = [
    'C:/xampp/apache/logs/error.log',
    'C:/xampp/php/logs/php_error_log',
    'C:/xampp/apache/logs/php_error_log',
    ini_get('error_log')
];

$foundLog = false;

foreach ($possibleLogs as $logPath) {
    if ($logPath && file_exists($logPath)) {
        echo "<h3 class='success'>Found log: $logPath</h3>";
        $foundLog = true;
        
        $lines = file($logPath);
        $recentLines = array_slice($lines, -50);
        
        echo "<pre style='background:#000;padding:10px;overflow:auto;max-height:600px;font-size:11px;'>";
        foreach ($recentLines as $line) {
            // Highlight lines with keywords
            if (stripos($line, 'special') !== false || 
                stripos($line, 'notification') !== false ||
                stripos($line, 'assignment') !== false ||
                stripos($line, 'pickup') !== false) {
                echo "<span class='error'>" . htmlspecialchars($line) . "</span>";
            } else if (stripos($line, 'error') !== false || stripos($line, 'fatal') !== false) {
                echo "<span class='error'>" . htmlspecialchars($line) . "</span>";
            } else {
                echo htmlspecialchars($line);
            }
        }
        echo "</pre>";
        break;
    }
}

if (!$foundLog) {
    echo "<p class='error'>Could not find PHP error log in any of these locations:</p>";
    echo "<ul>";
    foreach ($possibleLogs as $logPath) {
        echo "<li>" . htmlspecialchars($logPath ?? 'NULL') . "</li>";
    }
    echo "</ul>";
    
    echo "<p class='info'>Current error_log setting: " . htmlspecialchars(ini_get('error_log')) . "</p>";
}

echo "</body></html>";
?>
