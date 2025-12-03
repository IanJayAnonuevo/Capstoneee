<?php
/**
 * Simple Test Script - No Dependencies
 * Just to verify if direct access works
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'success' => true,
    'message' => 'Direct access works!',
    'server_time' => date('Y-m-d H:i:s'),
    'timezone' => date_default_timezone_get(),
    'php_version' => phpversion()
], JSON_PRETTY_PRINT);
?>
