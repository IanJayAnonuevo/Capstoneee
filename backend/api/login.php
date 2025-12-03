<?php
require_once __DIR__ . '/_bootstrap.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../models/User.php';

try {
    $database = new Database();
    $db = $database->connect();

    if (!$db) {
        throw new RuntimeException('Database connection failed.');
    }

    // Check if required tables exist
    try {
        $checkTable = $db->query("SHOW TABLES LIKE 'user'");
        if ($checkTable->rowCount() === 0) {
            throw new RuntimeException('Database table "user" does not exist. Please import the kolektrash_db.sql file into your database.');
        }
    } catch (PDOException $e) {
        // If we can't check tables, continue and let the actual query fail with a better error
    }

    $payload = json_decode(file_get_contents('php://input'), true);

    if (!is_array($payload)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid request payload.'
        ]);
        exit();
    }

    $username = isset($payload['username']) ? trim((string)$payload['username']) : '';
    $password = isset($payload['password']) ? (string)$payload['password'] : '';

    if ($username === '' || $password === '') {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required parameters.'
        ]);
        exit();
    }

    $user = new User($db);
    $user->username = $username;
    $user->password = $password;

    $loginResult = $user->login();
    
    // Check if account is suspended
    if ($loginResult === 'suspended') {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'error_code' => 'ACCOUNT_SUSPENDED',
            'message' => 'Your account has been suspended. Please contact the administrator.'
        ]);
        exit();
    }
    
    if (!$loginResult) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid credentials.'
        ]);
        exit();
    }

    $role = $user->role_name ?: 'resident';

    // Set user online_status to 'online' after successful login
    try {
        $updateStatusStmt = $db->prepare("UPDATE user SET online_status = 'online' WHERE user_id = ?");
        $updateStatusStmt->execute([(int)$user->user_id]);
    } catch (PDOException $e) {
        // If online_status column doesn't exist yet, log warning but don't fail login
        if (strpos($e->getMessage(), 'online_status') !== false) {
            error_log('Warning: online_status column not found. Please run the database migration.');
        } else {
            error_log('Failed to update online_status: ' . $e->getMessage());
        }
    } catch (Exception $e) {
        // Log error but don't fail login if online_status column doesn't exist yet
        error_log('Failed to update online_status: ' . $e->getMessage());
    }

    // Check if user has an active approved leave
    try {
        $today = date('Y-m-d');
        $checkLeaveStmt = $db->prepare("
            SELECT id, leave_type, start_date, end_date, reason 
            FROM leave_request 
            WHERE user_id = ? 
            AND request_status = 'approved' 
            AND start_date <= ? 
            AND end_date >= ?
            ORDER BY start_date ASC
            LIMIT 1
        ");
        $checkLeaveStmt->execute([(int)$user->user_id, $today, $today]);
        $activeLeave = $checkLeaveStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($activeLeave) {
            // User is currently on approved leave, block login
            http_response_code(403);
            echo json_encode([
                'status' => 'error',
                'error_code' => 'ON_LEAVE',
                'message' => 'This account is currently on leave',
                'leave_details' => [
                    'leave_request_id' => (int)$activeLeave['id'],
                    'leave_type' => $activeLeave['leave_type'],
                    'start_date' => $activeLeave['start_date'],
                    'end_date' => $activeLeave['end_date'],
                    'reason' => $activeLeave['reason']
                ]
            ]);
            exit();
        }
    } catch (PDOException $e) {
        // If leave_request table doesn't exist, continue with login
        error_log('Leave check failed: ' . $e->getMessage());
    }

    // Issue a JWT so the client can access protected endpoints using the same login flow.
    $token = kolektrash_issue_access_token([
        'user_id' => (int)$user->user_id,
        'username' => $user->username,
        'role' => strtolower($role)
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Login Successful',
        'data' => [
            'user_id' => $user->user_id,
            'username' => $user->username,
            'email' => $user->email,
            'firstname' => $user->firstname,
            'lastname' => $user->lastname,
            'role' => $role
        ],
        'access_token' => $token['token'],
        'token_type' => 'Bearer',
        'expires_in' => $token['expires_in']
    ]);
} catch (Throwable $e) {
    error_log('Login endpoint error: ' . $e->getMessage());
    $logDir = __DIR__ . '/../logs';
    if (!is_dir($logDir)) {
        @mkdir($logDir, 0775, true);
    }
    $logFile = $logDir . '/login_errors.log';
    $logEntry = sprintf(
        "[%s] %s\n%s\n\n",
        date('c'),
        $e->getMessage(),
        $e->getTraceAsString()
    );
    @file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    // Provide more helpful error messages for common issues
    $errorMessage = 'Internal server error. Please try again later.';
    $errorCode = $e->getCode();
    $errorMsg = $e->getMessage();
    
    // Check for specific database errors
    if (strpos($errorMsg, "doesn't exist") !== false || strpos($errorMsg, "Base table or view not found") !== false) {
        $errorMessage = 'Database setup incomplete. Please import the kolektrash_db.sql file into your MySQL database.';
    } elseif (strpos($errorMsg, 'Database connection failed') !== false) {
        $errorMessage = 'Cannot connect to database. Please check your database configuration and ensure MySQL is running.';
    } elseif ($e instanceof PDOException) {
        // For PDO exceptions, provide more context
        if (strpos($errorMsg, 'user') !== false && strpos($errorMsg, "doesn't exist") !== false) {
            $errorMessage = 'Database table "user" is missing. Please import kolektrash_db.sql into your database.';
        }
    }
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $errorMessage
    ]);
}
