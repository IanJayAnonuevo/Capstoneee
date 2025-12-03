<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $pdo = $database->connect();

    if (!$pdo) {
        throw new RuntimeException('Database connection failed.');
    }

    // Fetch ALL schedules from predefined_schedules table (recurring weekly schedule)
    $stmt = $pdo->prepare("
        SELECT 
            ps.schedule_template_id as id,
            ps.day_of_week as day,
            ps.start_time as time,
            b.barangay_name as barangay,
            b.cluster_id,
            c.cluster_name,
            ps.week_of_month
        FROM predefined_schedules ps
        LEFT JOIN barangay b ON ps.barangay_id = b.barangay_id
        LEFT JOIN cluster c ON b.cluster_id = c.cluster_id
        WHERE ps.is_active = 1
        ORDER BY 
            FIELD(ps.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
            ps.start_time ASC
    ");
    
    $stmt->execute();
    $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'schedules' => $schedules,
        'count' => count($schedules)
    ]);

} catch (Throwable $e) {
    $errorMessage = $e->getMessage();
    $errorFile = $e->getFile();
    $errorLine = $e->getLine();
    $errorTrace = $e->getTraceAsString();
    
    error_log("Get all schedules error: $errorMessage in $errorFile:$errorLine");
    error_log("Stack trace: $errorTrace");
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch schedules: ' . $errorMessage,
        'debug' => [
            'file' => $errorFile,
            'line' => $errorLine,
            'trace' => explode("\n", $errorTrace)
        ]
    ]);
}
?>
