<?php
// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    exit(0);
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

try {
    // Get parameters
    $user_id = $_GET['user_id'] ?? null;
    $date_from = $_GET['date_from'] ?? null;
    $date_to = $_GET['date_to'] ?? null;

    if (!$user_id) {
        throw new Exception('User ID is required');
    }

    if (!$date_from || !$date_to) {
        throw new Exception('Date range is required');
    }

    // Connect to database
    require_once '../config/database.php';
    
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    // Query attendance records
    $query = "
        SELECT 
            a.attendance_id,
            a.user_id,
            a.attendance_date,
            CONCAT(a.attendance_date, ' ', a.time_in) as am_time_in,
            CONCAT(a.attendance_date, ' ', a.time_out) as am_time_out,
            NULL as pm_time_in,
            NULL as pm_time_out,
            a.status
        FROM attendance a
        WHERE a.user_id = ?
        AND a.attendance_date BETWEEN ? AND ?
        ORDER BY a.attendance_date ASC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([$user_id, $date_from, $date_to]);
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $records,
        'user_id' => $user_id,
        'date_from' => $date_from,
        'date_to' => $date_to,
        'count' => count($records)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
