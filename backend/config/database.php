<?php
class Database {
    // Database Parameters
    private $host = 'localhost'; // Local XAMPP MySQL
    private $db_name = 'kolektrash_db'; // Local database name
    private $username = 'root'; // Default XAMPP username
    private $password = ''; // Default XAMPP password (empty)
    private $conn;

    // Database Connect
    public function connect() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $e) {
            // Don't echo directly - let the calling code handle the error
            error_log("Database connection error: " . $e->getMessage());
            return null;
        }

        return $this->conn;
    }
}
