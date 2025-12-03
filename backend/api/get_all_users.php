<?php
require_once __DIR__ . '/_bootstrap.php';
// CORS headers are already set by _bootstrap.php via cors.php
require_once("../config/database.php");

$conn = (new Database())->connect();

try {
    $stmt = $conn->prepare("SELECT u.user_id AS id, CONCAT(COALESCE(up.firstname, ''), ' ', COALESCE(up.lastname, '')) AS full_name, u.email, u.username, up.barangay_id AS barangay, r.role_name AS user_type, u.online_status, u.account_status, 1 AS is_active, b.cluster_id FROM user u LEFT JOIN user_profile up ON u.user_id = up.user_id LEFT JOIN role r ON u.role_id = r.role_id LEFT JOIN barangay b ON up.barangay_id = b.barangay_id WHERE u.deleted_at IS NULL");
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["success" => true, "users" => $users]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>




