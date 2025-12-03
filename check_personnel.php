<?php
require_once __DIR__ . '/backend/config/database.php';

$database = new Database();
$pdo = $database->connect();

echo "=== Checking Personnel Data ===\n\n";

// Check truck drivers
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM user WHERE role_id = 3");
$stmt->execute();
$driverCount = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Truck Drivers (role_id = 3): " . $driverCount['count'] . "\n";

// Check garbage collectors
$stmt = $pdo->prepare("SELECT COUNT(*) as count FROM user WHERE role_id = 4");
$stmt->execute();
$collectorCount = $stmt->fetch(PDO::FETCH_ASSOC);
echo "Garbage Collectors (role_id = 4): " . $collectorCount['count'] . "\n\n";

// Check sample truck driver with profile
$stmt = $pdo->prepare("
    SELECT 
        u.user_id,
        u.employee_id,
        up.firstname,
        up.lastname
    FROM user u
    LEFT JOIN user_profile up ON u.user_id = up.user_id
    WHERE u.role_id = 3
    LIMIT 3
");
$stmt->execute();
$drivers = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Sample Truck Drivers:\n";
print_r($drivers);

// Check sample garbage collector with profile
$stmt = $pdo->prepare("
    SELECT 
        u.user_id,
        u.employee_id,
        up.firstname,
        up.lastname
    FROM user u
    LEFT JOIN user_profile up ON u.user_id = up.user_id
    WHERE u.role_id = 4
    LIMIT 3
");
$stmt->execute();
$collectors = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "\nSample Garbage Collectors:\n";
print_r($collectors);
?>
