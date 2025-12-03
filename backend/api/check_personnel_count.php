<?php
/**
 * Check Personnel Count - Public Diagnostic Endpoint
 * No authentication required
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
date_default_timezone_set('Asia/Manila');

require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Get all drivers and collectors
    $stmt = $db->prepare("
        SELECT 
            u.user_id,
            u.username,
            u.role_id,
            u.account_status,
            COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name,
            CASE 
                WHEN u.role_id = 3 THEN 'Driver'
                WHEN u.role_id = 4 THEN 'Collector'
                ELSE 'Other'
            END AS role_name
        FROM user u
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE u.role_id IN (3, 4)
        ORDER BY u.role_id, u.user_id
    ");
    $stmt->execute();
    $personnel = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Count by role
    $drivers = array_filter($personnel, fn($p) => $p['role_id'] == 3);
    $collectors = array_filter($personnel, fn($p) => $p['role_id'] == 4);
    
    // Count by status
    $active = array_filter($personnel, fn($p) => $p['account_status'] === 'active');
    $suspended = array_filter($personnel, fn($p) => $p['account_status'] === 'suspended');
    
    echo json_encode([
        'success' => true,
        'total_personnel' => count($personnel),
        'summary' => [
            'drivers' => count($drivers),
            'collectors' => count($collectors),
            'active' => count($active),
            'suspended' => count($suspended)
        ],
        'personnel_list' => $personnel
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
