-- Enable RLS on the staging table
ALTER TABLE clinic_submissions_staging ENABLE ROW LEVEL SECURITY;

-- Create a restrictive RLS policy that denies all access
-- Only service role key can bypass this
CREATE POLICY "Deny all access to staging submissions" ON clinic_submissions_staging 
FOR ALL USING (false); 