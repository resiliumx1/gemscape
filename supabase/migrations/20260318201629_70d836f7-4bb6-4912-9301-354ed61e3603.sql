UPDATE vehicles SET image_url = CASE id
  WHEN 'a9fc5f13-d3c9-471f-b3a7-e532adcbd2c1' THEN 'https://images.unsplash.com/photo-1625231334601-78d380089e4c?w=800&q=85'
  WHEN 'b4148ead-b00e-45a2-a9f5-82e1151347ad' THEN 'https://images.unsplash.com/photo-1581650074650-78e0e tried-0e94?w=800&q=85'
  WHEN 'd36873d3-6d6a-4584-b6d7-b09c3792989e' THEN 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=85'
  WHEN '36f12aeb-5307-40d1-8699-64f74fab931d' THEN 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=85'
  WHEN '18c6a5d7-874d-4d5f-8092-0d0dc8d17412' THEN 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&q=85'
  WHEN 'be40536b-bce7-4fb3-8cf7-c894700d8ec2' THEN 'https://images.unsplash.com/photo-1621993202323-eb4e81916c68?w=800&q=85'
  ELSE image_url
END;