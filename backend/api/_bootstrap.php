<?php
// Load CORS and authentication helpers once for all API endpoints.
require_once __DIR__ . '/../includes/cors.php';
require_once __DIR__ . '/../includes/auth.php';

// Enforce access rules defined in config/rbac.php for the current script
kolektrash_enforce_access_for_script();
