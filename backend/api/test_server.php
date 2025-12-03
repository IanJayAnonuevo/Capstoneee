<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Content-Type: text/html');

echo "<h1>Server Diagnostic Tool</h1>";

// 1. Check File Structure
echo "<h2>1. File Structure Check</h2>";
$files = [
    '../config/Database.php',
    '../includes/auth.php',
    '../includes/cors.php',
    '_bootstrap.php'
];

foreach ($files as $file) {
    if (file_exists(__DIR__ . '/' . $file)) {
        echo "<p style='color:green'>Found: $file</p>";
    } else {
        echo "<p style='color:red'>MISSING: $file</p>";
    }
}

// 2. Check Database Connection
echo "<h2>2. Database Connection Check</h2>";
try {
    if (!file_exists(__DIR__ . '/../config/Database.php')) {
        throw new Exception("Database.php not found, cannot test connection.");
    }
    
    require_once __DIR__ . '/../config/database.php';
    
    $database = new Database();
    echo "<p>Database instance created.</p>";
    
    // Hack to inspect private properties if needed, or just rely on connect()
    // We'll just try to connect.
    
    $db = $database->connect();
    
    if ($db) {
        echo "<p style='color:green'><strong>Connection Successful!</strong></p>";
        
        // 3. Check Table Schema
        echo "<h2>3. Schema Check (User Table)</h2>";
        $stmt = $db->query("SHOW COLUMNS FROM user");
        $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        $missing = [];
        $required = ['deleted_at', 'deleted_by', 'account_status'];
        
        foreach ($required as $req) {
            if (in_array($req, $columns)) {
                echo "<p style='color:green'>Column '$req' exists.</p>";
            } else {
                echo "<p style='color:red'>Column '$req' is MISSING!</p>";
                $missing[] = $req;
            }
        }
        
        if (!empty($missing)) {
            echo "<h3 style='color:red'>ACTION REQUIRED: Please run the migration script!</h3>";
            echo "<p><a href='run_migration.php'>Click here to run run_migration.php</a></p>";
        } else {
            echo "<h3 style='color:green'>Schema looks correct.</h3>";
        }
        
    } else {
        echo "<p style='color:red'><strong>Connection Failed: connect() returned null.</strong></p>";
        echo "<p>Check your database credentials in <code>backend/config/Database.php</code>.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red'><strong>Exception:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<pre>" . htmlspecialchars($e->getTraceAsString()) . "</pre>";
}

echo "<h2>4. PHP Info</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
?>
