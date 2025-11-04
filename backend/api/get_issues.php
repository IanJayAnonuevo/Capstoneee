<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $database = new Database();
    $db = $database->connect();

    try {
        $columnsStmt = $db->query("SHOW COLUMNS FROM issue_reports");
        $columnMap = [];
        if ($columnsStmt) {
            while ($column = $columnsStmt->fetch(PDO::FETCH_ASSOC)) {
                if (isset($column['Field'])) {
                    $columnMap[strtolower($column['Field'])] = true;
                }
            }
        }

        $hasColumn = static function (array $map, string $column): bool {
            return isset($map[strtolower($column)]);
        };

        // Debug: Check if there are any records in the table
        $countQuery = "SELECT COUNT(*) as total FROM issue_reports";
        $countStmt = $db->query($countQuery);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

        $selectParts = [
            'ir.id',
            'ir.issue_type',
            'ir.description',
            'ir.photo_url',
            'ir.created_at',
            $hasColumn($columnMap, 'status') ? 'ir.status' : "NULL AS status",
            $hasColumn($columnMap, 'reporter_id') ? 'ir.reporter_id' : "NULL AS reporter_id",
            $hasColumn($columnMap, 'resolution_notes') ? 'ir.resolution_notes' : "NULL AS resolution_notes",
            $hasColumn($columnMap, 'resolution_photo_url') ? 'ir.resolution_photo_url' : "NULL AS resolution_photo_url",
            $hasColumn($columnMap, 'resolved_at') ? 'ir.resolved_at' : "NULL AS resolved_at",
            $hasColumn($columnMap, 'resolved_by') ? 'ir.resolved_by' : "NULL AS resolved_by",
            'up.firstname',
            'up.lastname',
            'b.barangay_name',
            'resolver.firstname AS resolver_firstname',
            'resolver.lastname AS resolver_lastname'
        ];

        $query = "SELECT " . implode(",\n                    ", $selectParts) . "
                FROM issue_reports ir
                LEFT JOIN user_profile up ON ir.reporter_id = up.user_id
                LEFT JOIN barangay b ON up.barangay_id = b.barangay_id
                LEFT JOIN user_profile resolver ON ir.resolved_by = resolver.user_id";

        // Add WHERE clause based on status
        if (isset($_GET['status'])) {
            $requestedStatus = strtolower(trim($_GET['status']));

            if ($requestedStatus === 'resolved') {
                $query .= " WHERE ir.status = 'resolved'";
            } elseif ($requestedStatus === 'active') {
                $query .= " WHERE (ir.status = 'active' OR ir.status = 'open' OR ir.status IS NULL)";
            } elseif ($requestedStatus === 'closed') {
                $query .= " WHERE ir.status = 'closed'";
            } elseif ($requestedStatus === 'pending') {
                $query .= " WHERE ir.status = 'pending'";
            } elseif ($requestedStatus !== 'all' && $requestedStatus !== '') {
                $query .= " WHERE ir.status = :status_filter";
            }
        }

        $query .= " ORDER BY ir.created_at DESC";

        // Debug: Log the query being executed
        error_log("Executing query: " . $query);

        $stmt = $db->prepare($query);

        if (isset($requestedStatus) && !in_array($requestedStatus, ['resolved', 'active', 'closed', 'pending', 'all', ''], true)) {
            $stmt->bindValue(':status_filter', $requestedStatus);
        }

        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            $issues = array();
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $reporterName = trim(($row['firstname'] ?? '') . ' ' . ($row['lastname'] ?? ''));
                $resolverName = trim(($row['resolver_firstname'] ?? '') . ' ' . ($row['resolver_lastname'] ?? ''));

                $issue = array(
                    'id' => $row['id'],
                    'name' => $reporterName !== '' ? $reporterName : 'Anonymous Reporter',
                    'barangay' => $row['barangay_name'] ?? 'Unspecified',
                    'issue_type' => $row['issue_type'],
                    'description' => $row['description'],
                    'photo_url' => $row['photo_url'],
                    'created_at' => $row['created_at'],
                    'status' => $row['status'] ?? 'active',
                    'resolution_notes' => $row['resolution_notes'] ?? null,
                    'resolution_photo_url' => $row['resolution_photo_url'] ?? null,
                    'resolved_at' => $row['resolved_at'] ?? null,
                    'resolved_by' => $row['resolved_by'] ?? null,
                    'resolved_by_name' => $resolverName !== '' ? $resolverName : null
                );

                array_push($issues, $issue);
            }

            echo json_encode([
                'status' => 'success',
                'total_records' => $totalCount,
                'filtered_count' => count($issues),
                'data' => $issues
            ]);
        } else {
            echo json_encode([
                'status' => 'success',
                'total_records' => $totalCount,
                'filtered_count' => 0,
                'data' => []
            ]);
        }
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        echo json_encode([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}
