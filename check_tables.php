<?php
require_once __DIR__ . '/backend/config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    echo "=== Checking route-related tables ===\n\n";
    
    // Get all tables
    $stmt = $db->query("SHOW TABLES LIKE '%route%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "Tables with 'route' in name:\n";
    foreach ($tables as $table) {
        echo "  - $table\n";
    }
    
    echo "\n=== Checking if 'route' table exists ===\n";
    $stmt = $db->query("SHOW TABLES LIKE 'route'");
    $routeTable = $stmt->fetch(PDO::FETCH_COLUMN);
    
    if ($routeTable) {
        echo "✅ 'route' table EXISTS\n";
        
        // Show structure
        echo "\n=== Route table structure ===\n";
        $stmt = $db->query("DESCRIBE route");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $col) {
            echo "  {$col['Field']} ({$col['Type']})\n";
        }
    } else {
        echo "❌ 'route' table DOES NOT EXIST\n";
        
        echo "\n=== All tables in database ===\n";
        $stmt = $db->query("SHOW TABLES");
        $allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($allTables as $table) {
            echo "  - $table\n";
        }
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
