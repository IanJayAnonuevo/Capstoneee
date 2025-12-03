<?php
require_once 'backend/config/database.php';
$db = new Database();
$conn = $db->connect();
$stmt = $conn->query("SELECT barangay_id FROM barangay LIMIT 5");
$ids = $stmt->fetchAll(PDO::FETCH_COLUMN);
print_r($ids);
?>
