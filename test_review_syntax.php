<?php
// Test if review_attendance_request.php has syntax errors

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing review_attendance_request.php syntax...\n\n";

// Try to include the file
$file = __DIR__ . '/backend/api/review_attendance_request.php';

if (!file_exists($file)) {
    die("File not found: $file\n");
}

// Check syntax using php -l
$output = [];
$return_var = 0;
exec("php -l \"$file\" 2>&1", $output, $return_var);

echo "Syntax check result:\n";
echo implode("\n", $output) . "\n";

if ($return_var === 0) {
    echo "\n✅ No syntax errors found!\n";
} else {
    echo "\n❌ Syntax errors detected!\n";
}

// Also check the first few lines
echo "\n\nFirst 10 lines of the file:\n";
echo "=====================================\n";
$lines = file($file);
for ($i = 0; $i < min(10, count($lines)); $i++) {
    printf("%3d: %s", $i + 1, $lines[$i]);
}
