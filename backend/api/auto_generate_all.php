<?php
// Cache buster: v2024-12-01-12:19 - Fixed sessionSnapshots iteration bug
// Set CORS headers FIRST before any authentication
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Check if this is a cron job request with valid token
// Must check BEFORE loading _bootstrap.php which enforces auth
$rawInput = file_get_contents('php://input');
$inputData = json_decode($rawInput, true);

$isCronRequest = false;
if (isset($inputData['cron_token'])) {
    $providedToken = $inputData['cron_token'];
    $expectedToken = 'kolektrash_cron_2024'; // Secure token for cron jobs
    
    if ($providedToken === $expectedToken) {
        $isCronRequest = true;
    }
}

// Only enforce authentication if NOT a valid cron request
if (!$isCronRequest) {
    require_once __DIR__ . '/_bootstrap.php';
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/AttendanceAssignment.php';

// Get input parameters
$data = $inputData ?? json_decode(file_get_contents('php://input'), true);
$start_date = $data['start_date'] ?? null;
$end_date = $data['end_date'] ?? null;
$overwrite = isset($data['overwrite']) ? (bool)$data['overwrite'] : false;
$force_session = isset($data['session']) ? strtoupper($data['session']) : null;

if (!$start_date || !$end_date) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields: start_date and end_date']);
    exit();
}

try {
    $database = new Database();
    $db = $database->connect();
    
    // Step 1: Generate tasks directly (no HTTP call)
    $tasksResult = generateTasksDirectly($db, $start_date, $end_date, $overwrite, $force_session);
    
    if (!$tasksResult['success']) {
        echo json_encode($tasksResult);
        exit();
    }
    
    // Step 2: Generate routes for each date directly (no HTTP call)
    $routesResults = [];
    $currentDate = new DateTime($start_date);
    $endDateTime = new DateTime($end_date);
    
    while ($currentDate <= $endDateTime) {
        $date = $currentDate->format('Y-m-d');
        
        $routeResult = generateRoutesForDateDirectly($db, $date);
        $routesResults[] = [
            'date' => $date,
            'success' => $routeResult['success'],
            'routes_generated' => $routeResult['routes_generated'] ?? 0,
            'message' => $routeResult['message'] ?? ''
        ];
        
        $currentDate->add(new DateInterval('P1D'));
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Tasks and routes generated successfully',
        'tasks' => $tasksResult,
        'routes' => $routesResults
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Generate tasks directly without HTTP calls
 */
function generateTasksDirectly($db, $start_date, $end_date, $overwrite, $force_session) {
    try {
        $db->beginTransaction();
        
        // Get predefined schedules
        $stmt = $db->prepare("SELECT * FROM predefined_schedules WHERE is_active = 1");
        $stmt->execute();
        $predefinedSchedules = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get available trucks
        $stmt = $db->prepare("SELECT truck_id, plate_num, truck_type, capacity, status FROM truck WHERE status = 'available' OR status = 'Available'");
        $stmt->execute();
        $trucks = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($trucks)) {
            // No trucks available - send notifications and return
            if (!$db->inTransaction()) {
                $db->beginTransaction(); // Start transaction for notifications
            }
            
            $currentDate = new DateTime($start_date);
            $endDateTime = new DateTime($end_date);
            $affectedDates = [];
            
            // Get all scheduled dates and affected barangays
            while ($currentDate <= $endDateTime) {
                $date = $currentDate->format('Y-m-d');
                $dayName = $currentDate->format('l');
                $weekOfMonth = ceil($currentDate->format('j') / 7);
                
                // Get barangays scheduled for this date
                $stmt = $db->prepare("
                    SELECT DISTINCT b.barangay_name, ps.start_time, ps.session
                    FROM predefined_schedules ps
                    JOIN barangay b ON ps.barangay_id = b.barangay_id
                    WHERE ps.day_of_week = ?
                    AND (ps.week_of_month = ? OR ps.week_of_month IS NULL)
                    AND ps.is_active = 1
                ");
                $stmt->execute([$dayName, $weekOfMonth]);
                $scheduledBarangays = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                if (!empty($scheduledBarangays)) {
                    $affectedDates[] = [
                        'date' => $date,
                        'barangays' => $scheduledBarangays,
                        'count' => count($scheduledBarangays)
                    ];
                }
                
                $currentDate->add(new DateInterval('P1D'));
            }
            
            // Send notification to drivers and collectors (role_id 3 and 4)
            if (!empty($affectedDates)) {
                $stmtNotif = $db->prepare("
                    INSERT INTO notification (recipient_id, message, created_at, response_status) 
                    SELECT u.user_id, ?, NOW(), 'unread'
                    FROM user u
                    WHERE u.role_id IN (3, 4)
                ");
                
                foreach ($affectedDates as $dateInfo) {
                    $barangayList = array_map(fn($b) => $b['barangay_name'], $dateInfo['barangays']);
                    
                    $notifPayload = [
                        'type' => 'no_trucks_available',
                        'date' => $dateInfo['date'],
                        'reason' => 'All trucks are currently under maintenance or unavailable',
                        'affected_barangays' => $barangayList,
                        'barangay_count' => $dateInfo['count'],
                        'message' => "No collection scheduled for {$dateInfo['date']} due to no available trucks. All trucks are currently under maintenance. {$dateInfo['count']} barangay(s) affected."
                    ];
                    $stmtNotif->execute([json_encode($notifPayload)]);
                }
                
                // Also send to admin users
                $stmtAdminNotif = $db->prepare("
                    INSERT INTO notification (recipient_id, message, created_at, response_status) 
                    SELECT u.user_id, ?, NOW(), 'unread'
                    FROM user u
                    WHERE u.role_id = 1
                ");
                
                $totalBarangays = array_sum(array_column($affectedDates, 'count'));
                $adminPayload = [
                    'type' => 'no_trucks_available_admin',
                    'date_range' => $start_date === $end_date ? $start_date : "$start_date to $end_date",
                    'affected_dates' => count($affectedDates),
                    'total_barangays_affected' => $totalBarangays,
                    'message' => "URGENT: No collection can be scheduled for " . count($affectedDates) . " date(s) due to no available trucks. Total {$totalBarangays} barangay collection(s) affected. Please ensure trucks are available."
                ];
                $stmtAdminNotif->execute([json_encode($adminPayload)]);
            }
            
            $db->commit();
            
            return [
                'success' => false,
                'message' => 'No available trucks found. Notifications sent to personnel and admins.',
                'generated_tasks' => [],
                'total_generated' => 0,
                'trucks_available' => 0,
                'affected_dates' => $affectedDates,
                'notifications_sent' => true
            ];
        }

        $trucksAvailable = count($trucks);
        
        $generatedTasks = [];
        $recipientNotifications = [];
        $skippedDuplicates = 0;
        $skippedInsufficientTrucks = [];
        $cancellationNotifications = [];
        $currentDate = new DateTime($start_date);
        $endDateTime = new DateTime($end_date);
        
        // Fixed truck assignment
        $priorityTruck = $trucks[0];
        $clusteredTruck = isset($trucks[1]) ? $trucks[1] : null;
        
        $sessionSnapshots = [];
        $sessionIssues = [];
        $assignedPersonnel = []; // Track who got assigned to tasks
        $unassignedNotifications = []; // Track unassigned personnel per date/session

        
        while ($currentDate <= $endDateTime) {
            $date = $currentDate->format('Y-m-d');
            $dayName = $currentDate->format('l');
            $weekOfMonth = ceil($currentDate->format('j') / 7);
            
            foreach ($predefinedSchedules as $schedule) {
                // Check if schedule matches current day
                if ($schedule['day_of_week'] === $dayName) {
                    // For weekly clusters, check week of month
                    if ($schedule['schedule_type'] === 'weekly_cluster') {
                        if ($schedule['week_of_month'] != $weekOfMonth) {
                            continue;
                        }
                    }
                    
                    $scheduleSession = inferScheduleSession($schedule);

                    if ($force_session && $scheduleSession !== $force_session) {
                        continue;
                    }

                    $session = $force_session ?? $scheduleSession;
                    
                    // Build/fetch session snapshot
                    try {
                        if (!isset($sessionSnapshots[$date][$session])) {
                            $personnel = getApprovedPersonnelBySession($db, $date, $session);
                            $sessionSnapshots[$date][$session] = buildSessionSnapshot($personnel['drivers'], $personnel['collectors']);
                        }
                        $snapshot = $sessionSnapshots[$date][$session];
                    } catch (RuntimeException $sessionError) {
                        $sessionIssues[] = [
                            'date' => $date,
                            'session' => $session,
                            'message' => $sessionError->getMessage()
                        ];
                        continue;
                    }
                    
                    // Check if task already exists
                    $stmt = $db->prepare("SELECT schedule_id FROM collection_schedule WHERE barangay_id = ? AND scheduled_date = ? AND start_time = ?");
                    $stmt->execute([$schedule['barangay_id'], $date, $schedule['start_time']]);
                    $existingId = $stmt->fetchColumn();
                    if ($existingId && !$overwrite) {
                        $skippedDuplicates++;
                        continue;
                    }
                    if ($existingId && $overwrite) {
                        $db->prepare("DELETE FROM collection_team_member WHERE team_id IN (SELECT team_id FROM collection_team WHERE schedule_id = ?)")->execute([$existingId]);
                        $db->prepare("DELETE FROM collection_team WHERE schedule_id = ?")->execute([$existingId]);
                        $db->prepare("DELETE FROM collection_schedule WHERE schedule_id = ?")->execute([$existingId]);
                    }

                    {
                        $assignmentKey = $schedule['cluster_id'] === '1C-PB' ? 'priority' : 'clustered';
                        $driver = $snapshot['drivers'][$assignmentKey];
                        $selectedCollectors = $snapshot['collectors'][$assignmentKey];
                        $truck = $assignmentKey === 'priority' ? $priorityTruck : $clusteredTruck;
                        
                        $teamLabel = ucfirst($assignmentKey) . ' Team';
                        
                        // Skip clustered barangays if in minimal personnel mode
                        if ($assignmentKey === 'clustered' && $snapshot['minimal_mode']) {
                            $skippedInsufficientTrucks[] = [
                                'barangay_name' => $schedule['barangay_name'],
                                'barangay_id' => $schedule['barangay_id'],
                                'cluster_id' => $schedule['cluster_id'],
                                'date' => $date,
                                'time' => $schedule['start_time'],
                                'reason' => 'Minimal personnel mode (only 1 driver/collector available, reserved for priority barangays)'
                            ];
                            
                            $cancellationNotifications[] = [
                                'barangay_id' => $schedule['barangay_id'],
                                'barangay_name' => $schedule['barangay_name'],
                                'date' => $date,
                                'time' => $schedule['start_time']
                            ];
                            
                            continue;
                        }
                        
                        // Skip clustered barangays if no truck available
                        if ($assignmentKey === 'clustered' && $clusteredTruck === null) {
                            $skippedInsufficientTrucks[] = [
                                'barangay_name' => $schedule['barangay_name'],
                                'barangay_id' => $schedule['barangay_id'],
                                'cluster_id' => $schedule['cluster_id'],
                                'date' => $date,
                                'time' => $schedule['start_time'],
                                'reason' => 'Insufficient trucks (only 1 available, reserved for priority)'
                            ];
                            
                            $cancellationNotifications[] = [
                                'barangay_id' => $schedule['barangay_id'],
                                'barangay_name' => $schedule['barangay_name'],
                                'date' => $date,
                                'time' => $schedule['start_time']
                            ];
                            
                            continue;
                        }
                        
                        // Create schedule
                        $stmt = $db->prepare("INSERT INTO collection_schedule (barangay_id, scheduled_date, session, start_time, end_time, status) VALUES (?, ?, ?, ?, ?, 'approved')");
                        $stmt->execute([$schedule['barangay_id'], $date, $session, $schedule['start_time'], $schedule['end_time']]);
                        $schedule_id = $db->lastInsertId();
                        
                        // Create collection team
                        $attendanceSnapshot = buildAttendanceSnapshotPayload($driver, $selectedCollectors);
                        $stmt = $db->prepare("INSERT INTO collection_team (schedule_id, truck_id, driver_id, session, attendance_snapshot, status) VALUES (?, ?, ?, ?, ?, 'approved')");
                        $stmt->execute([$schedule_id, $truck['truck_id'], $driver['user_id'], $session, $attendanceSnapshot]);
                        $team_id = $db->lastInsertId();
                        
                        // Assign collectors
                        $stmt = $db->prepare("INSERT INTO collection_team_member (team_id, collector_id, response_status) VALUES (?, ?, 'approved')");
                        foreach ($selectedCollectors as $collector) {
                            $stmt->execute([$team_id, $collector['user_id']]);
                        }
                        
                        // Queue notifications
                        $assignmentEntry = [
                            'team_id' => (int)$team_id,
                            'barangay' => $schedule['barangay_name'],
                            'cluster' => $schedule['cluster_id'],
                            'date' => $date,
                            'time' => $schedule['start_time'],
                            'type' => $schedule['schedule_type'],
                            'truck' => $truck['plate_num']
                        ];
                        
                        $recipientId = (int)$driver['user_id'];
                        if (!isset($recipientNotifications[$recipientId])) { $recipientNotifications[$recipientId] = []; }
                        $recipientNotifications[$recipientId][] = $assignmentEntry;
                        
                        foreach ($selectedCollectors as $collector) {
                            $rid = (int)$collector['user_id'];
                            if (!isset($recipientNotifications[$rid])) { $recipientNotifications[$rid] = []; }
                            $recipientNotifications[$rid][] = $assignmentEntry;
                        }
                        
                        $generatedTasks[] = [
                            'barangay_name' => $schedule['barangay_name'],
                            'barangay_id' => $schedule['barangay_id'],
                            'cluster_id' => $schedule['cluster_id'],
                            'date' => $date,
                            'session' => $session,
                            'time' => $schedule['start_time'],
                            'type' => $schedule['schedule_type'],
                            'driver' => $driver['full_name'],
                            'collectors' => array_map(fn($c) => $c['full_name'], $selectedCollectors),
                            'truck' => $truck['plate_num'],
                            'team_id' => $team_id,
                            'assignment_type' => $assignmentKey === 'priority' ? 'Priority Assignment' : 'Clustered Assignment',
                            'collector_team' => $teamLabel
                        ];
                        
                        // Track assigned personnel
                        $sessionKey = $date . '|' . $session;
                        if (!isset($assignedPersonnel[$sessionKey])) {
                            $assignedPersonnel[$sessionKey] = [
                                'drivers' => [],
                                'collectors' => []
                            ];
                        }
                        $assignedPersonnel[$sessionKey]['drivers'][] = $driver['user_id'];
                        foreach ($selectedCollectors as $collector) {
                            $assignedPersonnel[$sessionKey]['collectors'][] = $collector['user_id'];
                        }
                    }
                }
            }
            
            $currentDate->add(new DateInterval('P1D'));
        }
        
        // Send notifications
        if (!empty($recipientNotifications)) {
            $stmtNotif = $db->prepare("INSERT INTO notification (recipient_id, message, created_at, response_status) VALUES (?, ?, NOW(), 'unread')");
            foreach ($recipientNotifications as $recipientId => $assignments) {
                $payload = [
                    'type' => 'daily_assignments',
                    'date' => $start_date === $end_date ? $start_date : null,
                    'assignments' => $assignments
                ];
                $stmtNotif->execute([$recipientId, json_encode($payload)]);
            }
        }

        // Identify and notify unassigned personnel
        // Check each session snapshot to see who attended but didn't get assigned
        try {
            foreach ($sessionSnapshots as $date => $sessions) {
                foreach ($sessions as $session => $snapshot) {
                    $sessionKey = $date . '|' . $session;
                    
                    // Get all personnel who attended this session
                    $personnel = getApprovedPersonnelBySession($db, $date, $session);
                    $allDriverIds = array_map(fn($d) => $d['user_id'], $personnel['drivers']);
                    $allCollectorIds = array_map(fn($c) => $c['user_id'], $personnel['collectors']);
                    
                    // Get who was assigned
                    $assignedDriverIds = $assignedPersonnel[$sessionKey]['drivers'] ?? [];
                    $assignedCollectorIds = $assignedPersonnel[$sessionKey]['collectors'] ?? [];
                    
                    // Find unassigned personnel
                    $unassignedDriverIds = array_diff($allDriverIds, $assignedDriverIds);
                    $unassignedCollectorIds = array_diff($allCollectorIds, $assignedCollectorIds);
                    
                    // Send notifications to unassigned personnel
                    if (!empty($unassignedDriverIds) || !empty($unassignedCollectorIds)) {
                        $unassignedIds = array_merge($unassignedDriverIds, $unassignedCollectorIds);
                        
                        $stmtNotif = $db->prepare("
                            INSERT INTO notification (recipient_id, message, created_at, response_status) 
                            VALUES (?, ?, NOW(), 'unread')
                        ");
                        
                        foreach ($unassignedIds as $userId) {
                            $notifPayload = [
                                'type' => 'no_task_assigned',
                                'date' => $date,
                                'session' => $session,
                                'reason' => 'Insufficient trucks available. Only priority barangays are being serviced.',
                                'message' => "You have no task assigned for $date ($session session) due to insufficient trucks. Only priority barangays are being serviced today. Please standby for further instructions."
                            ];
                            $stmtNotif->execute([$userId, json_encode($notifPayload)]);
                        }
                    }
                }
            }
        } catch (Exception $e) {
            // Log error but don't fail the entire process
            error_log("Error notifying unassigned personnel: " . $e->getMessage());
        }


        // Send cancellation notifications
        if (!empty($cancellationNotifications)) {
            // Send cancellation notifications to admin users (role_id = 1)
            $stmtNotif = $db->prepare("
                INSERT INTO notification (recipient_id, message, created_at, response_status) 
                SELECT u.user_id, ?, NOW(), 'unread'
                FROM user u
                WHERE u.role_id = 1
            ");
            
            foreach ($cancellationNotifications as $cancellation) {
                $notifPayload = [
                    'type' => 'collection_cancelled',
                    'barangay_name' => $cancellation['barangay_name'],
                    'date' => $cancellation['date'],
                    'time' => $cancellation['time'],
                    'reason' => 'Insufficient personnel or trucks available. Priority barangays are being serviced first.',
                    'message' => "Collection for {$cancellation['barangay_name']} on {$cancellation['date']} at {$cancellation['time']} has been cancelled due to insufficient resources."
                ];
                $stmtNotif->execute([json_encode($notifPayload)]);
            }
        }

        // Send notifications for session issues (no personnel attended)
        if (!empty($sessionIssues)) {
            // Group session issues by date and session
            $groupedIssues = [];
            foreach ($sessionIssues as $issue) {
                $key = $issue['date'] . '|' . $issue['session'];
                if (!isset($groupedIssues[$key])) {
                    $groupedIssues[$key] = [
                        'date' => $issue['date'],
                        'session' => $issue['session'],
                        'message' => $issue['message'],
                        'affected_barangays' => []
                    ];
                }
            }
            
            // Get all barangays that were supposed to have collection on those dates
            foreach ($groupedIssues as $key => $issueData) {
                $date = $issueData['date'];
                $session = $issueData['session'];
                $dayName = date('l', strtotime($date));
                $weekOfMonth = ceil(date('j', strtotime($date)) / 7);
                
                // Get affected barangays from predefined schedules
                $stmt = $db->prepare("
                    SELECT DISTINCT b.barangay_name, ps.start_time
                    FROM predefined_schedules ps
                    JOIN barangay b ON ps.barangay_id = b.barangay_id
                    WHERE ps.day_of_week = ?
                    AND (ps.week_of_month = ? OR ps.week_of_month IS NULL)
                    AND ps.is_active = 1
                    AND (
                        (ps.session = ? OR ps.session IS NULL)
                        OR (ps.session IS NULL AND (
                            (? = 'AM' AND ps.start_time < '12:00:00')
                            OR (? = 'PM' AND ps.start_time >= '12:00:00')
                        ))
                    )
                ");
                $stmt->execute([$dayName, $weekOfMonth, $session, $session, $session]);
                $affectedBarangays = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                $groupedIssues[$key]['affected_barangays'] = $affectedBarangays;
            }
            
            // Send notifications to admin users
            $stmtNotif = $db->prepare("
                INSERT INTO notification (recipient_id, message, created_at, response_status) 
                SELECT u.user_id, ?, NOW(), 'unread'
                FROM user u
                WHERE u.role_id = 1
            ");
            
            foreach ($groupedIssues as $issue) {
                $barangayList = array_map(fn($b) => $b['barangay_name'], $issue['affected_barangays']);
                $barangayCount = count($barangayList);
                
                $notifPayload = [
                    'type' => 'no_personnel_attendance',
                    'date' => $issue['date'],
                    'session' => $issue['session'],
                    'reason' => $issue['message'],
                    'affected_barangays' => $barangayList,
                    'barangay_count' => $barangayCount,
                    'message' => "No collection scheduled for {$issue['date']} ({$issue['session']} session) due to insufficient personnel. {$barangayCount} barangay(s) affected: " . implode(', ', array_slice($barangayList, 0, 5)) . ($barangayCount > 5 ? '...' : '')
                ];
                $stmtNotif->execute([json_encode($notifPayload)]);
            }
        }

        $db->commit();

        
        return [
            'success' => true,
            'message' => 'Tasks generated successfully from predefined schedules',
            'generated_tasks' => $generatedTasks,
            'total_generated' => count($generatedTasks),
            'skipped_duplicates' => $skippedDuplicates,
            'skipped_insufficient_trucks' => $skippedInsufficientTrucks,
            'cancellation_notifications_sent' => count($cancellationNotifications),
            'trucks_available' => $trucksAvailable,
            'session_issues' => $sessionIssues,
            'overwrite' => $overwrite
        ];
        
    } catch (Exception $e) {
        if ($db && $db->inTransaction()) $db->rollBack();
        return [
            'success' => false,
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Generate routes directly without HTTP calls
 */
function generateRoutesForDateDirectly($db, $date) {
    try {
        // Get day of week
        $dayOfWeekNum = date('w', strtotime($date));
        $dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        $dayOfWeek = $dayNames[$dayOfWeekNum];
        
        // Calculate week of month
        $dayOfMonth = date('j', strtotime($date));
        $weekOfMonth = ceil($dayOfMonth / 7);
        
        // Query schedules for this date
        // NOTE: Do NOT use DISTINCT here - we need duplicate barangays if they have multiple schedules
        $scheduleQuery = "SELECT
                            ps.schedule_type,
                            ps.barangay_id,
                            ps.cluster_id,
                            b.barangay_name,
                            ps.start_time,
                            ps.end_time,
                            ps.session
                          FROM predefined_schedules ps
                          JOIN barangay b ON ps.barangay_id = b.barangay_id
                          WHERE ps.day_of_week = ?
                          AND (ps.week_of_month = ? OR ps.week_of_month IS NULL)
                          AND ps.is_active = 1
                          ORDER BY ps.schedule_type, ps.session, ps.start_time, b.barangay_name";
        
        $scheduleStmt = $db->prepare($scheduleQuery);
        $scheduleStmt->execute([$dayOfWeek, $weekOfMonth]);
        $schedules = $scheduleStmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (empty($schedules)) {
            return [
                'success' => true,
                'message' => 'No schedules found for this date',
                'routes_generated' => 0
            ];
        }
        
        // Group barangays by cluster_id AND session
        $groupedSchedules = [];
        foreach ($schedules as $schedule) {
            $clusterId = $schedule['cluster_id'];
            // Infer session if missing
            $session = $schedule['session'];
            if (empty($session)) {
                $startTime = $schedule['start_time'] ?? '08:00:00';
                $session = $startTime >= '12:00:00' ? 'PM' : 'AM';
            }
            $session = strtoupper($session);
            
            $groupKey = $clusterId . '|' . $session;
            
            if (!isset($groupedSchedules[$groupKey])) {
                $groupedSchedules[$groupKey] = [
                    'cluster_id' => $clusterId,
                    'session' => $session,
                    'barangays' => [],
                    'start_times' => [],
                    'end_times' => []
                ];
            }
            $groupedSchedules[$groupKey]['barangays'][] = [
                'barangay_id' => $schedule['barangay_id'],
                'barangay_name' => $schedule['barangay_name']
            ];
            $groupedSchedules[$groupKey]['start_times'][] = $schedule['start_time'];
            $groupedSchedules[$groupKey]['end_times'][] = $schedule['end_time'];
        }
        
        // Generate routes for each group
        $routesCreated = 0;
        
        foreach ($groupedSchedules as $groupKey => $groupData) {
            $clusterId = $groupData['cluster_id'];
            $session = $groupData['session'];
            $barangays = $groupData['barangays'];
            
            // Calculate dynamic start and end times
            $minStartTime = min($groupData['start_times']);
            $maxEndTime = max($groupData['end_times']);
            
            // Create route name based on cluster and session
            $barangayCount = count($barangays);
            $clusterName = $clusterId === '1C-PB' ? 'Priority Barangay' : 'Clustered Barangay';
            $routeName = $clusterName . ' Route (' . $session . ') [' . $barangayCount . ' barangays]';
            
            // Check if there are actual tasks generated for this session
            $firstBarangayId = $barangays[0]['barangay_id'];
            $taskCheckQuery = "SELECT ct.team_id, ct.truck_id, ct.session
                               FROM collection_schedule cs
                               JOIN collection_team ct ON cs.schedule_id = ct.schedule_id
                               WHERE cs.barangay_id = ? AND cs.scheduled_date = ? AND ct.session = ?
                               LIMIT 1";
            $taskCheckStmt = $db->prepare($taskCheckQuery);
            $taskCheckStmt->execute([$firstBarangayId, $date, $session]);
            $teamInfo = $taskCheckStmt->fetch(PDO::FETCH_ASSOC);
            
            // Skip this route if no tasks exist for this session
            if (!$teamInfo) {
                continue;
            }
            
            $teamId = $teamInfo['team_id'];
            $truckId = $teamInfo['truck_id'];
            
            // Check if route already exists for this team/truck/date/session
            $checkExistingQuery = "SELECT id FROM daily_route 
                                   WHERE date = ? AND team_id = ? AND truck_id = ?";
            $checkStmt = $db->prepare($checkExistingQuery);
            $checkStmt->execute([$date, $teamId, $truckId]);
            $existingRoute = $checkStmt->fetch(PDO::FETCH_ASSOC);
            
            if ($existingRoute) {
                // Delete existing stops
                $deleteStopsQuery = "DELETE FROM daily_route_stop WHERE daily_route_id = ?";
                $deleteStmt = $db->prepare($deleteStopsQuery);
                $deleteStmt->execute([$existingRoute['id']]);
                $routeId = $existingRoute['id'];
                
                // Update existing route
                $updateRouteQuery = "UPDATE daily_route 
                                    SET barangay_name = ?, start_time = ?, end_time = ?, updated_at = NOW()
                                    WHERE id = ?";
                $updateStmt = $db->prepare($updateRouteQuery);
                $updateStmt->execute([$routeName, $minStartTime, $maxEndTime, $routeId]);
            } else {
                // Insert new daily_route
                $insertRouteQuery = "INSERT INTO daily_route (
                                        date, barangay_name, status, source,
                                        start_time, end_time, team_id, truck_id, created_at, updated_at
                                     ) VALUES (?, ?, 'scheduled', 'generated', ?, ?, ?, ?, NOW(), NOW())";
                
                $insertRouteStmt = $db->prepare($insertRouteQuery);
                $insertRouteStmt->execute([$date, $routeName, $minStartTime, $maxEndTime, $teamId, $truckId]);
                $routeId = $db->lastInsertId();
            }
            
            // Get all collection points from these barangays
            // Important: Iterate through each barangay individually to preserve duplicates
            // (e.g., if North Centro appears twice in schedules, we want its stops twice)
            $collectionPoints = [];
            foreach ($barangays as $barangay) {
                $cpQuery = "SELECT 
                                cp.point_id,
                                cp.barangay_id,
                                cp.location_name,
                                cp.latitude,
                                cp.longitude,
                                b.barangay_name
                            FROM collection_point cp
                            JOIN barangay b ON cp.barangay_id = b.barangay_id
                            WHERE cp.barangay_id = ?
                            ORDER BY cp.point_id";
                
                $cpStmt = $db->prepare($cpQuery);
                $cpStmt->execute([$barangay['barangay_id']]);
                $points = $cpStmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Add all points from this barangay to the collection
                foreach ($points as $point) {
                    $collectionPoints[] = $point;
                }
            }
            
            // DEBUG: Log counts to help diagnose the 8-stop issue
            error_log("DEBUG Route Generation - Date: $date, Session: $session");
            error_log("DEBUG: Total barangays in group = " . count($barangays));
            error_log("DEBUG: Total collection points = " . count($collectionPoints));
            
            // Also write to a file for easier debugging
            $debugInfo = "=== Route Generation Debug ===\n";
            $debugInfo .= "Date: $date\n";
            $debugInfo .= "Session: $session\n";
            $debugInfo .= "Barangay count: " . count($barangays) . "\n";
            $debugInfo .= "Collection points count: " . count($collectionPoints) . "\n";
            $debugInfo .= "Barangays: " . json_encode($barangays, JSON_PRETTY_PRINT) . "\n";
            $debugInfo .= "Collection points: " . json_encode($collectionPoints, JSON_PRETTY_PRINT) . "\n\n";
            file_put_contents(__DIR__ . '/../../route_debug.txt', $debugInfo, FILE_APPEND);
            
            // Insert stops
            $seq = 1;
            foreach ($collectionPoints as $cp) {
                $insertStopQuery = "INSERT INTO daily_route_stop (
                                        daily_route_id, seq, collection_point_id,
                                        name, lat, lng, status, created_at, updated_at
                                    ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW(), NOW())";
                
                $insertStopStmt = $db->prepare($insertStopQuery);
                $insertStopStmt->execute([
                    $routeId,
                    $seq,
                    $cp['point_id'],
                    $cp['location_name'],
                    $cp['latitude'],
                    $cp['longitude']
                ]);
                $seq++;
            }
            
            $routesCreated++;
        }
        
        return [
            'success' => true,
            'message' => 'Routes generated successfully',
            'routes_generated' => $routesCreated,
            'debug_barangay_count' => count($barangays ?? []),
            'debug_stop_count' => count($collectionPoints ?? [])
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => $e->getMessage(),
            'routes_generated' => 0
        ];
    }
}

function inferScheduleSession(array $schedule): string
{
    if (!empty($schedule['session'])) {
        return strtoupper($schedule['session']) === 'PM' ? 'PM' : 'AM';
    }

    $startTime = $schedule['start_time'] ?? '08:00:00';
    return $startTime >= '12:00:00' ? 'PM' : 'AM';
}
?>
