<?php
/**
 * Helper functions for logging schedule history
 */

if (!function_exists('log_schedule_history')) {
    /**
     * Log a schedule change to the history table
     * 
     * @param PDO $db Database connection
     * @param int $scheduleTemplateId The schedule_template_id
     * @param string $action One of: 'create', 'update', 'delete', 'restore'
     * @param int $actorUserId The user_id who performed the action
     * @param array|null $beforePayload Schedule data before the change (for update/delete)
     * @param array|null $afterPayload Schedule data after the change (for create/update)
     * @param string|null $remarks Optional remarks about the change
     * @return bool True on success, false on failure
     */
    function log_schedule_history(
        PDO $db,
        int $scheduleTemplateId,
        string $action,
        int $actorUserId,
        ?array $beforePayload = null,
        ?array $afterPayload = null,
        ?string $remarks = null
    ): bool {
        try {
            // Get actor role name from database
            $roleQuery = $db->prepare("
                SELECT r.role_name 
                FROM user u 
                LEFT JOIN role r ON u.role_id = r.role_id 
                WHERE u.user_id = ? 
                LIMIT 1
            ");
            $roleQuery->execute([$actorUserId]);
            $roleRow = $roleQuery->fetch(PDO::FETCH_ASSOC);
            $actorRole = $roleRow['role_name'] ?? null;

            // Prepare JSON payloads
            $beforeJson = $beforePayload ? json_encode($beforePayload, JSON_UNESCAPED_UNICODE) : null;
            $afterJson = $afterPayload ? json_encode($afterPayload, JSON_UNESCAPED_UNICODE) : null;

            // Insert into history table
            $insertQuery = $db->prepare("
                INSERT INTO predefined_schedule_history 
                (schedule_template_id, action, actor_user_id, actor_role, before_payload, after_payload, remarks, changed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $insertQuery->execute([
                $scheduleTemplateId,
                $action,
                $actorUserId,
                $actorRole,
                $beforeJson,
                $afterJson,
                $remarks
            ]);

            return true;
        } catch (Exception $e) {
            // Log error but don't fail the main operation
            error_log("Failed to log schedule history: " . $e->getMessage());
            return false;
        }
    }
}

if (!function_exists('get_schedule_before_payload')) {
    /**
     * Get current schedule data as payload for history logging
     * 
     * @param PDO $db Database connection
     * @param int $scheduleTemplateId The schedule_template_id
     * @return array|null Schedule data or null if not found
     */
    function get_schedule_before_payload(PDO $db, int $scheduleTemplateId): ?array {
        try {
            $query = $db->prepare("
                SELECT 
                    schedule_template_id,
                    barangay_id,
                    barangay_name,
                    cluster_id,
                    schedule_type,
                    day_of_week,
                    session,
                    start_time,
                    end_time,
                    frequency_per_day,
                    week_of_month,
                    is_active,
                    created_by,
                    updated_by,
                    deleted_by,
                    deleted_at,
                    created_at,
                    updated_at
                FROM predefined_schedules
                WHERE schedule_template_id = ?
                LIMIT 1
            ");
            $query->execute([$scheduleTemplateId]);
            $row = $query->fetch(PDO::FETCH_ASSOC);
            return $row ?: null;
        } catch (Exception $e) {
            error_log("Failed to get schedule before payload: " . $e->getMessage());
            return null;
        }
    }
}

if (!function_exists('get_schedule_after_payload')) {
    /**
     * Get schedule data after change for history logging
     * Same as get_schedule_before_payload but used after update
     * 
     * @param PDO $db Database connection
     * @param int $scheduleTemplateId The schedule_template_id
     * @return array|null Schedule data or null if not found
     */
    function get_schedule_after_payload(PDO $db, int $scheduleTemplateId): ?array {
        return get_schedule_before_payload($db, $scheduleTemplateId);
    }
}

