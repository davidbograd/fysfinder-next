-- First, let's see what submissions are ready to be processed
SELECT 
    id,
    klinik_navn,
    is_update,
    CASE 
        WHEN is_update THEN 'Update existing clinic'
        ELSE 'New clinic'
    END as submission_type,
    CASE 
        WHEN matched_clinic_id IS NOT NULL THEN (
            SELECT "klinikNavn" 
            FROM clinics 
            WHERE "clinics_id" = matched_clinic_id
        )
        ELSE NULL
    END as matched_clinic_name,
    submitted_at,
    verified
FROM clinic_submissions_staging
WHERE verified = true 
    AND processed_at IS NULL
ORDER BY submitted_at;

-- To process a specific submission, run:
-- SELECT process_verified_submission('submission-uuid-here');

-- To process all verified submissions that haven't been processed yet:
DO $$
DECLARE
    submission RECORD;
    processed_count INT := 0;
    error_count INT := 0;
BEGIN
    FOR submission IN 
        SELECT id, klinik_navn, is_update
        FROM clinic_submissions_staging
        WHERE verified = true 
            AND processed_at IS NULL
        ORDER BY submitted_at
    LOOP
        BEGIN
            RAISE NOTICE 'Processing submission for clinic: % (% clinic)', 
                submission.klinik_navn,
                CASE WHEN submission.is_update THEN 'Updating' ELSE 'New' END;
            
            PERFORM process_verified_submission(submission.id);
            processed_count := processed_count + 1;
            
            RAISE NOTICE 'Successfully processed submission for: %', submission.klinik_navn;
        EXCEPTION WHEN OTHERS THEN
            error_count := error_count + 1;
            RAISE WARNING 'Error processing submission % (%): %', 
                submission.id, 
                submission.klinik_navn, 
                SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Processing complete. Processed: %, Errors: %', processed_count, error_count;
END;
$$; 