<?php
require_once __DIR__ . '/_bootstrap.php';
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers,Content-Type,Access-Control-Allow-Methods,Authorization,X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once __DIR__ . '/../lib/AttendanceAssignment.php';

$data = json_decode(file_get_contents('php://input'), true);
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
        throw new Exception("No available trucks found.");
    }

    if (count($trucks) < 2) {
        throw new Exception("Need at least 2 available trucks for fixed assignment. Found: " . count($trucks));
    }
    
    $generatedTasks = [];
    // Aggregate notifications per recipient per day
    $recipientNotifications = [];
    $skippedDuplicates = 0;
    $currentDate = new DateTime($start_date);
    $endDateTime = new DateTime($end_date);
    
    // Fixed truck assignment
    $priorityTruck = $trucks[0]; // First truck for priority barangays
    $clusteredTruck = $trucks[1]; // Second truck for clustered barangays
    
    $sessionSnapshots = [];
    $sessionIssues = [];
    
    while ($currentDate <= $endDateTime) {
        $date = $currentDate->format('Y-m-d');
        $dayName = $currentDate->format('l');
        $weekOfMonth = ceil($currentDate->format('j') / 7);
        
        // Skip weekends
        if ($currentDate->format('w') == 0 || $currentDate->format('w') == 6) {
            $currentDate->add(new DateInterval('P1D'));
            continue;
        }
        
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
                    // delete existing schedule and cascade team if needed
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
                    
                    // Create schedule first
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
                    
                    // Queue aggregated notifications for this recipient list
                    $assignmentEntry = [
                        'team_id' => (int)$team_id,
                        'barangay' => $schedule['barangay_name'],
                        'cluster' => $schedule['cluster_id'],
                        'date' => $date,
                        'time' => $schedule['start_time'],
                        'type' => $schedule['schedule_type'],
                        'truck' => $truck['plate_num']
                    ];
                    // Driver
                    $recipientId = (int)$driver['user_id'];
                    if (!isset($recipientNotifications[$recipientId])) { $recipientNotifications[$recipientId] = []; }
                    $recipientNotifications[$recipientId][] = $assignmentEntry;
                    // Collectors
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
                }
            }
        }
        
        $currentDate->add(new DateInterval('P1D'));
    }
    
    // After generating all tasks for the requested date range, persist one notification per recipient per date
    if (!empty($recipientNotifications)) {
        $stmtNotif = $db->prepare("INSERT INTO notification (recipient_id, message, created_at, response_status) VALUES (?, ?, NOW(), 'unread')");
        foreach ($recipientNotifications as $recipientId => $assignments) {
            // Group assignments by date for safety, but payload still includes all entries
            $payload = [
                'type' => 'daily_assignments',
                'date' => $start_date === $end_date ? $start_date : null,
                'assignments' => $assignments
            ];
            $stmtNotif->execute([$recipientId, json_encode($payload)]);
        }
    }

    $db->commit();
    echo json_encode([
        'success' => true,
        'message' => 'Tasks generated successfully from predefined schedules',
        'generated_tasks' => $generatedTasks,
        'total_generated' => count($generatedTasks),
        'skipped_duplicates' => $skippedDuplicates,
        'session_issues' => $sessionIssues,
        'overwrite' => $overwrite
    ]);
    
} catch (Exception $e) {
    if ($db && $db->inTransaction()) $db->rollBack();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
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
