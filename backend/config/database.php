<?php
class Database {
    // Database Parameters - Auto-detect environment
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    public function __construct() {
        // Detect if we're on production (Hostinger) or localhost
        $isProduction = !in_array($_SERVER['HTTP_HOST'] ?? '', ['localhost', '127.0.0.1', 'localhost:5173']);
        
        if ($isProduction) {
            // PRODUCTION (Hostinger)
            $this->host = 'localhost';
            $this->db_name = 'u366677621_kolektrash_db';
            $this->username = 'u366677621_kolektrash';
            $this->password = 'Kolektrash2025';
        } else {
            // LOCALHOST (XAMPP)
            $this->host = 'localhost';
            $this->db_name = 'kolektrash_db';
            $this->username = 'root';
            $this->password = '';
        }
    }

    /**
     * Returns the host values we should try when establishing a connection.
     * Some MariaDB setups disallow the literal "localhost", so we fall back
     * to the loopback IP if needed.
     */
    private function getCandidateHosts(): array
    {
        $hosts = [$this->host];
        if (strcasecmp($this->host, 'localhost') === 0) {
            $hosts[] = '127.0.0.1';
        }
        return array_values(array_unique(array_filter($hosts)));
    }

    // Database Connect
    public function connect() {
        $this->conn = null;

        foreach ($this->getCandidateHosts() as $host) {
            try {
                $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $host, $this->db_name);
                $this->conn = new PDO(
                    $dsn,
                    $this->username,
                    $this->password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    ]
                );
                // Set connection collation to avoid collation mismatch errors
                $this->conn->exec("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
                return $this->conn;
            } catch(PDOException $e) {
                // Log the failed attempt and try the next candidate host
                error_log("Database connection error [host={$host}]: " . $e->getMessage());
                $this->conn = null;
            }
        }

        return null;
    }
}
