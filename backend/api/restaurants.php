<?php
require_once '../config/api.php';

try {
    ApiConfig::setCorsHeaders();
    
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', trim($requestUri, '/'));
    $restaurantId = null;
    
    if (isset($_GET['id'])) {
        $restaurantId = $_GET['id'];
    }
    
    if ($restaurantId) {
        $restaurants = [ApiConfig::getItemById('restaurants', $restaurantId)];
    } else {
        $restaurants = ApiConfig::makeRequest('restaurants');
    }
    
    if (is_array($restaurants)) {
        foreach ($restaurants as &$restaurant) {
            // Add default fields if missing
            if (!isset($restaurant['name']) && isset($restaurant['restaurant_name'])) {
                $restaurant['name'] = $restaurant['restaurant_name'];
            }
            
            if (!isset($restaurant['description'])) {
                $restaurant['description'] = 'Delicious food and great service';
            }
            
            if (!isset($restaurant['category'])) {
                $restaurant['category'] = 'Restaurant';
            }
            
            if (isset($restaurant['image']) && !empty($restaurant['image'])) {
                if (!preg_match('/^https?:\/\//', $restaurant['image'])) {
                    $restaurant['image'] = 'https://apifakedelivery.vercel.app' . $restaurant['image'];
                }
            }
            
            $restaurant['fetched_at'] = date('Y-m-d H:i:s');
        }
    }
    
    ApiConfig::sendResponse($restaurants);
    
} catch (Exception $e) {
    ApiConfig::logError('Failed to fetch restaurants', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    ApiConfig::sendError('Failed to fetch restaurants: ' . $e->getMessage());
}
?>