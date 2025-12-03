<?php

/**
 * Attendance-based personnel selection utilities.
 */

require_once __DIR__ . '/../config/database.php';

/**
 * Fetch approved personnel for a given date/session grouped by role.
 */
function getApprovedPersonnelBySession(PDO $db, string $date, string $session): array
{
    $stmt = $db->prepare("
        SELECT 
            a.attendance_id,
            a.user_id,
            a.time_in,
            u.role_id,
            up.employee_id,
            up.employment_type,
            COALESCE(CONCAT(up.firstname, ' ', up.lastname), u.username) AS full_name
        FROM attendance a
        JOIN user u ON a.user_id = u.user_id
        LEFT JOIN user_profile up ON u.user_id = up.user_id
        WHERE 
            a.attendance_date = :date
            AND a.session = :session
            AND a.verification_status = 'verified'
            AND u.role_id IN (3,4)
        ORDER BY 
            -- Prioritize regular personnel over job order
            CASE WHEN up.employment_type = 'regular' THEN 0 ELSE 1 END,
            a.time_in ASC, 
            a.user_id ASC
    ");

    $stmt->execute([
        ':date' => $date,
        ':session' => strtoupper($session) === 'PM' ? 'PM' : 'AM'
    ]);

    $drivers = [];
    $collectors = [];

    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if ((int)$row['role_id'] === 3) {
            $drivers[] = $row;
        } elseif ((int)$row['role_id'] === 4) {
            $collectors[] = $row;
        }
    }

    return [
        'drivers' => $drivers,
        'collectors' => $collectors
    ];
}

/**
 * Build frozen team snapshot for a session.
 * Supports minimal personnel: 1 driver + 1 collector (priority only)
 * or full personnel: 2 drivers + 2+ collectors (priority + clustered)
 */
function buildSessionSnapshot(array $drivers, array $collectors): array
{
    if (count($drivers) < 1) {
        throw new RuntimeException('Need at least 1 approved driver for this session.');
    }

    if (count($collectors) < 1) {
        throw new RuntimeException('Need at least 1 approved collector for this session.');
    }

    $priorityDriver = $drivers[0];
    $clusteredDriver = isset($drivers[1]) ? $drivers[1] : null;

    [$priorityCollectors, $clusteredCollectors] = splitCollectorsForSession($collectors);

    return [
        'drivers' => [
            'priority' => $priorityDriver,
            'clustered' => $clusteredDriver
        ],
        'collectors' => [
            'priority' => $priorityCollectors,
            'clustered' => $clusteredCollectors
        ],
        'minimal_mode' => ($clusteredDriver === null || empty($clusteredCollectors))
    ];
}

/**
 * Split collectors based on even/odd rule with max 4 per team when available.
 * If only 1 collector, assign to priority team only.
 */
function splitCollectorsForSession(array $collectors): array
{
    $total = count($collectors);
    $maxPerTeam = 4;

    // Minimal mode: 1 collector goes to priority team
    if ($total === 1) {
        return [[$collectors[0]], []];
    }

    if ($total % 2 === 0) {
        $evenShare = (int)($total / 2);
        $priorityCount = min($maxPerTeam, $evenShare);
        $clusteredCount = min($maxPerTeam, min($evenShare, $total - $priorityCount));
    } else {
        $priorityCount = min($maxPerTeam, (int)ceil($total / 2));
        $clusteredCount = min($maxPerTeam, max(1, $total - $priorityCount));
    }

    if ($priorityCount + $clusteredCount > $total) {
        $clusteredCount = max(0, $total - $priorityCount);
    }

    $priorityCollectors = array_slice($collectors, 0, $priorityCount);
    $clusteredCollectors = array_slice($collectors, $priorityCount, $clusteredCount);

    return [$priorityCollectors, $clusteredCollectors];
}

/**
 * Serialize attendance IDs for logging.
 */
function buildAttendanceSnapshotPayload(array $driver, array $collectors): string
{
    $payload = [
        'driver_attendance_id' => $driver['attendance_id'] ?? null,
        'collector_attendance_ids' => array_map(
            fn($c) => $c['attendance_id'] ?? null,
            $collectors
        )
    ];

    return json_encode($payload);
}

