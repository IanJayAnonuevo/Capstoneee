<?php
// CORS Headers - Allow all origins for development
// BUT: If headers are already set (e.g., by post_gps.php for credentials), don't override them
if (!headers_sent() && !isset($_SERVER['HTTP_ACCESS_CONTROL_ALLOW_ORIGIN_SET'])) {
  $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

  if ($origin !== '*' && (
    preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin) ||
    preg_match('#^https://kolektrash\.systemproj\.com$#', $origin) ||
    preg_match('#^https://koletrash\.systemproj\.com$#', $origin)
  )) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
  } else {
    header('Access-Control-Allow-Origin: *');
  }

  header('Content-Type: application/json');
  // Standard methods used by the application
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  // Allow common headers that frontends use in XHR/fetch requests
  header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');
  // Cache preflight responses for a short while
  header('Access-Control-Max-Age: 86400');
}

// Handle preflight OPTIONS request (only if not already handled)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS' && !isset($_SERVER['HTTP_ACCESS_CONTROL_OPTIONS_HANDLED'])) {
  // Make sure we always respond to preflight early so that the real endpoint is not touched
  http_response_code(200);
  // Print a small payload containing the CORS headers so clients can inspect them
  echo json_encode(["status" => "ok", "message" => "CORS preflight handled"]);
  exit();
}
?>
