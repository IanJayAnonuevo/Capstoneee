<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    // Fetch truck drivers (role_id = 3)
    $stmtDrivers = $pdo->prepare("
        SELECT 
            u.user_id as id,
            u.user_id,
            up.firstname,
            up.lastname,
            CONCAT(COALESCE(up.firstname, ''), ' ', COALESCE(up.lastname, '')) as full_name,
            'truck_driver' as user_type 
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.role_id = 3
    ");
    $stmtDrivers->execute();
    $truckDrivers = $stmtDrivers->fetchAll(PDO::FETCH_ASSOC);

    // Fetch garbage collectors (role_id = 4)
    $stmtCollectors = $pdo->prepare("
        SELECT 
            u.user_id as id,
            u.user_id,
            up.firstname,
            up.lastname,
            CONCAT(COALESCE(up.firstname, ''), ' ', COALESCE(up.lastname, '')) as full_name,
            'garbage_collector' as user_type 
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.role_id = 4
    ");
    $stmtCollectors->execute();
    $garbageCollectors = $stmtCollectors->fetchAll(PDO::FETCH_ASSOC);

    // Combine both arrays
    $allPersonnel = array_merge($truckDrivers, $garbageCollectors);

    echo json_encode([
        "status" => "success",
        "data" => $allPersonnel
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => $e->getMessage()
    ]);
}
?> 
