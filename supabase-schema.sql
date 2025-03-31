-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  melody JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_recordings_updated_at
BEFORE UPDATE ON recordings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create an index on the title for faster searches
CREATE INDEX IF NOT EXISTS recordings_title_idx ON recordings (title);

-- Create an index on created_at for sorting by date
CREATE INDEX IF NOT EXISTS recordings_created_at_idx ON recordings (created_at DESC);

-- Add RLS (Row Level Security) policies if needed
-- For now, we'll allow public access for simplicity
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public recordings are viewable by everyone" ON recordings FOR SELECT USING (true);
CREATE POLICY "Anyone can insert recordings" ON recordings FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own recordings" ON recordings FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own recordings" ON recordings FOR DELETE USING (true);
