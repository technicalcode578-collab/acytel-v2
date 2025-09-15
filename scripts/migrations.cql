-- This command creates our primary application "keyspace," which is analogous
-- to a schema or database in other systems. We use a SimpleStrategy because
-- we are in a single-node development environment.
CREATE KEYSPACE IF NOT EXISTS acytel
  WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : 1 };

-- This command creates the 'users' table within the 'acytel' keyspace.
-- This table will store the core identity information for our users.
CREATE TABLE IF NOT EXISTS acytel.users (
  id UUID PRIMARY KEY,
  email TEXT,
  hashed_password TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- This command creates the 'tracks' table to store metadata for all audio.
-- 'storage_path' will point to the file's location in our MinIO service.
-- 'uploaded_by' creates a crucial link to the 'users' table.
CREATE TABLE IF NOT EXISTS acytel.tracks (
  id UUID PRIMARY KEY,
  title TEXT,
  artist TEXT,
  album TEXT,
  duration_in_seconds INT,
  storage_path TEXT,
  artwork_path TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
-- Defines the core table for storing playlist metadata.
CREATE TABLE IF NOT EXISTS acytel.playlists (
    id UUID PRIMARY KEY,
    name TEXT,
    description TEXT,
    owner_id UUID,
    track_ids LIST<UUID>,
    artwork_id TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Creates an index on the owner_id for fast lookups of a user's playlists.
CREATE INDEX IF NOT EXISTS ON acytel.playlists (owner_id);

-- Add OAuth support columns to users table
-- These columns have been added. If you need to re-run this script,
-- you can comment out these lines to avoid errors.
-- ALTER TABLE acytel.users ADD google_id TEXT;
-- ALTER TABLE acytel.users ADD display_name TEXT;
-- ALTER TABLE acytel.users ADD profile_picture TEXT;
-- ALTER TABLE acytel.users ADD auth_provider TEXT;

-- Create index for Google ID lookups
CREATE INDEX IF NOT EXISTS ON acytel.users (google_id);

-- Update existing users to have 'local' auth provider
-- Note: This might need to be done programmatically for existing data
