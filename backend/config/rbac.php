<?php
return [
    'public_endpoints' => [
        'login.php',
        'login_new.php',
        'register_resident.php',
        'signup_verification.php',
        'check_email.php',
        'check_user.php',
        'forgot_password.php',
        'check_reference_data.php'
    ],
    'role_groups' => [
        'admin_only' => [
            'add_resolution_photo_column.php',
            'create_issue_reports_table.php',
            'create_missing_schedules.php',
            'create_pickup_requests_table.php',
            'regenerate_routes.php',
            'register_personnel.php',
            'update_schema.php',
            'update_user_status.php'
        ],
        'admin_foreman' => [
            'assign_task.php',
            'auto_generate_tasks.php',
            'create_predefined_schedule.php',
            'delete_assignment.php',
            'generate_tasks_from_predefined.php',
            'get_all_task_assignments.php',
            'get_all_users.php',
            'get_assignment_options.php',
            'get_personnel.php',
            'get_trucks.php',
            'send_notification.php',
            'support_issues.php',
            'update_assignment.php',
            'update_predefined_schedule.php',
            'update_predefined_schedule_by_fields.php',
            'update_route_assignment.php'
        ],
        'staff_only' => [
            'clear_route_active.php',
            'get_current_assignment.php',
            'get_route_status.php',
            'log_task_event.php',
            'mark_notification_read.php',
            'post_gps.php',
            'report_truck_full.php',
            'respond_assignment.php',
            'set_route_active.php',
            'update_route_status.php'
        ]
    ],
    'custom_policies' => [
        'delete_account.php' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman'],
        'delete_notification.php' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman'],
        'get_barangay_head.php' => ['admin', 'barangay_head'],
        'get_barangay_details.php' => ['admin', 'barangay_head', 'resident'],
        'get_garbage_collector.php' => ['admin', 'garbage_collector'],
        'get_notifications.php' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman'],
        'get_personnel_schedule.php' => ['admin', 'truck_driver', 'garbage_collector'],
        'get_pickup_requests.php' => ['admin', 'barangay_head', 'foreman'],
        'get_route_details.php' => ['admin', 'truck_driver', 'garbage_collector', 'barangay_head', 'resident'],
        'get_routes.php' => ['admin', 'truck_driver', 'garbage_collector'],
        'get_scheduled_routes.php' => ['admin', 'truck_driver', 'garbage_collector'],
        'get_task_events.php' => ['admin', 'truck_driver', 'garbage_collector'],
        'get_team_progress.php' => ['admin'],
        'get_truck_driver.php' => ['admin', 'truck_driver'],
        'get_user.php' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman'],
        'get_user_details.php' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman'],
        'get_user_issue_reports.php' => ['admin', 'resident', 'barangay_head', 'foreman'],
        'live_trucks.php' => ['admin', 'foreman'],
        'log_task_event.php' => ['admin', 'truck_driver', 'garbage_collector'],
        'register_personnel.php' => ['admin'],
        'register_resident.php' => null,
        'update_garbage_collector.php' => ['admin', 'garbage_collector'],
        'update_pickup_request_status.php' => ['admin', 'barangay_head', 'foreman'],
        'update_profile.php' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman'],
        'update_truck_driver.php' => ['admin', 'truck_driver'],
        'upload_profile_image.php' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman']
    ],
    'defaults' => [
        'requireAuth' => true,
        'allowedRoles' => ['admin', 'resident', 'barangay_head', 'truck_driver', 'garbage_collector', 'foreman']
    ]
];
