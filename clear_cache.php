<?php
/**
 * Clear OpCache on Hostinger
 * Upload this to: /public_html/clear_cache.php
 * Then visit: https://kolektrash.systemproj.com/clear_cache.php
 */

echo "<h2>🔧 Cache Clearing Tool</h2>";

// Clear OpCache
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "<p>✅ <strong>OpCache cleared successfully!</strong></p>";
} else {
    echo "<p>ℹ️ OpCache not enabled on this server</p>";
}

// Clear APCu cache if available
if (function_exists('apcu_clear_cache')) {
    apcu_clear_cache();
    echo "<p>✅ <strong>APCu cache cleared!</strong></p>";
}

// Show PHP version and loaded extensions
echo "<hr>";
echo "<h3>Server Info:</h3>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>OpCache Enabled:</strong> " . (function_exists('opcache_reset') ? 'Yes' : 'No') . "</p>";

// Verify the updated file
echo "<hr>";
echo "<h3>Verification:</h3>";

if (file_exists(__DIR__ . '/backend/lib/AttendanceAssignment.php')) {
    $fileContent = file_get_contents(__DIR__ . '/backend/lib/AttendanceAssignment.php');
    
    if (strpos($fileContent, 'Need at least 1 approved driver') !== false) {
        echo "<p>✅ <strong>AttendanceAssignment.php updated correctly!</strong></p>";
        echo "<p>   File now requires only 1 driver + 1 collector</p>";
    } else if (strpos($fileContent, 'Need at least 2 approved drivers') !== false) {
        echo "<p>❌ <strong>Old version still present!</strong></p>";
        echo "<p>   File still requires 2 drivers. Please re-upload.</p>";
    } else {
        echo "<p>⚠️ Could not verify file contents</p>";
    }
} else {
    echo "<p>⚠️ AttendanceAssignment.php not found</p>";
}

echo "<hr>";
echo "<p><em>After clearing cache, you can delete this file for security.</em></p>";
?>
