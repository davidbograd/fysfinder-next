-- Update city_id based on exact matches (case-insensitive)
UPDATE clinics c
SET city_id = ci.id
FROM cities ci
WHERE LOWER(TRIM(c.lokation)) = LOWER(TRIM(ci.bynavn))
AND c.lokation IS NOT NULL;

-- Check for unmatched locations
SELECT DISTINCT lokation
FROM clinics
WHERE lokation IS NOT NULL 
AND city_id IS NULL; 