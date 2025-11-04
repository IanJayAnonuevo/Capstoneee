<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    // Get user_id from query parameters
    $user_id = $_GET['user_id'] ?? null;
    
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'User ID is required']);
        exit;
    }
    
    // Read from file-based storage
    $filePath = '../../storage/active_routes.json';
    $activeRoutes = [];
    
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        if ($content) {
            $data = json_decode($content, true);
            if (is_array($data)) {
                // Filter for active routes (status = 'in_progress')
                $activeRoutes = array_filter($data, function($route) {
                    return isset($route['status']) && $route['status'] === 'in_progress';
                });
            }
        }
    }
    
    echo json_encode([
        'success' => true,
        'active_routes' => array_values($activeRoutes)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
