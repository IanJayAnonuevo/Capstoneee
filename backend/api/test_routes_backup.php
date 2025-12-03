<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: text/html');

echo "<h2>Testing get_routes.php API</h2>";

// Test database connection
require_once '../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    echo "<p style='color: green;'>✓ Database connection successful</p>";
    
    // Test simple query
    $test_query = "SELECT COUNT(*) as count FROM daily_route";
    $stmt = $db->prepare($test_query);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p style='color: green;'>✓ Found {$result['count']} routes in database</p>";
    
    // Test the actual query from get_routes.php
    $query = "SELECT 
                dr.id,
                dr.date,
                dr.cluster_id,
                dr.barangay_id,
                dr.barangay_name,
                dr.truck_id,
                dr.team_id,
                dr.start_time,
                dr.end_time,
                dr.status,
                dr.source,
                dr.version,
                dr.distance_km,
                dr.duration_min,
                dr.capacity_used_kg,
                dr.notes,
                dr.created_at,
                dr.updated_at,
                COUNT(drs.id) as stop_count
              FROM daily_route dr
              LEFT JOIN daily_route_stop drs ON dr.id = drs.daily_route_id
              GROUP BY dr.id, dr.date, dr.cluster_id, dr.barangay_id, dr.barangay_name, 
                       dr.truck_id, dr.team_id, dr.start_time, dr.end_time, dr.status, 
                       dr.source, dr.version, dr.distance_km, dr.duration_min, 
                       dr.capacity_used_kg, dr.notes, dr.created_at, dr.updated_at
              ORDER BY dr.date DESC, dr.start_time ASC
              LIMIT 5";
    
    $stmt = $db->prepare($query);
    $stmt->execute();
    $routes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p style='color: green;'>✓ Query executed successfully, found " . count($routes) . " routes</p>";
    echo "<pre>" . print_r($routes, true) . "</pre>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>✗ Database error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
} catch (Exception $e) {
    echo "<p style='color: red;'>✗ Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}
?>
