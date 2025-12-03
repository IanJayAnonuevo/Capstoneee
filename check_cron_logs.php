<?php
/**
 * Check Cron Job Logs
 * Shows the last execution logs for auto_mark_absent
 */

header('Content-Type: application/json');
date_default_timezone_set('Asia/Manila');

$logFile = __DIR__ . '/logs/cron_auto_absent_am.log';

try {
    if (!file_exists($logFile)) {
        echo json_encode([
            'success' => false,
            'message' => 'Log file not found',
            'log_path' => $logFile,
            'log_exists' => false
        ], JSON_PRETTY_PRINT);
        exit;
    }
    
    // Read last 100 lines of log
    $lines = file($logFile);
    $lastLines = array_slice($lines, -100);
    
    echo json_encode([
        'success' => true,
        'log_path' => $logFile,
        'log_exists' => true,
        'total_lines' => count($lines),
        'last_100_lines' => implode('', $lastLines),
        'file_size' => filesize($logFile),
        'last_modified' => date('Y-m-d H:i:s', filemtime($logFile))
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
