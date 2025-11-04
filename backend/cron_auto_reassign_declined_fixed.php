<?php
/**
 * Fixed Automatic Re-assignment for Declined Tasks
 * One replacement collector replaces ALL declined collectors
 */

// Set timezone
date_default_timezone_set('Asia/Manila');

// Log function
function writeLog($message) {
    $logDir = __DIR__ . '/logs';
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $logFile = $logDir . '/cron_auto_reassign_fixed_' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    echo $logMessage; // Also output to console if run via CLI
}

// Check if running via CLI or web
$isCLI = php_sapi_name() === 'cli';

if (!$isCLI) {
    // If running via web, check for authentication token
    $token = $_GET['token'] ?? '';
    $expectedToken = 'kolektrash_auto_generate_2024'; // Change this to a secure token
    
    if ($token !== $expectedToken) {
        http_response_code(403);
        die('Unauthorized access');
    }
    
    // Set headers for web access
    header('Content-Type: application/json');
}

try {
    writeLog("Starting FIXED automatic re-assignment for declined tasks");
    
    // Include database configuration
    require_once __DIR__ . '/config/database.php';
    
    $database = new Database();
    $db = $database->connect();
    $db->beginTransaction();
    
    // Get today's and tomorrow's dates
    $today = date('Y-m-d');
    $tomorrow = date('Y-m-d', strtotime('+1 day'));
    
    writeLog("Checking for declined tasks on $today and $tomorrow");
    
    $totalReassigned = 0;
    $totalDeclined = 0;
    
    // Process both today and tomorrow
    foreach ([$today, $tomorrow] as $checkDate) {
        writeLog("Processing date: $checkDate");
        
        // Find all declined collectors for this date
        $declinedStmt = $db->prepare("
            SELECT DISTINCT ctm.collector_id, u.username, up.firstname, up.lastname
            FROM collection_team_member ctm
            JOIN user u ON u.user_id = ctm.collector_id
            LEFT JOIN user_profile up ON up.user_id = u.user_id
            JOIN collection_team ct ON ct.team_id = ctm.team_id
            JOIN collection_schedule cs ON cs.schedule_id = ct.schedule_id
            WHERE cs.scheduled_date = ? 
            AND ctm.response_status = 'declined'
        ");
        $declinedStmt->execute([$checkDate]);
        $declinedCollectors = $declinedStmt->fetchAll(PDO::FETCH_ASSOC);
        
        writeLog("Found " . count($declinedCollectors) . " unique declined collectors on $checkDate");
        
        if (count($declinedCollectors) > 0) {
            // Find ONE replacement collector for ALL declined collectors
            // STRICT: Only use collectors who are NOT assigned to ANY task for that day
            $replacementStmt = $db->prepare("
                SELECT u.user_id, up.firstname, up.lastname
                FROM user u
                LEFT JOIN user_profile up ON up.user_id = u.user_id
                WHERE u.role_id = 4 
                AND (up.status IN ('active', 'online') OR up.status IS NULL)
                AND u.user_id NOT IN (
                    SELECT DISTINCT ctm2.collector_id 
                    FROM collection_team_member ctm2
                    JOIN collection_team ct2 ON ct2.team_id = ctm2.team_id
                    JOIN collection_schedule cs2 ON cs2.schedule_id = ct2.schedule_id
                    WHERE cs2.scheduled_date = ?
                )
                LIMIT 1
            ");
            $replacementStmt->execute([$checkDate]);
            $replacement = $replacementStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($replacement) {
                $replacementId = $replacement['user_id'];
                $replacementName = $replacement['firstname'] . ' ' . $replacement['lastname'];
                
                writeLog("Found replacement collector: $replacementName (ID: $replacementId)");
                
                // Replace ALL declined collectors with the same replacement
                foreach ($declinedCollectors as $declinedCollector) {
                    $declinedId = $declinedCollector['collector_id'];
                    $declinedName = $declinedCollector['firstname'] . ' ' . $declinedCollector['lastname'];
                    
                    writeLog("Replacing $declinedName (ID: $declinedId) with $replacementName in ALL teams");
                    
                    // Find all teams where this collector is declined
                    $teamsStmt = $db->prepare("
                        SELECT ct.team_id, cs.scheduled_date, cs.start_time, b.barangay_name
                        FROM collection_team ct
                        JOIN collection_schedule cs ON cs.schedule_id = ct.schedule_id
                        JOIN barangay b ON cs.barangay_id = b.barangay_id
                        JOIN collection_team_member ctm ON ctm.team_id = ct.team_id
                        WHERE cs.scheduled_date = ? 
                        AND ctm.collector_id = ?
                        AND ctm.response_status = 'declined'
                    ");
                    $teamsStmt->execute([$checkDate, $declinedId]);
                    $affectedTeams = $teamsStmt->fetchAll(PDO::FETCH_ASSOC);
                    
                    writeLog("Found " . count($affectedTeams) . " teams where $declinedName is declined");
                    
                    // Replace in all affected teams
                    foreach ($affectedTeams as $team) {
                        $teamId = $team['team_id'];
                        $barangayName = $team['barangay_name'];
                        
                        // Replace the declined collector
                        $replaceStmt = $db->prepare("
                            UPDATE collection_team_member 
                            SET collector_id = ?, response_status = 'pending' 
                            WHERE team_id = ? AND collector_id = ?
                        ");
                        $replaceStmt->execute([$replacementId, $teamId, $declinedId]);
                        
                        // Reset team status to pending
                        $resetStmt = $db->prepare("UPDATE collection_team SET status = 'pending' WHERE team_id = ?");
                        $resetStmt->execute([$teamId]);
                        
                        writeLog("SUCCESS: Replaced $declinedName with $replacementName in team $teamId ($barangayName)");
                        $totalReassigned++;
                    }
                }
                
                // Send ONE notification to the replacement collector for all assignments
                $notificationPayload = [
                    'type' => 'daily_assignments',
                    'date' => $checkDate,
                    'assignments' => []
                ];
                
                // Get all teams where the replacement was assigned
                $replacementTeamsStmt = $db->prepare("
                    SELECT ct.team_id, cs.start_time, b.barangay_name
                    FROM collection_team ct
                    JOIN collection_schedule cs ON cs.schedule_id = ct.schedule_id
                    JOIN barangay b ON cs.barangay_id = b.barangay_id
                    JOIN collection_team_member ctm ON ctm.team_id = ct.team_id
                    WHERE cs.scheduled_date = ? 
                    AND ctm.collector_id = ?
                    AND ctm.response_status = 'pending'
                ");
                $replacementTeamsStmt->execute([$checkDate, $replacementId]);
                $replacementTeams = $replacementTeamsStmt->fetchAll(PDO::FETCH_ASSOC);
                
                foreach ($replacementTeams as $team) {
                    $notificationPayload['assignments'][] = [
                        'team_id' => $team['team_id'],
                        'barangay' => $team['barangay_name'],
                        'date' => $checkDate,
                        'time' => $team['start_time'],
                        'type' => 'reassigned'
                    ];
                }
                
                // Send notification
                $notifStmt = $db->prepare("
                    INSERT INTO notification (recipient_id, message, created_at, response_status) 
                    VALUES (?, ?, NOW(), 'unread')
                ");
                $notifStmt->execute([$replacementId, json_encode($notificationPayload)]);
                
                writeLog("Sent notification to $replacementName for " . count($replacementTeams) . " assignments");
                
            } else {
                writeLog("WARNING: No replacement collector found for $checkDate");
                $totalDeclined += count($declinedCollectors);
            }
        }
    }
    
    $db->commit();
    
    writeLog("COMPLETE: Reassigned $totalReassigned collectors, $totalDeclined still need manual assignment");
    
    if ($isCLI) {
        echo "Fixed auto re-assignment completed!\n";
        echo "Reassigned: $totalReassigned collectors\n";
        echo "Still need manual assignment: $totalDeclined\n";
    } else {
        echo json_encode([
            'success' => true,
            'message' => "Fixed re-assignment: $totalReassigned collectors reassigned, $totalDeclined still need manual assignment",
            'reassigned' => $totalReassigned,
            'still_declined' => $totalDeclined
        ]);
    }
    
} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    
    $errorMsg = $e->getMessage();
    writeLog("ERROR: $errorMsg");
    
    if ($isCLI) {
        echo "Error: $errorMsg\n";
        exit(1);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => $errorMsg
        ]);
    }
}

writeLog("Fixed automatic re-assignment completed");
?>
