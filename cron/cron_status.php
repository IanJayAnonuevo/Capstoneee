<?php
/**
 * Cron Job Status Dashboard
 * Shows the status of all cron jobs and recent execution logs
 * 
 * URL: https://kolektrash.systemproj.com/cron/cron_status.php
 */

date_default_timezone_set('Asia/Manila');

// Log files
$logs = [
    'Morning (6 AM)' => __DIR__ . '/../logs/cron_morning.log',
    'Afternoon (2 PM)' => __DIR__ . '/../logs/cron_afternoon.log',
    'Auto-Generate (11 PM)' => __DIR__ . '/../logs/cron_auto_generate.log'
];

// Database connection for stats
require_once __DIR__ . '/../backend/config/database.php';
$database = new Database();
$db = $database->connect();

$today = date('Y-m-d');

// Get today's task count
$stmt = $db->prepare("
    SELECT COUNT(*) as count 
    FROM collection_team ct 
    LEFT JOIN collection_schedule cs ON ct.schedule_id = cs.schedule_id 
    WHERE cs.scheduled_date = ?
");
$stmt->execute([$today]);
$todayTasks = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

// Get today's route count
$stmt = $db->prepare("SELECT COUNT(*) as count FROM daily_route WHERE date = ?");
$stmt->execute([$today]);
$todayRoutes = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cron Job Status - KolekTrash</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .header {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            margin-bottom: 20px;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
        }
        .timestamp {
            color: #666;
            font-size: 14px;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .stat-card h3 {
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }
        .stat-card .value {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
        }
        .log-section {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .log-section h2 {
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #667eea;
        }
        .log-content {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            max-height: 300px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.6;
            white-space: pre-wrap;
        }
        .no-log {
            color: #999;
            font-style: italic;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .endpoints {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .endpoints h2 {
            color: #333;
            margin-bottom: 15px;
        }
        .endpoint {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
        }
        .endpoint h3 {
            color: #667eea;
            font-size: 16px;
            margin-bottom: 5px;
        }
        .endpoint a {
            color: #007bff;
            text-decoration: none;
            word-break: break-all;
        }
        .endpoint a:hover {
            text-decoration: underline;
        }
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-top: 10px;
        }
        button:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🕐 Cron Job Status Dashboard</h1>
            <p class="timestamp">Last updated: <?= date('F d, Y h:i:s A') ?></p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <h3>Today's Tasks</h3>
                <div class="value"><?= $todayTasks ?></div>
            </div>
            <div class="stat-card">
                <h3>Today's Routes</h3>
                <div class="value"><?= $todayRoutes ?></div>
            </div>
            <div class="stat-card">
                <h3>Current Date</h3>
                <div class="value" style="font-size: 20px;"><?= date('M d, Y') ?></div>
            </div>
        </div>

        <?php foreach ($logs as $name => $logFile): ?>
        <div class="log-section">
            <h2><?= $name ?></h2>
            <div class="log-content">
                <?php
                if (file_exists($logFile)) {
                    $content = file_get_contents($logFile);
                    $lines = explode("\n", $content);
                    $recent = array_slice($lines, -50); // Last 50 lines
                    echo htmlspecialchars(implode("\n", $recent));
                } else {
                    echo '<span class="no-log">No log file found</span>';
                }
                ?>
            </div>
        </div>
        <?php endforeach; ?>

        <div class="endpoints">
            <h2>📡 Cron Job Endpoints</h2>
            
            <div class="endpoint">
                <h3>Morning Generation (6:00 AM)</h3>
                <a href="morning_generate_http.php" target="_blank">
                    https://kolektrash.systemproj.com/cron/morning_generate_http.php
                </a>
                <br>
                <button onclick="testEndpoint('morning_generate_http.php')">Test Now</button>
            </div>

            <div class="endpoint">
                <h3>Afternoon Generation (2:00 PM)</h3>
                <a href="afternoon_generate_http.php" target="_blank">
                    https://kolektrash.systemproj.com/cron/afternoon_generate_http.php
                </a>
                <br>
                <button onclick="testEndpoint('afternoon_generate_http.php')">Test Now</button>
            </div>

            <div class="endpoint">
                <h3>Specific Date Generation</h3>
                <a href="generate_specific_date.php?date=<?= $today ?>" target="_blank">
                    https://kolektrash.systemproj.com/cron/generate_specific_date.php?date=<?= $today ?>
                </a>
                <br>
                <button onclick="testEndpoint('generate_specific_date.php?date=<?= $today ?>')">Test Now</button>
            </div>
        </div>
    </div>

    <script>
        function testEndpoint(url) {
            window.open(url, '_blank');
            setTimeout(() => {
                if (confirm('Test completed. Refresh this page to see updated logs?')) {
                    location.reload();
                }
            }, 2000);
        }
    </script>
</body>
</html>
