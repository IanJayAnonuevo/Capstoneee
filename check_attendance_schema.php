<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $db = (new Database())->connect();
    $stmt = $db->query('DESCRIBE attendance');
    
    echo "Attendance Table Schema:\n";
    echo str_repeat("=", 80) . "\n";
    printf("%-20s | %-30s | %-5s | %-10s\n", "Field", "Type", "Null", "Default");
    echo str_repeat("=", 80) . "\n";
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        printf(
            "%-20s | %-30s | %-5s | %-10s\n",
            $row['Field'],
            $row['Type'],
            $row['Null'],
            $row['Default'] ?? 'NULL'
        );
    }
    
    echo str_repeat("=", 80) . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
