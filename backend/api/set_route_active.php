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
    
    // Read and sanitize existing data (remove stale/duplicate records)
    $existingData = [];
    if (file_exists($filePath)) {
        $content = file_get_contents($filePath);
        if ($content) {
            $existingData = json_decode($content, true) ?? [];
        }
    }

    $nowTs = time();
    $staleCutoff = $nowTs - (12 * 60 * 60); // keep last 12 hours only
    $filtered = [];
    foreach ($existingData as $entry) {
        if (!is_array($entry)) {
            continue;
        }

        $entryRouteId = isset($entry['route_id']) ? (int)$entry['route_id'] : null;
        $entryTeamId = isset($entry['team_id']) ? (int)$entry['team_id'] : null;

        // Drop duplicates for the same route or team
        if ($entryRouteId === (int)$route_id) {
            continue;
        }
        if ($team_id && $entryTeamId === (int)$team_id) {
            continue;
        }

        // Drop stale entries
        $startedAtTs = isset($entry['started_at']) ? strtotime($entry['started_at']) : null;
        if ($startedAtTs && $startedAtTs < $staleCutoff) {
            continue;
        }

        $filtered[] = $entry;
    }

    // Prepend the newest route so it's quick to find
    array_unshift($filtered, $activeRouteData);
    
    // Write back to file
    file_put_contents($filePath, json_encode($filtered, JSON_PRETTY_PRINT));
    
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

