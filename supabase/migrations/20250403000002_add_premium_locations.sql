-- Create premium_listing_locations table
CREATE TABLE premium_listing_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    premium_listing_id UUID REFERENCES premium_listings(id),
    city_id UUID REFERENCES cities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (premium_listing_id, city_id)
);

-- Add index for performance
CREATE INDEX idx_premium_listing_locations_city ON premium_listing_locations(city_id);

-- Rollback
/**
-- DROP INDEX IF EXISTS idx_premium_listing_locations_city;
-- DROP TABLE IF EXISTS premium_listing_locations;
**/ 