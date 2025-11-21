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
        $whereConditions[] = 'ar.user_id = ?';
        $params[] = $currentUser['user_id'];
    } elseif ($currentUser['role'] === 'foreman' || $currentUser['role'] === 'admin') {
        // Foremen and admins can see all requests
        // If mine_only is true, show only requests reviewed by this foreman
        if ($mineOnly && $currentUser['role'] === 'foreman') {
            $whereConditions[] = 'ar.foreman_id = ?';
            $params[] = $currentUser['user_id'];
        }
    } else {
        throw new RuntimeException('Unauthorized to view attendance requests.');
    }

    // Status filter
    if ($status !== null) {
        $whereConditions[] = 'ar.request_status = ?';
        $params[] = $status;
    }

    // Date range filters
    if ($dateFrom !== null && $dateFrom !== '' && $dateTo !== null && $dateTo !== '') {
        // If both dates are the same, use exact date match
        if ($dateFrom === $dateTo) {
            $whereConditions[] = 'DATE(ar.submitted_at) = ?';
            $params[] = $dateFrom;
        } else {
            // Date range
            $whereConditions[] = 'DATE(ar.submitted_at) >= ?';
            $params[] = $dateFrom;
            $whereConditions[] = 'DATE(ar.submitted_at) <= ?';
            $params[] = $dateTo;
        }
    } elseif ($dateFrom !== null && $dateFrom !== '') {
        // Only from date
        $whereConditions[] = 'DATE(ar.submitted_at) >= ?';
        $params[] = $dateFrom;
    } elseif ($dateTo !== null && $dateTo !== '') {
        // Only to date
        $whereConditions[] = 'DATE(ar.submitted_at) <= ?';
        $params[] = $dateTo;
    }

    $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';

    // Ensure limit and offset are integers (LIMIT/OFFSET cannot be bound as parameters)
    $limit = (int)$limit;
    $offset = (int)$offset;

    // Build main query
    $query = "
        SELECT 
            ar.id,
            ar.user_id,
            ar.schedule_id,
            ar.photo_path,
            ar.remarks,
            ar.request_status,
            ar.foreman_id,
            ar.review_note,
            ar.submitted_at,
            ar.reviewed_at,
            ar.location_lat,
            ar.location_lng,
            u.username,
            u.role_id,
            COALESCE(CONCAT(TRIM(up.firstname), ' ', TRIM(up.lastname)), u.username) AS personnel_name,
            dr.date AS schedule_date,
            dr.barangay_name,
            dr.start_time,
            dr.end_time,
            CASE 
                WHEN u.role_id = 3 THEN 'Truck Driver'
                WHEN u.role_id = 4 THEN 'Garbage Collector'
                ELSE 'Unknown'
            END AS role_name,
            f.username AS foreman_username,
            COALESCE(CONCAT(TRIM(fp.firstname), ' ', TRIM(fp.lastname)), f.username) AS foreman_name
        FROM attendance_request ar
        INNER JOIN user u ON ar.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        LEFT JOIN daily_route dr ON ar.schedule_id = dr.id
        LEFT JOIN user f ON ar.foreman_id = f.user_id
        LEFT JOIN user_profile fp ON f.user_id = fp.user_id
        {$whereClause}
        ORDER BY ar.submitted_at DESC
        LIMIT {$limit} OFFSET {$offset}
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get total count for pagination
    $countQuery = "
        SELECT COUNT(*) as total
        FROM attendance_request ar
        INNER JOIN user u ON ar.user_id = u.user_id
        LEFT JOIN daily_route dr ON ar.schedule_id = dr.id
        {$whereClause}
    ";

    // Use params directly since LIMIT/OFFSET are no longer in the params array
    $countStmt = $pdo->prepare($countQuery);
    $countStmt->execute($params);
    $total = (int)$countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Build photo URLs
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $baseUrl = $protocol . $host . '/kolektrash/';

    foreach ($requests as &$request) {
        if ($request['photo_path']) {
            $request['photo_url'] = $baseUrl . $request['photo_path'];
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

