-- Show the results of the migration
SELECT 
    c.lokation as original_location,
    ci.bynavn as matched_city,
    CASE 
        WHEN c.city_id IS NOT NULL THEN 'Matched'
        WHEN c.lokation IS NULL THEN 'No Location'
        ELSE 'Unmatched'
    END as status
FROM clinics c
LEFT JOIN cities ci ON c.city_id = ci.id
ORDER BY status, original_location;

-- Get statistics about the migration
SELECT 
    COUNT(*) as total_clinics,
    COUNT(city_id) as matched_clinics,
    COUNT(CASE WHEN lokation IS NOT NULL AND city_id IS NULL THEN 1 END) as unmatched_clinics,
    COUNT(CASE WHEN lokation IS NULL THEN 1 END) as no_location_clinics
FROM clinics; 