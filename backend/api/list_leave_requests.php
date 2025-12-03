<?php
require_once __DIR__ . '/_bootstrap.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    kolektrash_respond_json(405, [
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}

require_once __DIR__ . '/../config/database.php';

try {
    $currentUser = kolektrash_require_auth();
    
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    // Get query parameters
    $status = isset($_GET['status']) ? trim($_GET['status']) : null;
    $mineOnly = isset($_GET['mine_only']) && $_GET['mine_only'] === 'true';
    $dateFrom = isset($_GET['date_from']) ? trim($_GET['date_from']) : null;
    $dateTo = isset($_GET['date_to']) ? trim($_GET['date_to']) : null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;

    // Validate status if provided
    if ($status !== null && !in_array($status, ['pending', 'approved', 'declined'], true)) {
        throw new RuntimeException('Invalid status. Must be: pending, approved, or declined.');
    }

    // Build WHERE clause
    $whereConditions = [];
    $params = [];

    // Role-based filtering
    if (in_array($currentUser['role'], ['truck_driver', 'garbage_collector'], true)) {
        // Personnel can only see their own requests
        $whereConditions[] = 'lr.user_id = ?';
        $params[] = $currentUser['user_id'];
    } elseif ($currentUser['role'] === 'foreman' || $currentUser['role'] === 'admin') {
        // Foremen and admins can see all requests
        // If mine_only is true, show only requests reviewed by this foreman
        if ($mineOnly && $currentUser['role'] === 'foreman') {
            $whereConditions[] = 'lr.foreman_id = ?';
            $params[] = $currentUser['user_id'];
        }
    } else {
        throw new RuntimeException('Unauthorized to view leave requests.');
    }

    // Status filter
    if ($status !== null) {
        $whereConditions[] = 'lr.request_status = ?';
        $params[] = $status;
    }

    // Date range filters
    if ($dateFrom !== null && $dateFrom !== '' && $dateTo !== null && $dateTo !== '') {
        // Check if leave period overlaps with the date range
        $whereConditions[] = '(lr.start_date <= ? AND lr.end_date >= ?)';
        $params[] = $dateTo;
        $params[] = $dateFrom;
    } elseif ($dateFrom !== null && $dateFrom !== '') {
        $whereConditions[] = 'lr.end_date >= ?';
        $params[] = $dateFrom;
    } elseif ($dateTo !== null && $dateTo !== '') {
        $whereConditions[] = 'lr.start_date <= ?';
        $params[] = $dateTo;
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Ensure limit and offset are integers
    $limit = (int)$limit;
    $offset = (int)$offset;

    // Build main query
    $query = "
        SELECT 
            lr.id,
            lr.user_id,
            lr.leave_type,
            lr.start_date,
            lr.end_date,
            lr.reason,
            lr.document_path,
            lr.request_status,
            lr.foreman_id,
            lr.review_note,
            lr.submitted_at,
            lr.reviewed_at,
            u.username,
            u.role_id,
            COALESCE(CONCAT(TRIM(up.firstname), ' ', TRIM(up.lastname)), u.username) AS personnel_name,
            CASE 
                WHEN u.role_id = 3 THEN 'Truck Driver'
                WHEN u.role_id = 4 THEN 'Garbage Collector'
                ELSE 'Unknown'
            END AS role_name,
            f.username AS foreman_username,
            COALESCE(CONCAT(TRIM(fp.firstname), ' ', TRIM(fp.lastname)), f.username) AS foreman_name
        FROM leave_request lr
        INNER JOIN user u ON lr.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN user f ON lr.foreman_id = f.user_id
        LEFT JOIN user_profile fp ON f.user_id = fp.user_id
        {$whereClause}
        ORDER BY lr.submitted_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count for pagination
    $countQuery = "
        SELECT COUNT(*) as total
        FROM leave_request lr
        INNER JOIN user u ON lr.user_id = u.user_id
        {$whereClause}
    ";

    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Build document URLs
    foreach ($requests as &$request) {
        if ($request['document_path']) {
            $request['document_url'] = $request['document_path'];
        } else {
            $request['document_url'] = null;
        }
    }

    kolektrash_respond_json(200, [
        'status' => 'success',
        'data' => [
            'requests' => $requests,
            'pagination' => [
                'total' => $total,
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $total
            ]
        ]
    ]);
} catch (Throwable $e) {
    kolektrash_respond_json(400, [
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
