<?php
require_once __DIR__ . '/_bootstrap.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    // Create leave_request table
    $createTableSQL = "
        CREATE TABLE IF NOT EXISTS leave_request (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            leave_type ENUM('sick', 'vacation', 'emergency', 'personal', 'bereavement', 'other') NOT NULL DEFAULT 'personal',
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            reason TEXT NOT NULL,
            document_path VARCHAR(500) DEFAULT NULL,
            request_status ENUM('pending', 'approved', 'declined') NOT NULL DEFAULT 'pending',
            foreman_id INT DEFAULT NULL,
            review_note TEXT DEFAULT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            reviewed_at TIMESTAMP NULL DEFAULT NULL,
            FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE,
            FOREIGN KEY (foreman_id) REFERENCES user(user_id) ON DELETE SET NULL,
            INDEX idx_user_id (user_id),
            INDEX idx_status (request_status),
            INDEX idx_dates (start_date, end_date),
            INDEX idx_submitted (submitted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ";

    $pdo->exec($createTableSQL);

    kolektrash_respond_json(200, [
        'status' => 'success',
        'message' => 'Leave request table created successfully.',
        'table' => 'leave_request'
    ]);
} catch (Throwable $e) {
    kolektrash_respond_json(500, [
        'status' => 'error',
        'message' => 'Failed to create leave request table: ' . $e->getMessage()
    ]);
}
