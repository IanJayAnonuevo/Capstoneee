<?php
// Simple test endpoint to check trucks without authentication
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

try {
    $database = new Database();
    $pdo = $database->connect();

    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM truck");
    $stmt->execute();
    $count = $stmt->fetch(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT 
            truck_id, 
            plate_num,
            capacity, 
            truck_type, 
            status 
        FROM truck
        LIMIT 10
    ");
    $stmt->execute();
    $trucks = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "count" => $count['count'],
        "trucks" => $trucks
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?>
