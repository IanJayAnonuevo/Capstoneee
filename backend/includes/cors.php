<?php
// CORS Headers - Allow all origins for development
// BUT: If headers are already set (e.g., by post_gps.php for credentials), don't override them
if (!headers_sent() && !isset($_SERVER['HTTP_ACCESS_CONTROL_ALLOW_ORIGIN_SET'])) {
  // Allow requests from any localhost origin (e.g., different dev servers/ports)
  // Prefer the request Origin for more strict behavior when available.
  $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

  // Accept any http(s)://localhost or 127.0.0.1 origins regardless of port
  if ($origin !== '*' && (preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#', $origin))) {
    header('Access-Control-Allow-Origin: ' . $origin);
    // If the origin is explicitly echoed back, allow credentials
    header('Access-Control-Allow-Credentials: true');
  } else {
    // For non-localhost origins, be permissive during development
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
