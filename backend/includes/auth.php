<?php
if (!function_exists('kolektrash_auth_config')) {
    function kolektrash_auth_config(): array
    {
        static $config = null;
        if ($config === null) {
            $config = require __DIR__ . '/../config/auth.php';
        }
        return $config;
    }
}

if (!function_exists('kolektrash_rbac_config')) {
    function kolektrash_rbac_config(): array
    {
        static $config = null;
        if ($config === null) {
            $config = require __DIR__ . '/../config/rbac.php';
        }
        return $config;
    }
}

if (!function_exists('kolektrash_base64url_encode')) {
    function kolektrash_base64url_encode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
}

if (!function_exists('kolektrash_base64url_decode')) {
    function kolektrash_base64url_decode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/')) ?: '';
    }
}

if (!function_exists('kolektrash_issue_access_token')) {
    function kolektrash_issue_access_token(array $claims, ?int $ttlOverride = null): array
    {
        $config = kolektrash_auth_config();
        $secret = $config['secret_key'];
        $now = time();
        $ttl = $ttlOverride ?? ($config['access_token_ttl'] ?? 3600);

        $payload = array_merge([
            'iss' => $config['issuer'] ?? 'kolektrash-backend',
            'aud' => $config['audience'] ?? 'kolektrash-app',
            'iat' => $now,
            'nbf' => $now,
            'exp' => $now + $ttl,
        ], $claims);

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $segments = [
            kolektrash_base64url_encode(json_encode($header, JSON_UNESCAPED_SLASHES)),
            kolektrash_base64url_encode(json_encode($payload, JSON_UNESCAPED_SLASHES))
        ];
        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = kolektrash_base64url_encode($signature);

        return [
            'token' => implode('.', $segments),
            'payload' => $payload,
            'expires_in' => $ttl
        ];
    }
}

if (!function_exists('kolektrash_verify_token')) {
    function kolektrash_verify_token(string $token): array
    {
        $config = kolektrash_auth_config();
        $secret = $config['secret_key'];
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new RuntimeException('Malformed token');
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;
        $header = json_decode(kolektrash_base64url_decode($encodedHeader), true);
        $payload = json_decode(kolektrash_base64url_decode($encodedPayload), true);
        $signature = kolektrash_base64url_decode($encodedSignature);

        if (!is_array($header) || !is_array($payload)) {
            throw new RuntimeException('Invalid token body');
        }

        if (($header['alg'] ?? null) !== 'HS256') {
            throw new RuntimeException('Unsupported token algorithm');
        }

        $expectedSignature = hash_hmac('sha256', $encodedHeader . '.' . $encodedPayload, $secret, true);
        if (!hash_equals($expectedSignature, $signature)) {
            throw new RuntimeException('Token signature mismatch');
        }

        $now = time();
        if (isset($payload['nbf']) && $now < (int)$payload['nbf']) {
            throw new RuntimeException('Token not yet valid');
        }
        if (isset($payload['exp']) && $now >= (int)$payload['exp']) {
            throw new RuntimeException('Token expired');
        }
        if (isset($payload['iss']) && ($payload['iss'] !== ($config['issuer'] ?? null))) {
            throw new RuntimeException('Token issuer mismatch');
        }
        if (isset($payload['aud']) && ($payload['aud'] !== ($config['audience'] ?? null))) {
            throw new RuntimeException('Token audience mismatch');
        }

        return $payload;
    }
}

if (!function_exists('kolektrash_get_authorization_header')) {
    function kolektrash_get_authorization_header(): ?string
    {
        $header = null;
        if (function_exists('getallheaders')) {
            $headers = getallheaders();
            if ($headers) {
                foreach ($headers as $key => $value) {
                    if (strcasecmp($key, 'Authorization') === 0) {
                        $header = $value;
                        break;
                    }
                }
            }
        }

        if ($header === null) {
            $serverKeys = ['HTTP_AUTHORIZATION', 'Authorization'];
            foreach ($serverKeys as $key) {
                if (!empty($_SERVER[$key])) {
                    $header = $_SERVER[$key];
                    break;
                }
            }
        }

        return is_string($header) ? trim($header) : null;
    }
}

if (!function_exists('kolektrash_extract_bearer_token')) {
    function kolektrash_extract_bearer_token(?string $header): ?string
    {
        if (!$header) {
            return null;
        }
        if (stripos($header, 'Bearer ') === 0) {
            return trim(substr($header, 7));
        }
        return null;
    }
}

if (!function_exists('kolektrash_respond_json')) {
    function kolektrash_respond_json(int $status, array $payload): void
    {
        http_response_code($status);
        header('Content-Type: application/json');
        echo json_encode($payload);
        exit();
    }
}

if (!function_exists('kolektrash_set_current_user')) {
    function kolektrash_set_current_user(?array $user): void
    {
        $GLOBALS['KOLEKTRASH_AUTH_USER'] = $user;
    }
}

if (!function_exists('kolektrash_current_user')) {
    function kolektrash_current_user(): ?array
    {
        return $GLOBALS['KOLEKTRASH_AUTH_USER'] ?? null;
    }
}

if (!function_exists('kolektrash_authenticate_request')) {
    function kolektrash_authenticate_request(): array
    {
        $header = kolektrash_get_authorization_header();
        $token = kolektrash_extract_bearer_token($header);
        if (!$token) {
            kolektrash_respond_json(401, [
                'status' => 'error',
                'message' => 'Missing or invalid Authorization header'
            ]);
        }

        try {
            $payload = kolektrash_verify_token($token);
        } catch (Throwable $e) {
            kolektrash_respond_json(401, [
                'status' => 'error',
                'message' => 'Invalid or expired token',
                'detail' => $e->getMessage()
            ]);
        }

        if (!isset($payload['user_id']) || !isset($payload['role'])) {
            kolektrash_respond_json(401, [
                'status' => 'error',
                'message' => 'Token missing required claims'
            ]);
        }

        $payload['user_id'] = (int)$payload['user_id'];
        $payload['role'] = strtolower((string)$payload['role']);

        kolektrash_set_current_user($payload);
        return $payload;
    }
}

if (!function_exists('kolektrash_require_auth')) {
    function kolektrash_require_auth(): array
    {
        $user = kolektrash_current_user();
        if ($user) {
            return $user;
        }
        return kolektrash_authenticate_request();
    }
}

if (!function_exists('kolektrash_authorize_roles')) {
    function kolektrash_authorize_roles(array $allowedRoles): array
    {
        $user = kolektrash_require_auth();
        $normalized = array_map('strtolower', $allowedRoles);
        if (!in_array($user['role'], $normalized, true)) {
            kolektrash_respond_json(403, [
                'status' => 'error',
                'message' => 'Forbidden: role not permitted'
            ]);
        }
        return $user;
    }
}

if (!function_exists('kolektrash_enforce_access_for_script')) {
    function kolektrash_enforce_access_for_script(?string $scriptName = null): ?array
    {
        $config = kolektrash_rbac_config();
        $script = $scriptName ?? basename($_SERVER['SCRIPT_NAME'] ?? '');
        $script = strtolower($script);

        $public = $config['public_endpoints'] ?? [];
        if (in_array($script, $public, true)) {
            return null;
        }

        $user = kolektrash_require_auth();

        $allowedRoles = null;
        $custom = $config['custom_policies'] ?? [];
        if (array_key_exists($script, $custom)) {
            $policy = $custom[$script];
            if (is_array($policy)) {
                $allowedRoles = $policy;
            } elseif ($policy === null) {
                $allowedRoles = null; // Explicitly allow all authenticated users
            }
        }

        if ($allowedRoles === null) {
            $roleGroups = $config['role_groups'] ?? [];
            foreach ($roleGroups as $group => $scripts) {
                if (in_array($script, $scripts, true)) {
                    switch ($group) {
                        case 'admin_only':
                            $allowedRoles = ['admin'];
                            break;
                        case 'staff_only':
                            $allowedRoles = ['admin', 'truck_driver', 'garbage_collector', 'foreman'];
                            break;
                        default:
                            $allowedRoles = $config['defaults']['allowedRoles'] ?? null;
                            break;
                    }
                    break;
                }
            }
        }

        if ($allowedRoles === null) {
            $allowedRoles = $config['defaults']['allowedRoles'] ?? null;
        }

        if (is_array($allowedRoles) && !in_array($user['role'], array_map('strtolower', $allowedRoles), true)) {
            kolektrash_respond_json(403, [
                'status' => 'error',
                'message' => 'Forbidden: insufficient privileges'
            ]);
        }

        return $user;
    }
}

if (!function_exists('kolektrash_require_ownership_or_admin')) {
    function kolektrash_require_ownership_or_admin(int $ownerUserId): array
    {
        $user = kolektrash_require_auth();
        if ($user['role'] === 'admin' || $user['user_id'] === $ownerUserId) {
            return $user;
        }
        kolektrash_respond_json(403, [
            'status' => 'error',
            'message' => 'Forbidden: ownership or admin required'
        ]);
        return $user; // unreachable but keeps static analysers happy
    }
}
