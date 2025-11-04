<?php
return [
    'secret_key' => getenv('KOLEKTRASH_JWT_SECRET') ?: 'change-this-secret-in-production-1f1ce7a5f1414c8bb021e8bdcb6d6bf8',
    'issuer' => 'kolektrash-backend',
    'audience' => 'kolektrash-app',
    'access_token_ttl' => 3600, // 1 hour
    'refresh_token_ttl' => 604800 // 7 days (reserved for future use)
];
