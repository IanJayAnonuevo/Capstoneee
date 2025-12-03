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

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new Exception('Database connection failed');
    }

    // Get issue counts from issue_reports table
    $issueQuery = "SELECT 
                      COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count,
                      COUNT(CASE WHEN status IN ('pending', 'active', 'open') THEN 1 END) as unresolved_count,
                      COUNT(*) as total_issues
                   FROM issue_reports";
    $issueStmt = $db->prepare($issueQuery);
    $issueStmt->execute();
    $issueData = $issueStmt->fetch(PDO::FETCH_ASSOC);

    $resolvedCount = (int)($issueData['resolved_count'] ?? 0);
    $unresolvedCount = (int)($issueData['unresolved_count'] ?? 0);
    $totalIssues = (int)($issueData['total_issues'] ?? 0);

    // Calculate percentages
    $resolvedPercentage = $totalIssues > 0 ? round(($resolvedCount / $totalIssues) * 100, 1) : 0;
    $unresolvedPercentage = $totalIssues > 0 ? round(($unresolvedCount / $totalIssues) * 100, 1) : 0;

    // Get recent issues (last 10)
    $recentQuery = "SELECT 
                        id as issue_id,
                        issue_type as title,
                        status,
                        created_at,
                        barangay,
                        priority
                    FROM issue_reports
                    ORDER BY created_at DESC
                    LIMIT 10";
    $recentStmt = $db->prepare($recentQuery);
    $recentStmt->execute();
    $recentIssues = $recentStmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepare response
    echo json_encode([
        'success' => true,
        'data' => [
            'resolved_count' => $resolvedCount,
            'unresolved_count' => $unresolvedCount,
            'total_issues' => $totalIssues,
            'resolved_percentage' => $resolvedPercentage,
            'unresolved_percentage' => $unresolvedPercentage,
            'recent_issues' => array_map(function($issue) {
                return [
                    'issue_id' => $issue['issue_id'],
                    'title' => $issue['title'],
                    'status' => $issue['status'],
                    'created_at' => $issue['created_at'],
                    'barangay' => $issue['barangay'],
                    'priority' => $issue['priority']
                ];
            }, $recentIssues)
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
