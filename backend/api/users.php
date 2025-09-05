<?php
require_once '../config/api.php';

try {
    ApiConfig::setCorsHeaders();
    
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', trim($requestUri, '/'));
    $userId = null;
    
    if (isset($_GET['id'])) {
        $userId = $_GET['id'];
    }
    
    if ($userId) {
        $users = [ApiConfig::getItemById('users', $userId)];
    } else {
        $users = ApiConfig::makeRequest('users');
    }
    
    if (is_array($users)) {
        foreach ($users as &$user) {
            if (!isset($user['name'])) {
                if (isset($user['first_name']) || isset($user['last_name'])) {
                    $user['name'] = trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? ''));
                } else {
                    $user['name'] = $user['username'] ?? 'User';
                }
            }
            
            if (!isset($user['email']) && isset($user['username'])) {
                $user['email'] = $user['username'] . '@example.com';
            }
            
            if (!isset($user['role'])) {
                $user['role'] = 'Customer';
            }
            
            if (isset($user['created_at'])) {
                $user['formatted_date'] = date('d/m/Y H:i', strtotime($user['created_at']));
            }
            
            $imageFields = ['avatar', 'image', 'photo', 'picture'];
            foreach ($imageFields as $field) {
                if (isset($user[$field]) && !empty($user[$field])) {
                    if (!preg_match('/^https?:\/\//', $user[$field])) {
                        $user[$field] = 'https://apifakedelivery.vercel.app' . $user[$field];
                    }
                }
            }
            
            $user['fetched_at'] = date('Y-m-d H:i:s');
        }
    }
    
    ApiConfig::sendResponse($users);
    
} catch (Exception $e) {
    ApiConfig::logError('Failed to fetch users', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    ApiConfig::sendError('Failed to fetch users: ' . $e->getMessage());
}
?>