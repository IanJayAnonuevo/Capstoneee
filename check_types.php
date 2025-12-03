<?php
require_once 'backend/config/database.php';
$_SERVER['HTTP_HOST'] = 'localhost';
$database = new Database();
$db = $database->connect();

$stmt = $db->prepare("SELECT DISTINCT schedule_type FROM predefined_schedules WHERE is_active = 1");
$stmt->execute();
$types = $stmt->fetchAll(PDO::FETCH_COLUMN);

echo "Schedule Types:\n";
foreach ($types as $t) {
    echo "- '$t'\n";
}
?>
