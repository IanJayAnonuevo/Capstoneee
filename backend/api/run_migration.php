<?php
require_once '../config/database.php';

$database = new Database();
$db = $database->connect();

if ($db === null) {
    die("Database connection failed.");
}

$queries = [
    "ALTER TABLE `user` ADD COLUMN `deleted_at` DATETIME NULL DEFAULT NULL COMMENT 'Timestamp when user was soft-deleted'",
    "ALTER TABLE `user` ADD COLUMN `deleted_by` INT(11) NULL DEFAULT NULL COMMENT 'User ID of admin who deleted this user'",
    "ALTER TABLE `user` ADD CONSTRAINT `fk_user_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `user` (`user_id`) ON DELETE SET NULL",
    "CREATE INDEX `idx_user_deleted_at` ON `user` (`deleted_at`)"
];

echo "<h1>Running Migration...</h1>";

foreach ($queries as $query) {
    try {
        $db->exec($query);
        echo "<p style='color:green'>Executed: " . htmlspecialchars($query) . "</p>";
    } catch (PDOException $e) {
        // Check if error is "Duplicate column name" (Code 42S21)
        if ($e->getCode() == '42S21' || strpos($e->getMessage(), 'Duplicate column name') !== false) {
             echo "<p style='color:orange'>Skipped (Already exists): " . htmlspecialchars($query) . "</p>";
        } else {
             echo "<p style='color:red'>Error: " . htmlspecialchars($e->getMessage()) . "</p>";
        }
    }
}

echo "<h2>Done.</h2>";
?>
