<?php
require_once __DIR__ . '/_bootstrap.php';
// Headers - Allow all origins for development
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

if (!$db) {
    http_response_code(500);
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database connection failed'
    ));
    exit();
}

// Get barangay from query parameter
$barangay = isset($_GET['barangay']) ? $_GET['barangay'] : null;

if (!$barangay) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Barangay parameter is required'
    ));
    exit();
}

$normalizedBarangay = trim($barangay);

try {
    // Query to get barangay head data by assigned barangay using multiple possible columns
    $query = "SELECT 
                e.id,
                e.fullName,
                e.email,
                e.phone,
                COALESCE(bh.barangay_assigned, e.bh_barangay, e.assignedArea) AS barangay_name,
                COALESCE(bh.term_start, e.term_start) AS term_start,
                COALESCE(bh.term_end, e.term_end) AS term_end
              FROM employees e
              LEFT JOIN barangay_heads bh ON e.id = bh.employee_id
              WHERE e.role = 'barangayhead'
                AND LOWER(COALESCE(bh.barangay_assigned, e.bh_barangay, e.assignedArea)) = LOWER(:barangay)
              LIMIT 1";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':barangay', $normalizedBarangay);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
                // Fallback: try partial match in case of spacing or casing differences
                $fallbackQuery = "SELECT 
                                                        e.id,
                                                        e.fullName,
                                                        e.email,
                                                        e.phone,
                                                        COALESCE(bh.barangay_assigned, e.bh_barangay, e.assignedArea) AS barangay_name,
                                                        COALESCE(bh.term_start, e.term_start) AS term_start,
                                                        COALESCE(bh.term_end, e.term_end) AS term_end
                                                    FROM employees e
                                                    LEFT JOIN barangay_heads bh ON e.id = bh.employee_id
                                                    WHERE e.role = 'barangayhead'
                                                        AND LOWER(COALESCE(bh.barangay_assigned, e.bh_barangay, e.assignedArea)) LIKE LOWER(:barangay_like)
                                                    LIMIT 1";
                $stmt = $db->prepare($fallbackQuery);
                $likeParam = '%' . $normalizedBarangay . '%';
                $stmt->bindParam(':barangay_like', $likeParam);
                $stmt->execute();
        }

    if ($stmt->rowCount() > 0) {
        $barangayHead = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode(array(
            'status' => 'success',
            'data' => array(
                'id' => $barangayHead['id'],
                'name' => $barangayHead['fullName'],
                'email' => $barangayHead['email'],
                'phone' => $barangayHead['phone'],
                'barangay' => $barangayHead['barangay_name'],
                'termStart' => $barangayHead['term_start'],
                'termEnd' => $barangayHead['term_end']
            )
        ));
    } else {
        echo json_encode(array(
            'status' => 'error',
            'message' => 'No barangay head found for the specified barangay'
        ));
    }
} catch (PDOException $e) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ));
}
?>
