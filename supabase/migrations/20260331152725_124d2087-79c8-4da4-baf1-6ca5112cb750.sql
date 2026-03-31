-- Fix Toyota Land Cruiser Prado
UPDATE vehicles 
SET image_url = 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&q=85' 
WHERE LOWER(name) LIKE '%land cruiser%' OR LOWER(name) LIKE '%prado%';

-- Fix Jeep Wrangler Sahara
UPDATE vehicles 
SET image_url = 'https://images.unsplash.com/photo-1581540222194-0def2dda95b8?w=800&q=85' 
WHERE LOWER(name) LIKE '%wrangler%';

-- Fix Hyundai Tucson
UPDATE vehicles 
SET image_url = 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=85' 
WHERE LOWER(name) LIKE '%tucson%';

-- Fix Toyota Camry
UPDATE vehicles 
SET image_url = 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&q=85' 
WHERE LOWER(name) LIKE '%camry%';

-- Fix Toyota Hiace Van
UPDATE vehicles 
SET image_url = 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?w=800&q=85' 
WHERE LOWER(name) LIKE '%van%' OR LOWER(name) LIKE '%hiace%';

-- Catch-all for null/empty
UPDATE vehicles 
SET image_url = 'https://images.unsplash.com/photo-1519245659620-e859806a8d3b?w=800&q=85' 
WHERE image_url IS NULL OR TRIM(image_url) = '';