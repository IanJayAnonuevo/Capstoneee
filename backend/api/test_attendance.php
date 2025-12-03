<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

echo json_encode([
    'status' => 'success',
    'message' => 'API is working!',
    'user_id' => $_GET['user_id'] ?? 'not provided',
    'date_from' => $_GET['date_from'] ?? 'not provided',
    'date_to' => $_GET['date_to'] ?? 'not provided'
]);
?>
