-- Check for any NULL or empty locations in clinics
SELECT COUNT(*) as empty_locations 
FROM clinics 
WHERE lokation IS NULL OR TRIM(lokation) = '';

-- Check for locations that might not have exact matches (case-insensitive)
SELECT DISTINCT c.lokation, 
       (SELECT STRING_AGG(ci.bynavn, ', ') 
        FROM cities ci 
        WHERE LOWER(ci.bynavn) SIMILAR TO LOWER(c.lokation))
FROM clinics c
WHERE lokation IS NOT NULL
ORDER BY c.lokation; 