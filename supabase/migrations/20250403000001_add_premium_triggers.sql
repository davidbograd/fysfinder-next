-- Create trigger function to update updated_at when end_date changes
CREATE OR REPLACE FUNCTION update_premium_listing_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.end_date IS DISTINCT FROM NEW.end_date THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_premium_listing_timestamp
    BEFORE UPDATE ON premium_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_premium_listing_timestamp();

-- Rollback
/**
-- DROP TRIGGER IF EXISTS update_premium_listing_timestamp ON premium_listings;
-- DROP FUNCTION IF EXISTS update_premium_listing_timestamp();
**/ 