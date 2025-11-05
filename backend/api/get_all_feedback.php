<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
    exit();
}

$database = new Database();
$db = $database->connect();

try {
    $feedbackColumnsStmt = $db->query('SHOW COLUMNS FROM feedback');
    $feedbackColumnsData = $feedbackColumnsStmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($feedbackColumnsData)) {
        throw new RuntimeException('Feedback table has no columns.');
    }

    $feedbackLookup = [];
    foreach ($feedbackColumnsData as $column) {
        $feedbackLookup[strtolower($column['Field'])] = $column['Field'];
    }

    $resolveFeedbackColumn = static function (array $candidates) use ($feedbackLookup) {
        foreach ($candidates as $candidate) {
            $key = strtolower($candidate);
            if (isset($feedbackLookup[$key])) {
                return $feedbackLookup[$key];
            }
        }
        return null;
    };

    $quoteIdentifier = static function (?string $identifier) {
        if ($identifier === null || $identifier === '') {
            return null;
        }
        return '`' . str_replace('`', '', $identifier) . '`';
    };

    $feedbackMap = [
        'id' => $resolveFeedbackColumn(['id', 'feedback_id', 'feedbackid']),
        'user_id' => $resolveFeedbackColumn(['user_id', 'resident_id', 'account_id']),
        'name' => $resolveFeedbackColumn(['user_name', 'name', 'resident_name', 'full_name', 'fullname', 'user_fullname', 'resident_fullname', 'customer_name']),
        'barangay' => $resolveFeedbackColumn(['barangay', 'barangay_name', 'resident_barangay', 'barangayid', 'barangay_id']),
        'rating' => $resolveFeedbackColumn(['rating', 'score', 'stars']),
        'message' => $resolveFeedbackColumn(['message', 'feedback', 'feedback_message', 'comments', 'remarks']),
        'feedback_type' => $resolveFeedbackColumn(['feedback_type', 'type', 'category', 'feedbacktype']),
        'status' => $resolveFeedbackColumn(['status', 'feedback_status']),
        'date_submitted' => $resolveFeedbackColumn(['date_submitted', 'submitted_at', 'created_at', 'created', 'date'])
    ];

    $selectParts = [];

    $idExpr = $feedbackMap['id'] ? 'f.' . $quoteIdentifier($feedbackMap['id']) : 'NULL';
    $selectParts[] = $idExpr . ' AS id';

    $userIdExpr = $feedbackMap['user_id'] ? 'f.' . $quoteIdentifier($feedbackMap['user_id']) : 'NULL';
    $selectParts[] = $userIdExpr . ' AS user_id';

    if ($feedbackMap['name']) {
        $nameExpr = 'NULLIF(TRIM(f.' . $quoteIdentifier($feedbackMap['name']) . '), \'\')';
    } else {
        $nameExpr = 'NULL';
    }
    $selectParts[] = 'COALESCE(' . $nameExpr . ", 'Anonymous User') AS user_name";

    if ($feedbackMap['barangay']) {
        $barangayExpr = 'NULLIF(TRIM(f.' . $quoteIdentifier($feedbackMap['barangay']) . '), \'\')';
    } else {
        $barangayExpr = 'NULL';
    }
    $selectParts[] = 'COALESCE(' . $barangayExpr . ", 'Not specified') AS barangay";

    $ratingExpr = $feedbackMap['rating'] ? 'f.' . $quoteIdentifier($feedbackMap['rating']) : 'NULL';
    $selectParts[] = $ratingExpr . ' AS rating';

    if ($feedbackMap['message']) {
        $messageExpr = 'NULLIF(TRIM(f.' . $quoteIdentifier($feedbackMap['message']) . '), \'\')';
    } else {
        $messageExpr = 'NULL';
    }
    $selectParts[] = 'COALESCE(' . $messageExpr . ", 'No feedback message provided.') AS message";

    if ($feedbackMap['feedback_type']) {
        $typeExpr = 'NULLIF(TRIM(f.' . $quoteIdentifier($feedbackMap['feedback_type']) . '), \'\')';
    } else {
        $typeExpr = 'NULL';
    }
    $selectParts[] = 'COALESCE(' . $typeExpr . ", 'General Feedback') AS type";

    $dateExpr = $feedbackMap['date_submitted'] ? 'f.' . $quoteIdentifier($feedbackMap['date_submitted']) : 'NULL';
    $selectParts[] = $dateExpr . ' AS date_submitted';

    $query = "SELECT \n        " . implode(",\n        ", $selectParts) . "\n    FROM feedback f";

    $conditions = [];
    if ($feedbackMap['status']) {
        $conditions[] = 'f.' . $quoteIdentifier($feedbackMap['status']) . " = 'active'";
    }

    if (!empty($conditions)) {
        $query .= "\n    WHERE " . implode(' AND ', $conditions);
    }

    $orderColumn = null;
    if ($feedbackMap['date_submitted']) {
        $orderColumn = 'f.' . $quoteIdentifier($feedbackMap['date_submitted']);
    } elseif ($feedbackMap['id']) {
        $orderColumn = 'f.' . $quoteIdentifier($feedbackMap['id']);
    }

    if ($orderColumn) {
        $query .= "\n    ORDER BY {$orderColumn} DESC";
    }

    $stmt = $db->prepare($query);
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $normalized = array_map(static function ($row) {
        $ratingValue = $row['rating'] ?? null;
        $rating = null;
        if ($ratingValue !== null && $ratingValue !== '' && is_numeric($ratingValue)) {
            $rating = (float) $ratingValue;
        }

        $message = isset($row['message']) && trim((string) $row['message']) !== ''
            ? trim((string) $row['message'])
            : 'No feedback message provided.';

        $type = isset($row['type']) && trim((string) $row['type']) !== ''
            ? trim((string) $row['type'])
            : 'General Feedback';

        $barangay = isset($row['barangay']) && trim((string) $row['barangay']) !== ''
            ? trim((string) $row['barangay'])
            : 'Not specified';

        $userName = isset($row['user_name']) && trim((string) $row['user_name']) !== ''
            ? trim((string) $row['user_name'])
            : 'Anonymous User';

        $id = $row['id'] ?? null;
        if ($id !== null && is_numeric($id)) {
            $id = (int) $id;
        }

        $userId = $row['user_id'] ?? null;
        if ($userId !== null && is_numeric($userId)) {
            $userId = (int) $userId;
        }

        $dateSubmitted = $row['date_submitted'] ?? null;

        return [
            'id' => $id,
            'userId' => $userId,
            'userName' => $userName,
            'barangay' => $barangay,
            'rating' => $rating,
            'message' => $message,
            'type' => $type,
            'date' => $dateSubmitted,
            'date_submitted' => $dateSubmitted
        ];
    }, $rows);

    echo json_encode([
        'status' => 'success',
        'data' => $normalized,
        'count' => count($normalized)
    ]);
} catch (Throwable $exception) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $exception->getMessage()
    ]);
}
?>
