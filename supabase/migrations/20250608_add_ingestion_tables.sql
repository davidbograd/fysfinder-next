-- Migration: Add data ingestion system tables
-- Description: Creates tables for batch tracking, record processing, and source configurations

-- Batch tracking table
CREATE TABLE IF NOT EXISTS public.data_ingestion_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL,
  source_type TEXT CHECK (source_type IN ('specialty_list', 'clinic_update', 'new_clinics')),
  file_name TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'rolled_back')),
  config JSONB,
  metadata JSONB,
  stats JSONB,
  created_by TEXT DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual record processing table
CREATE TABLE IF NOT EXISTS public.data_ingestion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES data_ingestion_batches(id) ON DELETE CASCADE,
  raw_data JSONB NOT NULL,
  processed_data JSONB,
  matched_clinic_id UUID REFERENCES clinics(clinics_id),
  match_confidence DECIMAL(3,2) CHECK (match_confidence >= 0 AND match_confidence <= 1),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'inserted', 'updated', 'failed', 'review_needed')),
  error_message TEXT,
  review_decision TEXT CHECK (review_decision IN ('approved', 'rejected', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Source configurations table (optional - we'll use JSON files but this could be useful for caching)
CREATE TABLE IF NOT EXISTS public.data_source_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT UNIQUE NOT NULL,
  field_mappings JSONB NOT NULL,
  validation_rules JSONB,
  matching_strategy JSONB,
  default_values JSONB,
  post_processing JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_data_ingestion_batches_source_name ON data_ingestion_batches(source_name);
CREATE INDEX IF NOT EXISTS idx_data_ingestion_batches_status ON data_ingestion_batches(status);
CREATE INDEX IF NOT EXISTS idx_data_ingestion_batches_created_at ON data_ingestion_batches(created_at);

CREATE INDEX IF NOT EXISTS idx_data_ingestion_records_batch_id ON data_ingestion_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_data_ingestion_records_status ON data_ingestion_records(status);
CREATE INDEX IF NOT EXISTS idx_data_ingestion_records_matched_clinic_id ON data_ingestion_records(matched_clinic_id);

CREATE INDEX IF NOT EXISTS idx_data_source_configs_source_name ON data_source_configs(source_name);
CREATE INDEX IF NOT EXISTS idx_data_source_configs_is_active ON data_source_configs(is_active);

-- Enable Row Level Security (RLS) - following existing pattern
ALTER TABLE data_ingestion_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_ingestion_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_source_configs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for public read access (following existing pattern)
CREATE POLICY "Allow public read access on data_ingestion_batches" ON data_ingestion_batches FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on data_ingestion_records" ON data_ingestion_records FOR SELECT TO public USING (true);
CREATE POLICY "Allow public read access on data_source_configs" ON data_source_configs FOR SELECT TO public USING (true);

-- Add comments for documentation
COMMENT ON TABLE data_ingestion_batches IS 'Tracks each batch import session with metadata and processing status';
COMMENT ON TABLE data_ingestion_records IS 'Individual records within each batch with matching results and processing status';
COMMENT ON TABLE data_source_configs IS 'Configuration templates for different data sources (optional - mainly using JSON files)';

COMMENT ON COLUMN data_ingestion_batches.source_type IS 'Type of import: specialty_list, clinic_update, or new_clinics';
COMMENT ON COLUMN data_ingestion_batches.config IS 'JSON configuration used for this batch';
COMMENT ON COLUMN data_ingestion_batches.metadata IS 'Additional metadata like tags, source organization, etc.';
COMMENT ON COLUMN data_ingestion_batches.stats IS 'Processing statistics: success_count, error_count, processing_time, etc.';

COMMENT ON COLUMN data_ingestion_records.raw_data IS 'Original CSV row data as JSON';
COMMENT ON COLUMN data_ingestion_records.processed_data IS 'Cleaned and validated data ready for database insertion';
COMMENT ON COLUMN data_ingestion_records.match_confidence IS 'Confidence score (0.0-1.0) for clinic matching';
COMMENT ON COLUMN data_ingestion_records.review_decision IS 'Manual review decision: approved, rejected, or skipped'; 