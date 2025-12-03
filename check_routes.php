<?php
require_once 'backend/config/database.php';

$_SERVER['HTTP_HOST'] = 'localhost';

$database = new Database();
$db = $database->connect();

$date = '2025-11-29';
$stmt = $db->prepare("SELECT COUNT(*) as count FROM daily_route WHERE date = ?");
$stmt->execute([$date]);
$result = $stmt->fetch(PDO::FETCH_ASSOC);

echo "Routes for $date: " . $result['count'] . "\n";

if ($result['count'] > 0) {
    $stmt = $db->prepare("SELECT * FROM daily_route WHERE date = ?");
    $stmt->execute([$date]);
    $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($routes as $r) {
        echo "- " . $r['barangay_name'] . " (" . $r['status'] . ")\n";
    }
}
?>
