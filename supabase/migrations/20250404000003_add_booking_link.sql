-- Add booking_link column to premium_listings
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS booking_link TEXT DEFAULT NULL;

-- Add comment to the column
COMMENT ON COLUMN premium_listings.booking_link IS 'Optional booking link for premium clinics. If set, a booking button will be shown on the clinic page.';