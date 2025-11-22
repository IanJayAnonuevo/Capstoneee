<?php
/**
 * Database Setup Verification Script
 * 
 * This script checks if the database is properly set up and provides
 * instructions if tables are missing.
 */

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/json');

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed. Please check your database configuration in backend/config/database.php',
            'details' => [
                'host' => 'localhost',
                'database' => 'kolektrash_db',
                'username' => 'root'
            ]
        ]);
        exit();
    }

    // Check for required tables
    $requiredTables = ['user', 'role', 'user_profile', 'admin', 'barangay_head'];
    $missingTables = [];
    $existingTables = [];

    foreach ($requiredTables as $table) {
        $check = $db->query("SHOW TABLES LIKE '{$table}'");
        if ($check->rowCount() === 0) {
            $missingTables[] = $table;
        } else {
            $existingTables[] = $table;
        }
    }

    if (empty($missingTables)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Database is properly set up!',
            'tables' => $existingTables
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Database setup incomplete. Some required tables are missing.',
            'missing_tables' => $missingTables,
            'existing_tables' => $existingTables,
            'instructions' => [
                '1. Open phpMyAdmin (http://localhost/phpmyadmin)',
                '2. Select the "kolektrash_db" database',
                '3. Click on the "Import" tab',
                '4. Choose the file: kolektrash_db.sql (in the project root)',
                '5. Click "Go" to import',
                '6. Refresh this page to verify'
            ]
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error checking database: ' . $e->getMessage()
    ]);
}
?>



