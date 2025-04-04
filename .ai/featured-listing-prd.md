# Featured Listing (Premium) - Product Requirements Document

## Overview

The Featured Listing feature allows paying customers to have their clinic listings appear more prominently on location pages. This premium feature helps clinics increase their visibility and attract more potential patients.

## Feature Requirements

### Premium Status

- A clinic can be marked as having premium status
- Premium status has defined start and end dates
- Premium status affects the clinic's visibility and ranking on location pages
- Premium status is managed through Supabase admin interface
- Premium periods can be scheduled to start in the future

### Location Visibility

- Featured listings appear at the top of their primary location page
- Featured listings can appear in additional selected locations
- All featured listings appear at the top of search results, regardless of their primary location

### Visual Distinction

- Featured listings have a distinct visual appearance:
  - Light gold/premium background color
  - "Featured" badge
  - Slightly larger card size
  - Border highlighting

### Time Management

- Premium status has clear start and end dates
- System automatically activates premium status on start date
- System automatically reverts listing to normal status after end date
- Future enhancement: Admin notification before premium status expires

## Database Changes

### New Table: `premium_listings`

```sql
CREATE TABLE premium_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(clinics_id),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (start_date < end_date)
);

-- Index for faster lookups
CREATE INDEX idx_premium_listings_clinic_id ON premium_listings(clinic_id);
CREATE INDEX idx_premium_listings_dates ON premium_listings(start_date, end_date);

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
```

### New Table: `premium_listing_locations`

```sql
CREATE TABLE premium_listing_locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    premium_listing_id UUID REFERENCES premium_listings(id),
    city_id UUID REFERENCES cities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (premium_listing_id, city_id)
);

-- Index for faster lookups
CREATE INDEX idx_premium_listing_locations_city ON premium_listing_locations(city_id);
```

### Handling Renewals

Renewals are handled by simply updating the dates in the `premium_listings` table. For example:

```sql
-- To renew a premium listing for another month
UPDATE premium_listings
SET
    start_date = end_date,
    end_date = end_date + INTERVAL '1 month',
    updated_at = NOW()
WHERE clinic_id = 'target_clinic_id';
```

## Implementation Tasks

### Database Setup

- [x] Create `premium_listings` table
- [x] Create `premium_listing_locations` table
- [x] Add necessary indexes

### Backend Changes

- [x] Modify location page query to include premium status
- [x] Add sorting logic to prioritize premium listings
- [x] Create database functions for premium status checks

### Frontend Changes

- [x] Update `ClinicCard.tsx` to support premium styling
  - Add premium background color
  - Add "Featured" badge
  - Adjust card sizing
- [x] Modify location page sorting to handle premium listings

### Testing

- [ ] Unit tests for premium status logic
- [ ] Integration tests for location page sorting
- [ ] Visual regression tests for premium styling
- [ ] End-to-end tests for premium workflow

### Documentation

- [ ] Create admin guide for managing premium listings in Supabase
- [ ] Document premium status workflow

## Future Enhancements

- Admin notifications for expiring premium status
- Automated payment processing integration
- Analytics dashboard for premium listing performance
- A/B testing different premium styling options

## Technical Considerations

### Premium Status Management

The recommended approach for handling time limits on premium listings is to use database timestamps:

1. **Database Timestamps**

   - Store start_date and end_date in the premium_listings table
   - Use database functions to check if current_timestamp is between start_date and end_date
   - Added constraint to ensure start_date is before end_date

2. **Status Checks**
   - Regular query to identify active and future premium listings
   - Automatic activation on start_date
   - Automatic reversion to normal status after end_date

This approach provides several benefits:

- Simple to implement and maintain
- Support for scheduling future premium periods
- Efficient queries for current status
- Easy to extend for future payment integration
- Minimal performance impact on page loads
