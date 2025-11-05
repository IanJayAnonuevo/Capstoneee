<?php
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents('php://input'), true) ?? [];
    $route_id = $input['route_id'] ?? null;
    
    if (!$route_id) {
        echo json_encode(['success' => false, 'message' => 'Route ID is required']);
        exit;
    }
    
    // Read existing data
    $filePath = '../../storage/active_routes.json';
    $existingData = [];
    
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        if ($content) {
            $existingData = json_decode($content, true) ?? [];
        }
    }
    
    // Remove the specific route from active routes
    $filteredData = array_filter($existingData, function($route) use ($route_id) {
        return !(isset($route['route_id']) && $route['route_id'] == $route_id);
    });
    
    // Write back to file
    file_put_contents($filePath, json_encode(array_values($filteredData)));
    
    echo json_encode([
        'success' => true,
        'message' => 'Route cleared from active routes',
        'route_id' => $route_id
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>

