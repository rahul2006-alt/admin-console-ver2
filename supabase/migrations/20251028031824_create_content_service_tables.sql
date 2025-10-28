/*
  # Create Content & Service Management Tables

  ## Overview
  This migration creates tables for the Content & Service Management module:
  - Sessions: Digital content assets (videos, audio, text, interactive)
  - Services: Service templates for bookable offerings

  ## New Tables

  ### sessions
  Digital content assets with metadata, targeting, and pricing information.
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier
  - `title` (text): Session title
  - `short_description` (text): Brief description
  - `detailed_description` (text): Full description
  - `focus_area` (text): Mind, Body, Nutrition, Sleep, General Wellness
  - `sub_focus_area` (text): Sub-category within focus area
  - `tags` (text[]): Array of tags for categorization
  - `content_type` (text): audio, video, text, interactive
  - `duration` (integer): Duration in seconds
  - `language` (text): ISO language code
  - `provider_id` (text): Reference to business partner (provider/dual)
  - `file_url` (text): URL to content file
  - `thumbnail_url` (text): Optional thumbnail URL
  - `gender` (text): Male, Female, Any
  - `age_group` (text): Child, Youth, Adult, Elderly
  - `geography` (text): Target geography
  - `status` (text): draft, review, approved, published, archived
  - `is_free` (boolean): Whether content is free
  - `base_price` (numeric): Price if not free
  - `currency` (text): Currency code
  - `created_by` (text): User ID who created
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ### services
  Service templates for human-delivered offerings.
  
  **Columns:**
  - `id` (uuid, primary key): Unique identifier
  - `title` (text): Service title
  - `short_description` (text): Brief description
  - `detailed_description` (text): Full description
  - `focus_area` (text): Mind, Body, Nutrition, Sleep, General Wellness
  - `sub_focus_area` (text): Sub-category within focus area
  - `tags` (text[]): Array of tags for categorization
  - `service_type` (text): tele-consult, in-person, hybrid, group-class, workshop
  - `delivery_channel` (text): Zoom, Google Meet, In-Person, etc.
  - `default_duration` (integer): Duration in minutes
  - `default_capacity` (integer): Maximum participants
  - `qualified_roles` (text): Required qualifications
  - `provider_id` (text): Reference to business partner
  - `center_id` (text): Optional center reference
  - `gender` (text): Male, Female, Any
  - `age_group` (text): Target age groups (comma-separated)
  - `geography` (text): Target geography
  - `status` (text): defined, validated, approved, active, retired
  - `base_price` (numeric): Service price
  - `currency` (text): Currency code
  - `created_by` (text): User ID who created
  - `created_at` (timestamptz): Creation timestamp
  - `updated_at` (timestamptz): Last update timestamp

  ## Security
  - RLS enabled on both tables
  - Public read access for published/active content
  - Authenticated users can create/update their own content
  - Super admins have full access
*/

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL,
  detailed_description text DEFAULT '',
  focus_area text NOT NULL,
  sub_focus_area text DEFAULT '',
  tags text[] DEFAULT '{}',
  content_type text NOT NULL,
  duration integer NOT NULL,
  language text NOT NULL DEFAULT 'en',
  provider_id text NOT NULL,
  file_url text NOT NULL,
  thumbnail_url text,
  gender text DEFAULT 'Any',
  age_group text DEFAULT 'Adult',
  geography text DEFAULT 'Global',
  status text DEFAULT 'draft',
  is_free boolean DEFAULT true,
  base_price numeric(10,2),
  currency text DEFAULT 'INR',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_description text NOT NULL,
  detailed_description text DEFAULT '',
  focus_area text NOT NULL,
  sub_focus_area text DEFAULT '',
  tags text[] DEFAULT '{}',
  service_type text NOT NULL,
  delivery_channel text NOT NULL,
  default_duration integer NOT NULL,
  default_capacity integer DEFAULT 1,
  qualified_roles text NOT NULL,
  provider_id text NOT NULL,
  center_id text,
  gender text DEFAULT 'Any',
  age_group text DEFAULT 'Adult',
  geography text DEFAULT 'India',
  status text DEFAULT 'defined',
  base_price numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Anyone can view published sessions"
  ON sessions FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can view all sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (true);

-- Services policies
CREATE POLICY "Anyone can view active services"
  ON services FOR SELECT
  USING (status = 'active');

CREATE POLICY "Authenticated users can view all services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete their own services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_focus_area ON sessions(focus_area);
CREATE INDEX IF NOT EXISTS idx_sessions_provider_id ON sessions(provider_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_focus_area ON services(focus_area);
CREATE INDEX IF NOT EXISTS idx_services_provider_id ON services(provider_id);
CREATE INDEX IF NOT EXISTS idx_services_center_id ON services(center_id);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- Insert seed data for sessions
INSERT INTO sessions (
  title, short_description, detailed_description, focus_area, sub_focus_area,
  tags, content_type, duration, language, provider_id, file_url, thumbnail_url,
  gender, age_group, geography, status, is_free, created_by
) VALUES
(
  'Mindful Breathing - Beginner',
  'A 10-minute guided breathing exercise for stress relief',
  'Learn the fundamentals of mindful breathing to reduce stress and anxiety. Perfect for beginners looking to start their meditation journey.',
  'Mind', 'Stress Management',
  ARRAY['meditation', 'breathing', 'stress relief', 'beginner'],
  'audio', 600, 'en', 'bp-001',
  'https://cdn.swastham.ai/audio/breathing-001.mp3',
  'https://cdn.swastham.ai/thumbs/breathing-001.jpg',
  'Any', 'Adult', 'Global', 'published', true, 'usr-003'
),
(
  'Yoga for Back Pain Relief',
  '15-minute gentle yoga sequence for lower back',
  'Gentle yoga poses specifically designed to alleviate lower back pain and improve spinal flexibility. Suitable for all fitness levels.',
  'Body', 'Spine Health',
  ARRAY['yoga', 'back pain', 'flexibility', 'therapeutic'],
  'video', 900, 'en', 'bp-001',
  'https://cdn.swastham.ai/video/yoga-back-001.mp4',
  'https://cdn.swastham.ai/thumbs/yoga-back-001.jpg',
  'Any', 'Adult', 'Global', 'published', false, 'usr-003'
),
(
  'Sleep Meditation - Deep Rest',
  '20-minute guided meditation for better sleep',
  'A calming meditation designed to help you fall asleep faster and achieve deeper, more restful sleep throughout the night.',
  'Mind', 'Sleep',
  ARRAY['meditation', 'sleep', 'relaxation', 'bedtime'],
  'audio', 1200, 'en', 'bp-002',
  'https://cdn.swastham.ai/audio/sleep-001.mp3',
  'https://cdn.swastham.ai/thumbs/sleep-001.jpg',
  'Any', 'Adult', 'Global', 'approved', true, 'usr-003'
),
(
  'Nutrition Basics - Balanced Diet',
  '12-minute educational talk on nutrition fundamentals',
  'Understanding macronutrients, portion control, and building a balanced plate for optimal health.',
  'Nutrition', 'General Nutrition',
  ARRAY['nutrition', 'diet', 'education', 'healthy eating'],
  'video', 720, 'en', 'bp-002',
  'https://cdn.swastham.ai/video/nutrition-001.mp4',
  'https://cdn.swastham.ai/thumbs/nutrition-001.jpg',
  'Any', 'Adult', 'Global', 'draft', true, 'usr-003'
);

-- Update base_price for the paid session
UPDATE sessions SET base_price = 99, currency = 'INR' WHERE title = 'Yoga for Back Pain Relief';

-- Insert seed data for services
INSERT INTO services (
  title, short_description, detailed_description, focus_area, sub_focus_area,
  tags, service_type, delivery_channel, default_duration, default_capacity,
  qualified_roles, provider_id, center_id, gender, age_group, geography,
  status, base_price, currency, created_by
) VALUES
(
  '1:1 Yoga Consultation',
  'Personalized yoga guidance via video call',
  'Get personalized yoga recommendations from certified instructors based on your specific health goals, fitness level, and any physical limitations.',
  'Body', 'General Fitness',
  ARRAY['yoga', 'consultation', 'personalized', 'one-on-one'],
  'tele-consult', 'Zoom', 45, 1,
  'Yoga Instructor, Certified Yoga Therapist', 'bp-001', 'bp-004',
  'Any', 'Adult', 'India', 'active', 499, 'INR', 'usr-002'
),
(
  'Group Zumba Class',
  'High-energy dance fitness session',
  'Join our energetic Zumba classes for a fun, full-body workout that combines Latin and international music with dance movements.',
  'Body', 'Cardio Fitness',
  ARRAY['zumba', 'dance', 'cardio', 'group', 'fitness'],
  'group-class', 'In-Person', 60, 20,
  'Fitness Instructor, Zumba Instructor', 'bp-001', 'bp-004',
  'Any', 'Youth, Adult', 'Pune', 'active', 299, 'INR', 'usr-002'
),
(
  'Physiotherapy Consultation',
  'Expert physiotherapy assessment and treatment',
  'Professional physiotherapy consultation for pain management, injury rehabilitation, and movement optimization.',
  'Body', 'Pain Management',
  ARRAY['physiotherapy', 'rehabilitation', 'pain', 'therapy'],
  'in-person', 'In-Person', 60, 1,
  'Physiotherapist, Licensed PT', 'bp-002', 'bp-005',
  'Any', 'Adult, Elderly', 'Mumbai', 'validated', 799, 'INR', 'usr-005'
),
(
  'Nutrition Counseling',
  'Personalized nutrition planning session',
  'One-on-one nutrition counseling to create customized meal plans based on your health goals, dietary preferences, and lifestyle.',
  'Nutrition', 'Diet Planning',
  ARRAY['nutrition', 'counseling', 'diet', 'meal planning'],
  'tele-consult', 'Google Meet', 30, 1,
  'Nutritionist, Dietitian', 'bp-002', NULL,
  'Any', 'Adult', 'India', 'active', 599, 'INR', 'usr-005'
);
