<?php
require_once __DIR__ . '/backend/config/database.php';
require_once __DIR__ . '/backend/lib/RouteGenerator.php';
$db = (new Database())->connect();
$result = generateDailyRoutes($db, '2025-11-24', 'preserve_manual', 'all', null);
print_r($result);
