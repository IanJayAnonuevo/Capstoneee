<?php
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
    $barangay = $input['barangay'] ?? '';
    $team_id = $input['team_id'] ?? 1;
    
    if (!$route_id) {
        echo json_encode(['success' => false, 'message' => 'Route ID is required']);
        exit;
    }
    
    // Create a simple file-based storage for active routes
    $activeRouteData = [
        'route_id' => $route_id,
        'barangay' => $barangay,
        'team_id' => $team_id,
        'status' => 'in_progress',
        'started_at' => date('Y-m-d H:i:s')
    ];
    
    // Write to a simple JSON file
    $filePath = '../../storage/active_routes.json';
    
    // Create storage directory if it doesn't exist
    $storageDir = '../../storage';
    if (!is_dir($storageDir)) {
        mkdir($storageDir, 0755, true);
    }
    
    // Read existing data
    $existingData = [];
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        if ($content) {
            $existingData = json_decode($content, true) ?? [];
        }
    }
    
    // Add new active route
    $existingData[] = $activeRouteData;
    
    // Write back to file
    file_put_contents($filePath, json_encode($existingData));
    
    echo json_encode([
        'success' => true,
        'message' => 'Route marked as active',
        'data' => $activeRouteData
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>

