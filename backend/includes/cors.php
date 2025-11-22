<?php
// CORS Headers - Allow all origins for development
// BUT: If headers are already set (e.g., by post_gps.php for credentials), don't override them
if (!headers_sent() && !isset($_SERVER['HTTP_ACCESS_CONTROL_ALLOW_ORIGIN_SET'])) {
  header('Access-Control-Allow-Origin: *');
  header('Content-Type: application/json');
  header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');
}

// Handle preflight OPTIONS request (only if not already handled)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS' && !isset($_SERVER['HTTP_ACCESS_CONTROL_OPTIONS_HANDLED'])) {
    http_response_code(200);
    exit();
}
?>
