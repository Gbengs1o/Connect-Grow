-- File: database/settings.sql

CREATE TABLE IF NOT EXISTS public.app_settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read settings" ON public.app_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to update settings" ON public.app_settings FOR UPDATE TO authenticated USING (true);

-- Insert the default, user-configurable template.
-- This uses the specific wording requested.
INSERT INTO public.app_settings (key, value) VALUES (
  'attendance_email_template',
  '{
    "subject": "Visitor Status Update: {{attendance_date}}",
    "body": "The following guest(s) have returned for a second visit:\\n\\n{{visitor_list}}"
  }'
) ON CONFLICT (key) DO NOTHING;