<?php
// Simple test to check if auto_generate_all.php has syntax errors
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing auto_generate_all.php syntax...\n\n";

// Try to include the file
try {
    include_once __DIR__ . '/backend/api/auto_generate_all.php';
    echo "✅ File loaded successfully - no syntax errors\n";
} catch (Throwable $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
?>
