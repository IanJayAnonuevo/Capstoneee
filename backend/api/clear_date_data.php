<?php
/**
 * Clear all tasks and routes for a specific date
 * URL: https://kolektrash.systemproj.com/backend/api/clear_date_data.php?date=2025-12-01
 */

header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    $date = $_GET['date'] ?? null;
    
    if (!$date) {
        throw new Exception('Date parameter is required');
    }
    
    // Validate date format
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
        throw new Exception('Invalid date format. Use YYYY-MM-DD');
    }
    
    $db->beginTransaction();
    
    // Temporarily disable foreign key checks
    $db->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    $deletedCounts = [];
    
    // Delete in simple order - foreign keys are disabled
    
    // 1. Delete route stops
    $stmt = $db->prepare("
        DELETE drs FROM daily_route_stop drs
        INNER JOIN daily_route dr ON drs.daily_route_id = dr.id
        WHERE dr.date = ?
    ");
    $stmt->execute([$date]);
    $deletedCounts['route_stops'] = $stmt->rowCount();
    
    // 2. Delete daily routes
    $stmt = $db->prepare("DELETE FROM daily_route WHERE date = ?");
    $stmt->execute([$date]);
    $deletedCounts['routes'] = $stmt->rowCount();
    
    // 3. Delete collection team members
    $stmt = $db->prepare("
        DELETE ctm FROM collection_team_member ctm
        INNER JOIN collection_team ct ON ctm.team_id = ct.team_id
        INNER JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
        WHERE cs.scheduled_date = ?
    ");
    $stmt->execute([$date]);
    $deletedCounts['team_members'] = $stmt->rowCount();
    
    // 4. Delete collection teams
    $stmt = $db->prepare("
        DELETE ct FROM collection_team ct
        INNER JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id
        WHERE cs.scheduled_date = ?
    ");
    $stmt->execute([$date]);
    $deletedCounts['teams'] = $stmt->rowCount();
    
    // 5. Delete collection schedules
    $stmt = $db->prepare("DELETE FROM collection_schedule WHERE scheduled_date = ?");
    $stmt->execute([$date]);
    $deletedCounts['schedules'] = $stmt->rowCount();
    
    // Re-enable foreign key checks
    $db->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    $db->commit();
    
    echo json_encode([
        'success' => true,
        'message' => "All data cleared for $date",
        'deleted' => $deletedCounts
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    if ($db && $db->inTransaction()) {
        $db->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
