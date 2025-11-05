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

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Method not allowed'
    ));
    exit();
}

// Get user ID from query parameters
$user_id = $_GET['user_id'] ?? null;
$user_role = $_GET['role'] ?? null;
$status = $_GET['status'] ?? null;

if (!$user_id) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'User ID is required'
    ));
    exit();
}

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

try {
    // Inspect available columns so the query stays compatible with older schemas
    $columns = [];
    try {
        $columnStmt = $db->query("SHOW COLUMNS FROM issue_reports");
        $columns = $columnStmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (PDOException $columnError) {
        error_log('Column inspection failed in get_user_issue_reports.php: ' . $columnError->getMessage());
    }

    $hasColumn = function ($name) use ($columns) {
        return in_array($name, $columns, true);
    };

    $selectFields = [
        'ir.id',
        'ir.issue_type',
        'ir.description',
        'ir.created_at',
        'ir.reporter_id',
        'up.firstname',
        'up.lastname',
        'b.barangay_name',
        'resolver.firstname AS resolver_firstname',
        'resolver.lastname AS resolver_lastname',
        $hasColumn('photo_url') ? 'ir.photo_url' : 'NULL AS photo_url',
        $hasColumn('resolution_photo_url') ? 'ir.resolution_photo_url' : 'NULL AS resolution_photo_url',
        $hasColumn('resolution_notes') ? 'ir.resolution_notes' : 'NULL AS resolution_notes',
        $hasColumn('resolved_at') ? 'ir.resolved_at' : 'NULL AS resolved_at',
        $hasColumn('resolved_by') ? 'ir.resolved_by' : 'NULL AS resolved_by',
        $hasColumn('status') ? 'ir.status' : "'pending' AS status",
        $hasColumn('priority') ? 'ir.priority' : "'medium' AS priority"
    ];

    // Include location data when available
    if ($hasColumn('exact_location')) {
        $selectFields[] = 'ir.exact_location';
    } elseif ($hasColumn('location')) {
        $selectFields[] = 'ir.location AS exact_location';
    } else {
        $selectFields[] = 'NULL AS exact_location';
    }

    $baseSelect = "SELECT \n            " . implode(",\n            ", $selectFields) . "\n        FROM issue_reports ir\n        LEFT JOIN user_profile up ON ir.reporter_id = up.user_id\n        LEFT JOIN barangay b ON up.barangay_id = b.barangay_id\n        LEFT JOIN user_profile resolver ON ir.resolved_by = resolver.user_id";

    if ($user_role === 'Barangay Head' || $user_role === 'barangay_head') {
        // Barangay heads can see all issues from their barangay
        $query = $baseSelect . "\n        WHERE up.barangay_id = (SELECT barangay_id FROM user_profile WHERE user_id = :user_id)";
    } else {
        // Residents can only see their own issues
        $query = $baseSelect . "\n        WHERE ir.reporter_id = :user_id";
    }
    
    // Add status filter if provided
    if ($status) {
        if ($status === 'resolved') {
            $query .= " AND ir.status = 'resolved'";
        } else if ($status === 'closed') {
            $query .= " AND ir.status = 'closed'";
        } else if ($status === 'active') {
            $query .= " AND (ir.status = 'active' OR ir.status = 'open' OR ir.status = 'in-progress' OR ir.status IS NULL)";
        } else if ($status === 'pending') {
            $query .= " AND ir.status = 'pending'";
        } else {
            $query .= " AND ir.status = :status";
        }
    }
    
    $query .= " ORDER BY ir.created_at DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    
    if ($status && !in_array($status, ['resolved', 'active', 'closed', 'pending'], true)) {
        $stmt->bindParam(':status', $status);
    }
    
    $stmt->execute();
    
    $issues = array();
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Handle photo URL - make sure it's a full URL
        $photo_url = $row['photo_url'];
        if ($photo_url && strpos($photo_url, 'http') !== 0) {
            $photo_url = 'https://kolektrash.systemproj.com/' . ltrim($photo_url, '/');
        }
        
        // Handle resolution photo URL
        $resolution_photo_url = $row['resolution_photo_url'];
        if ($resolution_photo_url && strpos($resolution_photo_url, 'http') !== 0) {
            $resolution_photo_url = 'https://kolektrash.systemproj.com/' . ltrim($resolution_photo_url, '/');
        }
        
        $resolverName = trim(($row['resolver_firstname'] ?? '') . ' ' . ($row['resolver_lastname'] ?? ''));

        $issue = array(
            'id' => $row['id'],
            'name' => trim($row['firstname'] . ' ' . $row['lastname']),
            'barangay' => $row['barangay_name'],
            'issue_type' => $row['issue_type'],
            'description' => $row['description'],
            'photo_url' => $photo_url,
            'resolution_photo_url' => $resolution_photo_url,
            'resolution_notes' => $row['resolution_notes'],
            'resolved_at' => $row['resolved_at'],
            'resolved_by' => $row['resolved_by'],
            'resolved_by_name' => $resolverName !== '' ? $resolverName : null,
            'created_at' => $row['created_at'],
            'status' => $row['status'] ?? 'pending',
            'priority' => $row['priority'] ?? 'medium'
        );
        array_push($issues, $issue);
    }
    
    echo json_encode(array(
        'status' => 'success',
        'data' => $issues,
        'count' => count($issues)
    ));
    
} catch (PDOException $e) {
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ));
}
?>


