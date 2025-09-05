<?php
require_once '../config/api.php';

try {
    ApiConfig::setCorsHeaders();
    
    $requestUri = $_SERVER['REQUEST_URI'];
    $pathParts = explode('/', trim($requestUri, '/'));
    $foodId = null;
    
    if (isset($_GET['id'])) {
        $foodId = $_GET['id'];
    }
    
    if ($foodId) {
        $foods = [ApiConfig::getItemById('foods', $foodId)];
    } else {
        $foods = ApiConfig::makeRequest('foods');
    }
    
    if (is_array($foods)) {
        foreach ($foods as &$food) {
            if (!isset($food['name']) && isset($food['food_name'])) {
                $food['name'] = $food['food_name'];
            }
            
            if (!isset($food['description'])) {
                $food['description'] = 'Delicious and fresh';
            }
            
            if (!isset($food['category'])) {
                $food['category'] = 'Food';
            }
            
            if (isset($food['price'])) {
                $food['formatted_price'] = 'R$ ' . number_format($food['price'], 2, ',', '.');
            }
            
            if (isset($food['image']) && !empty($food['image'])) {
                if (!preg_match('/^https?:\/\//', $food['image'])) {
                    $food['image'] = 'https://apifakedelivery.vercel.app' . $food['image'];
                }
            }
            
            $food['fetched_at'] = date('Y-m-d H:i:s');
        }
    }
    
    ApiConfig::sendResponse($foods);
    
} catch (Exception $e) {
    ApiConfig::logError('Failed to fetch foods', [
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
    
    ApiConfig::sendError('Failed to fetch foods: ' . $e->getMessage());
}
?>