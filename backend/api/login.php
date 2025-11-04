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

    if (!$user->login()) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Invalid credentials.'
        ]);
        exit();
    }

    $role = $user->role_name ?: 'resident';

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
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error. Please try again later.'
    ]);
}
