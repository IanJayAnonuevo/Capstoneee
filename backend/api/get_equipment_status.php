<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get truck counts from truck table
    // Assuming status values: 'Available', 'In Use', 'Maintenance', 'Under Repair', etc.
    $truckQuery = "SELECT 
                      COUNT(CASE WHEN status IN ('Available', 'available') THEN 1 END) as available_count,
                      COUNT(CASE WHEN status IN ('Maintenance', 'maintenance', 'Under Repair', 'under_repair') THEN 1 END) as maintenance_count,
                      COUNT(*) as total_trucks
                   FROM truck";
    $truckStmt = $db->prepare($truckQuery);
    $truckStmt->execute();
    $truckData = $truckStmt->fetch(PDO::FETCH_ASSOC);

    $availableCount = (int)($truckData['available_count'] ?? 0);
    $maintenanceCount = (int)($truckData['maintenance_count'] ?? 0);
    $totalTrucks = (int)($truckData['total_trucks'] ?? 0);

    // Get detailed truck list
    $listQuery = "SELECT 
                      truck_id,
                      plate_num,
                      truck_type,
                      capacity,
                      status
                  FROM truck
                  ORDER BY status, plate_num";
    $listStmt = $db->prepare($listQuery);
    $listStmt->execute();
    $trucks = $listStmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepare response
    echo json_encode([
        'success' => true,
        'data' => [
            'available_trucks' => $availableCount,
            'under_maintenance' => $maintenanceCount,
            'total_trucks' => $totalTrucks,
            'trucks' => array_map(function($truck) {
                return [
                    'truck_id' => $truck['truck_id'],
                    'plate_number' => $truck['plate_num'],
                    'truck_type' => $truck['truck_type'],
                    'capacity' => $truck['capacity'],
                    'status' => $truck['status']
                ];
            }, $trucks)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
