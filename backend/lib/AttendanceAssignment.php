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
 * Supports flexible team sizes based on available trucks:
 * - 1 truck: 1 team with 1 driver + up to 4 collectors
 * - 2 trucks: 2 teams, each with 1 driver + up to 4 collectors
 * 
 * @param array $drivers Available drivers (sorted by priority)
 * @param array $collectors Available collectors (sorted by priority)
 * @param int $truckCount Number of available trucks (1 or 2)
 * @return array Team snapshot with drivers, collectors, and mode flags
 */
function buildSessionSnapshot(array $drivers, array $collectors, int $truckCount = 2): array
{
    if (count($drivers) < 1) {
        throw new RuntimeException('Need at least 1 approved driver for this session.');
    }

    if (count($collectors) < 1) {
        throw new RuntimeException('Need at least 1 approved collector for this session.');
    }

    // Limit to available trucks (max 2)
    $effectiveTruckCount = min($truckCount, 2);
    
    // Assign drivers based on available trucks
    $priorityDriver = $drivers[0];
    $clusteredDriver = ($effectiveTruckCount >= 2 && isset($drivers[1])) ? $drivers[1] : null;

    // Split collectors based on truck count and available personnel
    [$priorityCollectors, $clusteredCollectors] = splitCollectorsForSession($collectors, $effectiveTruckCount, $clusteredDriver !== null);

    return [
        'drivers' => [
            'priority' => $priorityDriver,
            'clustered' => $clusteredDriver
        ],
        'collectors' => [
            'priority' => $priorityCollectors,
            'clustered' => $clusteredCollectors
        ],
        'minimal_mode' => ($clusteredDriver === null || empty($clusteredCollectors)),
        'truck_count' => $effectiveTruckCount
    ];
}

/**
 * Split collectors based on available trucks and drivers.
 * - If only 1 truck/driver: assign all collectors (up to 4) to priority team
 * - If 2 trucks/drivers: split collectors between teams (max 4 per team)
 * 
 * @param array $collectors Available collectors
 * @param int $truckCount Number of available trucks
 * @param bool $hasClusteredDriver Whether a second driver is available
 * @return array [priorityCollectors, clusteredCollectors]
 */
function splitCollectorsForSession(array $collectors, int $truckCount = 2, bool $hasClusteredDriver = true): array
{
    $total = count($collectors);
    $maxPerTeam = 4;

    // If only 1 truck or no clustered driver, assign all to priority (up to max)
    if ($truckCount === 1 || !$hasClusteredDriver) {
        $priorityCount = min($maxPerTeam, $total);
        return [array_slice($collectors, 0, $priorityCount), []];
    }

    // 2 trucks available: split collectors between teams
    if ($total === 1) {
        // Only 1 collector: goes to priority team
        return [[$collectors[0]], []];
    }

    // Distribute collectors between two teams
    if ($total % 2 === 0) {
        // Even number: split evenly (max 4 per team)
        $evenShare = (int)($total / 2);
        $priorityCount = min($maxPerTeam, $evenShare);
        $clusteredCount = min($maxPerTeam, min($evenShare, $total - $priorityCount));
    } else {
        // Odd number: priority gets one more (max 4 per team)
        $priorityCount = min($maxPerTeam, (int)ceil($total / 2));
        $clusteredCount = min($maxPerTeam, max(1, $total - $priorityCount));
    }

    // Ensure we don't exceed total collectors
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

