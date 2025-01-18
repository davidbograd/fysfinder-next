-- Add the new cityId column
ALTER TABLE clinics
ADD COLUMN city_id UUID REFERENCES cities(id);

-- Create an index for better query performance
CREATE INDEX idx_clinics_city_id ON clinics(city_id); 