# Enhanced Clinic Data Ingestion System

This system provides automated CSV import with deduplication, batch tracking, and manual review capabilities.

## Step-by-Step Import Guide

### 1. Upload Your CSV File

Place your CSV file in the `scripts/ingestion/csv-ingestion-data/` folder:

```bash
# Example location:
./scripts/ingestion/csv-ingestion-data/my-clinic-data.csv
```

**Note**: Run all commands from the project root directory (`fysfinder-next/`)

### 2. Create Configuration (First Time Only)

If this is a new data source, create a configuration:

```bash
npm run config:create
```

- Follow the prompts to create a new config file
- Update the generated file in `scripts/config/sources/your-source.json`
- Key things to update:
  - `field_mapping`: Map CSV columns to database columns
  - `required_columns`: Which fields must be present
  - `actions.add_specialties`: What specialties to add (e.g., `["Parkinson"]`)

### 3. Test Your Configuration

```bash
npm run config:test -- --config=your-source
```

This validates your configuration file is correct.

### 4. Import Your Data

```bash
npm run import:enhanced -- --file=scripts/ingestion/csv-ingestion-data/your-file.csv --source=your-source --review
```

- High confidence matches (≥75%) are processed automatically
- Opens review interface for uncertain matches (0.4-0.74)
- Approved/rejected records are processed automatically after review
- Potential new clinics are tracked but not created
- **This is the complete workflow - no additional steps needed!**

### 5. Check Potential New Clinics (Optional)

```bash
npm run list:new-clinics
```

- Lists clinics that were identified but not auto-created
- Manually decide which ones should be added to the platform

---

## Quick Start

1. **Run the migration** (first time only):

   ```bash
   # Apply the database migration
   supabase db push
   ```

2. **Test a configuration**:

   ```bash
   npm run config:test -- --config=parkinsons
   ```

3. **Import data**:
   ```bash
   npm run import:enhanced -- --file=data.csv --source=parkinsons
   ```

## Available Commands

### Import Commands

- `npm run import:enhanced -- --file=data.csv --source=parkinsons` - Standard import
- `npm run import:enhanced -- --file=data.csv --source=parkinsons --dry-run` - Test without changes
- `npm run import:enhanced -- --file=data.csv --source=parkinsons --review` - Force manual review

### Configuration Commands

- `npm run config:create` - Create new source configuration
- `npm run config:test -- --config=parkinsons` - Validate configuration

### Review Commands

- `npm run review:batch -- --batch-id=<uuid>` - Manual review with automatic processing
- `npm run process:approved -- --batch-id=<uuid>` - Process approved reviews (if needed manually)
- `npm run list:new-clinics` - List potential new clinics from recent batches
- `npm run list:new-clinics -- --batch-id=<uuid>` - List potential new clinics from specific batch

### Reporting Commands

- `npm run specialty:report -- --batch-id=<uuid>` - Detailed specialty addition report for any batch

**📄 File Output**: Both the main import and specialty reports are automatically saved to files in `scripts/ingestion/reports/` for later review and sharing.

### Management Commands

- `npm run import:rollback -- --batch-id=<uuid>` - Rollback a batch

## File Structure

```
scripts/
├── ingestion/
│   ├── enhanced-import.ts      # Main import script
│   ├── matching-engine.ts      # Deduplication logic
│   ├── batch-manager.ts        # Batch tracking
│   ├── review-interface.ts     # CLI review interface
│   ├── review-batch.ts         # Standalone review script
│   ├── process-approved.ts     # Process approved reviews
│   ├── specialty-report.ts     # Detailed specialty reports
│   ├── csv-ingestion-data/     # CSV files to import
│   ├── reports/               # Generated report files
│   └── README.md              # This file
├── config/
│   ├── create-config.ts       # Configuration creator
│   ├── test-config.ts         # Configuration validator
│   └── sources/
│       ├── template.json      # Template for new sources
│       └── parkinsons.json    # Example configuration
```

## Configuration Format

Each data source needs a JSON configuration file in `scripts/config/sources/`:

```json
{
  "source_name": "parkinsons_association",
  "source_type": "specialty_list",
  "expected_columns": ["klinikNavn", "adresse", "postnummer"],
  "required_columns": ["klinikNavn"],
  "actions": {
    "add_specialties": ["Parkinsons", "Neurologi"],
    "set_fields": {},
    "tags": ["parkinsons_association_2025"]
  }
}
```

## Implementation Status

- ✅ **Phase 1**: Database schema + file structure
- ✅ **Phase 2**: Core processing logic with auto-processing
- ✅ **Phase 3**: Matching engine + manual review interface
- ✅ **Phase 4**: Configuration system
- ⏳ **Phase 5**: Reporting & polish

## Database Tables

The system uses three new tables:

1. **`data_ingestion_batches`** - Tracks each import session
2. **`data_ingestion_records`** - Individual records with matching results
3. **`data_source_configs`** - Optional configuration caching

## Confidence Scoring

- **≥ 0.75**: Auto-process (high confidence match)
- **0.4-0.74**: Manual review required
- **< 0.4**: Track as potential new clinic (no auto-creation)

## Processing Workflow

### Standard Import (Fully Automated)

1. **Import**: `npm run import:enhanced -- --file=data.csv --source=parkinsons`
   - High confidence matches (≥0.75) are auto-processed immediately
   - Uncertain matches (0.4-0.74) are queued for review
   - Low confidence (<0.4) are tracked as potential new clinics

### Import with Manual Review (Streamlined)

1. **Import with Review**: `npm run import:enhanced -- --file=data.csv --source=parkinsons --review`
   - High confidence matches (≥0.75) are auto-processed immediately
   - Manual review interface opens for uncertain matches (0.4-0.74)
   - **Approved records are processed automatically after review**
   - **Rejected records are created as new clinics automatically**
   - Low confidence (<0.4) are tracked as potential new clinics

### Standalone Review (If Needed Later)

1. **Review**: `npm run review:batch -- --batch-id=<uuid>`
   - Manual review of uncertain matches with side-by-side comparison
   - **Automatic processing happens immediately after review session**
   - No separate processing step needed

### Legacy Manual Processing (Optional)

- `npm run process:approved -- --batch-id=<uuid>` - Only needed if automatic processing failed
- `npm run list:new-clinics` - Review potential new clinics that weren't auto-created

## Next Steps

Ready for production use! The system now supports:

- ✅ Automated processing with intelligent deduplication
- ✅ Manual review interface for uncertain cases
- ✅ Complete audit trail and batch management
