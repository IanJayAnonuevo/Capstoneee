<?php
// CORS headers MUST be set BEFORE _bootstrap.php to override any wildcard headers from cors.php
// Must use specific origin, not wildcard, when credentials are included
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
if (empty($origin) && isset($_SERVER['HTTP_REFERER'])) {
    $referer = parse_url($_SERVER['HTTP_REFERER']);
    if (isset($referer['scheme']) && isset($referer['host'])) {
        $origin = $referer['scheme'] . '://' . $referer['host'];
        if (isset($referer['port'])) {
            $origin .= ':' . $referer['port'];
        }
    }
}
// Fallback for local dev if still empty
if (empty($origin)) {
    $origin = 'http://localhost:5173';
}

// Allow any localhost / 127.0.0.1 origins regardless of port (used by Vite/dev servers)
$allowedIsLocal = ($origin !== '' && preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin) === 1);

// Handle preflight OPTIONS request first
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  // Remove any existing CORS headers that might be set
  if (function_exists('header_remove')) {
    @header_remove('Access-Control-Allow-Origin');
    @header_remove('Access-Control-Allow-Credentials');
  }
  
  if ($origin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
  } else {
    header('Access-Control-Allow-Origin: *');
  }
  
  header('Vary: Origin');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
  http_response_code(204);
  exit;
}

// Set CORS headers for actual request - BEFORE bootstrap to prevent wildcard override
if (function_exists('header_remove')) {
  @header_remove('Access-Control-Allow-Origin');
  @header_remove('Access-Control-Allow-Credentials');
}

if ($origin) {
  header('Access-Control-Allow-Origin: ' . $origin);
  header('Access-Control-Allow-Credentials: true');
} else {
  header('Access-Control-Allow-Origin: *');
}

header('Vary: Origin');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Mark that we've set CORS headers so cors.php doesn't override
$_SERVER['HTTP_ACCESS_CONTROL_ALLOW_ORIGIN_SET'] = true;

// Now include bootstrap (cors.php will check the flag and skip setting wildcard)
require_once __DIR__ . '/_bootstrap.php';
header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../lib/AssignmentResolver.php';

try {
  session_start();

  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Invalid JSON body' ]);
    exit;
  }

  $lat = isset($data['lat']) ? floatval($data['lat']) : null;
  $lng = isset($data['lng']) ? floatval($data['lng']) : null;
  if (!is_finite($lat) || !is_finite($lng) || $lat < -90 || $lat > 90 || $lng < -180 || $lng > 180) {
    http_response_code(422);
    echo json_encode([ 'success' => false, 'message' => 'Invalid lat/lng' ]);
    exit;
  }
  $speed = isset($data['speed']) && is_numeric($data['speed']) ? floatval($data['speed']) : null;
  $heading = isset($data['heading']) && is_numeric($data['heading']) ? floatval($data['heading']) : null;
  $accuracy = isset($data['accuracy']) && is_numeric($data['accuracy']) ? floatval($data['accuracy']) : null;
  $battery = isset($data['battery']) && is_numeric($data['battery']) ? intval($data['battery']) : null;

  // Determine driver from session or query for testing
  $driverId = isset($_SESSION['user_id']) ? intval($_SESSION['user_id']) : intval($_GET['driver_id'] ?? 0);
  if ($driverId <= 0) {
    http_response_code(400);
    echo json_encode([ 'success' => false, 'message' => 'Missing driver session' ]);
    exit;
  }

  $db = (new Database())->connect();
  $resolver = new AssignmentResolver($db);
  $assignment = $resolver->resolveForDriver($driverId);
  $teamId = $assignment['team_id'] ?? null;
  $truckId = $assignment['truck_id'] ?? null;

  // Calculate truck status based on speed
  $truckStatus = 'idle'; // default
  if ($speed !== null) {
    if ($speed > 5) {
      $truckStatus = 'moving';
    }
  }

  // Insert into gps_route_log with new fields
  $sql = "INSERT INTO gps_route_log (team_id, latitude, longitude, timestamp, speed, accuracy, heading, battery, driver_id, truck_id, truck_status)
          VALUES (:team_id, :lat, :lng, NOW(), :speed, :accuracy, :heading, :battery, :driver_id, :truck_id, :truck_status)";
  $stmt = $db->prepare($sql);
  $stmt->execute([
    ':team_id' => $teamId,
    ':lat' => $lat,
    ':lng' => $lng,
    ':speed' => $speed,
    ':accuracy' => $accuracy,
    ':heading' => $heading,
    ':battery' => $battery,
    ':driver_id' => $driverId,
    ':truck_id' => $truckId,
    ':truck_status' => $truckStatus,
  ]);

  echo json_encode([ 'success' => true, 'inserted_id' => $db->lastInsertId(), 'assignment' => $assignment ]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode([ 'success' => false, 'message' => $e->getMessage() ]);
}

?>


