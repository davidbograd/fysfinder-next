-- First, let's update these specific locations with their corresponding cities
WITH location_mappings (from_location, to_city) AS (
  VALUES 
    ('Amager', 'København S'),
    ('Nørrebro', 'København N'),
    ('Østerbro', 'København Ø'),
    ('Sydhavn', 'København SV'),
    ('Vesterbro', 'København V')
)
UPDATE clinics c
SET city_id = ci.id
FROM location_mappings lm
JOIN cities ci ON LOWER(TRIM(ci.bynavn)) = LOWER(TRIM(lm.to_city))
WHERE LOWER(TRIM(c.lokation)) = LOWER(TRIM(lm.from_location))
AND c.city_id IS NULL;

-- Verify the updates
SELECT 
    c.lokation as original_location,
    ci.bynavn as matched_city
FROM clinics c
JOIN cities ci ON c.city_id = ci.id
WHERE c.lokation IN ('Amager', 'Nørrebro', 'Østerbro', 'Sydhavn', 'Vesterbro'); 