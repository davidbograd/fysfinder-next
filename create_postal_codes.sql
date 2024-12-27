create table if not exists postal_codes (
  nr varchar(4) primary key,
  navn varchar(255) not null,
  latitude decimal(9,6) not null,
  longitude decimal(9,6) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index on navn for faster searches
create index if not exists postal_codes_navn_idx on postal_codes(navn);

-- Add RLS policies
alter table postal_codes enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on postal_codes
  for select
  to public
  using (true); 