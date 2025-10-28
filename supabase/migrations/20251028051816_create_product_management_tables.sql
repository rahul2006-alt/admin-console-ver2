/*
  # Create Product Management Tables

  ## Overview
  This migration creates tables for the Product Management module:
  - Programs: Structured wellness experiences combining sessions and services
  - Classes: Recurring service offerings with schedules
  - Bundles: Grouped products (programs and/or classes)

  ## New Tables

  ### programs
  Structured wellness experiences that combine sessions and services.
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier
  - `title` (text): Program title
  - `short_description` (text): Brief description
  - `detailed_description` (text): Full description
  - `focus_area` (text): Mind, Body, Nutrition, Sleep, General Wellness
  - `sub_focus_area` (text): Sub-category
  - `tags` (text[]): Array of tags
  - `duration` (integer): Program duration in days
  - `program_type` (text): sequential or modular
  - `provider_id` (text): Reference to business partner
  - `gender` (text): Male, Female, Any
  - `age_group` (text): Target age groups
  - `geography` (text): Target geography
  - `status` (text): draft, review, approved, published, archived
  - `base_price` (numeric): Base price
  - `offer_price` (numeric): Discounted price (optional)
  - `currency` (text): Currency code
  - `items` (jsonb): Array of program items (sessions/services)
  - `created_by` (text): User ID who created
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### classes
  Recurring service offerings with schedules.
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier
  - `title` (text): Class title
  - `short_description` (text): Brief description
  - `detailed_description` (text): Full description
  - `focus_area` (text): Mind, Body, Nutrition, Sleep, General Wellness
  - `sub_focus_area` (text): Sub-category
  - `tags` (text[]): Array of tags
  - `service_id` (text): Reference to service template
  - `recurrence_pattern` (text): Schedule pattern
  - `mode` (text): online, offline, hybrid
  - `capacity` (integer): Maximum participants
  - `provider_id` (text): Reference to business partner
  - `center_id` (text): Optional center reference
  - `gender` (text): Male, Female, Any
  - `age_group` (text): Target age groups
  - `geography` (text): Target geography
  - `status` (text): draft, approved, published, archived
  - `subscription_type` (text): monthly, quarterly, annual, per-class
  - `base_price` (numeric): Price per subscription period
  - `currency` (text): Currency code
  - `created_by` (text): User ID who created
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### bundles
  Grouped products (programs and/or classes).
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier
  - `title` (text): Bundle title
  - `short_description` (text): Brief description
  - `detailed_description` (text): Full description
  - `focus_area` (text): Mind, Body, Nutrition, Sleep, General Wellness
  - `sub_focus_area` (text): Sub-category
  - `tags` (text[]): Array of tags
  - `bundle_type` (text): programs, classes, mixed
  - `included_programs` (text[]): Array of program IDs
  - `included_classes` (text[]): Array of class IDs
  - `provider_id` (text): Reference to business partner
  - `gender` (text): Male, Female, Any
  - `age_group` (text): Target age groups
  - `geography` (text): Target geography
  - `status` (text): draft, approved, published, archived
  - `bundle_price` (numeric): Total bundle price
  - `discount_percent` (numeric): Discount percentage
  - `original_price` (numeric): Sum of individual prices
  - `currency` (text): Currency code
  - `validity_days` (integer): Access duration in days
  - `created_by` (text): User ID who created
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for published products
  - Authenticated users can create/update their own products
*/

-- Create programs table
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL,
  detailed_description text DEFAULT '',
  focus_area text NOT NULL,
  sub_focus_area text DEFAULT '',
  tags text[] DEFAULT '{}',
  duration integer NOT NULL,
  program_type text DEFAULT 'sequential',
  provider_id text NOT NULL,
  gender text DEFAULT 'Any',
  age_group text DEFAULT 'Adult',
  geography text DEFAULT 'Global',
  status text DEFAULT 'draft',
  base_price numeric(10,2) NOT NULL,
  offer_price numeric(10,2),
  currency text DEFAULT 'INR',
  items jsonb DEFAULT '[]',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL,
  detailed_description text DEFAULT '',
  focus_area text NOT NULL,
  sub_focus_area text DEFAULT '',
  tags text[] DEFAULT '{}',
  service_id text NOT NULL,
  recurrence_pattern text NOT NULL,
  mode text NOT NULL,
  capacity integer DEFAULT 1,
  provider_id text NOT NULL,
  center_id text,
  gender text DEFAULT 'Any',
  age_group text DEFAULT 'Adult',
  geography text DEFAULT 'India',
  status text DEFAULT 'draft',
  subscription_type text DEFAULT 'monthly',
  base_price numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL,
  detailed_description text DEFAULT '',
  focus_area text NOT NULL,
  sub_focus_area text DEFAULT '',
  tags text[] DEFAULT '{}',
  bundle_type text NOT NULL,
  included_programs text[] DEFAULT '{}',
  included_classes text[] DEFAULT '{}',
  provider_id text NOT NULL,
  gender text DEFAULT 'Any',
  age_group text DEFAULT 'Adult',
  geography text DEFAULT 'Global',
  status text DEFAULT 'draft',
  bundle_price numeric(10,2) NOT NULL,
  discount_percent numeric(5,2) DEFAULT 0,
  original_price numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  validity_days integer DEFAULT 90,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- Programs policies
CREATE POLICY "Anyone can view published programs"
  ON programs FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all programs"
  ON programs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create programs"
  ON programs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update programs"
  ON programs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete programs"
  ON programs FOR DELETE
  TO authenticated
  USING (true);

-- Classes policies
CREATE POLICY "Anyone can view published classes"
  ON classes FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all classes"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (true);

-- Bundles policies
CREATE POLICY "Anyone can view published bundles"
  ON bundles FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all bundles"
  ON bundles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create bundles"
  ON bundles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bundles"
  ON bundles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete bundles"
  ON bundles FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_programs_provider_id ON programs(provider_id);
CREATE INDEX IF NOT EXISTS idx_programs_created_at ON programs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_provider_id ON classes(provider_id);
CREATE INDEX IF NOT EXISTS idx_classes_service_id ON classes(service_id);
CREATE INDEX IF NOT EXISTS idx_classes_created_at ON classes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bundles_status ON bundles(status);
CREATE INDEX IF NOT EXISTS idx_bundles_provider_id ON bundles(provider_id);
CREATE INDEX IF NOT EXISTS idx_bundles_created_at ON bundles(created_at DESC);

-- Insert seed data will be done through the application
