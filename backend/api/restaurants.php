<?php
require_once '../config/api.php';

try {
    // Set CORS headers
    ApiConfig::setCorsHeaders();
    
    // Check if requesting specific restaurant
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', trim($requestUri, '/'));
    $restaurantId = null;
    
    // Look for ID in the URL
    if (isset($_GET['id'])) {
        $restaurantId = $_GET['id'];
    }
    
    // Get restaurants data from external API
    if ($restaurantId) {
        $restaurants = [ApiConfig::getItemById('restaurants', $restaurantId)];
    } else {
        $restaurants = ApiConfig::makeRequest('restaurants');
    }
    
    // Process and enhance the data if needed
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
            
            // Add timestamp
            $restaurant['fetched_at'] = date('Y-m-d H:i:s');
        }
    }
    
    // Send response
    ApiConfig::sendResponse($restaurants);
    
} catch (Exception $e) {
    // Log error
    ApiConfig::logError('Failed to fetch restaurants', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Send error response
    ApiConfig::sendError('Failed to fetch restaurants: ' . $e->getMessage());
}
?>