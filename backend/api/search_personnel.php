<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

require_once '../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $search = $_GET['search'] ?? '';

    // Search by user_id or username
    $query = "
        SELECT 
            u.user_id,
            u.username,
            u.role_id,
            u.status as user_status,
            up.firstname,
            up.lastname,
            CASE 
                WHEN u.role_id = 3 THEN 'Driver'
                WHEN u.role_id = 4 THEN 'Collector'
                ELSE 'Unknown'
            END as designation
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.role_id IN (3, 4)
    ";

    $params = [];

    if ($search) {
        $query .= " AND (u.user_id = ? OR u.username LIKE ? OR up.firstname LIKE ? OR up.lastname LIKE ?)";
        $searchParam = "%{$search}%";
        $params = [$search, $searchParam, $searchParam, $searchParam];
    }

    $query .= " ORDER BY u.role_id, u.username LIMIT 20";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $personnel = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'personnel' => $personnel
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
