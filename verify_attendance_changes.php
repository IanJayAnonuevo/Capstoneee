<?php
/**
 * Clear PHP OpCache and verify AttendanceAssignment.php changes
 */

// Clear opcache if enabled
if (function_exists('opcache_reset')) {
    opcache_reset();
    echo "✅ OpCache cleared successfully\n";
} else {
    echo "ℹ️ OpCache not enabled\n";
}

// Verify the file contents
require_once __DIR__ . '/backend/lib/AttendanceAssignment.php';

echo "\n📋 Testing buildSessionSnapshot function:\n";
echo "================================\n\n";

// Test 1: Single driver, single collector (should work now)
echo "Test 1: 1 driver + 1 collector (Minimal Mode)\n";
try {
    $testDrivers = [
        ['user_id' => 1, 'full_name' => 'Test Driver', 'attendance_id' => 1]
    ];
    $testCollectors = [
        ['user_id' => 2, 'full_name' => 'Test Collector', 'attendance_id' => 2]
    ];
    
    $snapshot = buildSessionSnapshot($testDrivers, $testCollectors);
    
    echo "✅ SUCCESS! Snapshot created:\n";
    echo "   - Priority Driver: " . $snapshot['drivers']['priority']['full_name'] . "\n";
    echo "   - Clustered Driver: " . ($snapshot['drivers']['clustered'] ? $snapshot['drivers']['clustered']['full_name'] : 'NULL') . "\n";
    echo "   - Priority Collectors: " . count($snapshot['collectors']['priority']) . "\n";
    echo "   - Clustered Collectors: " . count($snapshot['collectors']['clustered']) . "\n";
    echo "   - Minimal Mode: " . ($snapshot['minimal_mode'] ? 'YES' : 'NO') . "\n";
    
} catch (RuntimeException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "\n";
}

echo "\n";

// Test 2: Two drivers, two collectors (should work)
echo "Test 2: 2 drivers + 2 collectors (Full Mode)\n";
try {
    $testDrivers = [
        ['user_id' => 1, 'full_name' => 'Driver 1', 'attendance_id' => 1],
        ['user_id' => 2, 'full_name' => 'Driver 2', 'attendance_id' => 2]
    ];
    $testCollectors = [
        ['user_id' => 3, 'full_name' => 'Collector 1', 'attendance_id' => 3],
        ['user_id' => 4, 'full_name' => 'Collector 2', 'attendance_id' => 4]
    ];
    
    $snapshot = buildSessionSnapshot($testDrivers, $testCollectors);
    
    echo "✅ SUCCESS! Snapshot created:\n";
    echo "   - Priority Driver: " . $snapshot['drivers']['priority']['full_name'] . "\n";
    echo "   - Clustered Driver: " . ($snapshot['drivers']['clustered'] ? $snapshot['drivers']['clustered']['full_name'] : 'NULL') . "\n";
    echo "   - Priority Collectors: " . count($snapshot['collectors']['priority']) . "\n";
    echo "   - Clustered Collectors: " . count($snapshot['collectors']['clustered']) . "\n";
    echo "   - Minimal Mode: " . ($snapshot['minimal_mode'] ? 'YES' : 'NO') . "\n";
    
} catch (RuntimeException $e) {
    echo "❌ FAILED: " . $e->getMessage() . "\n";
}

echo "\n================================\n";
echo "✅ Verification complete!\n";
?>
