-- Create the settings table
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for Admins
CREATE POLICY "Admins can manage settings" ON settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.user_id = auth.uid() 
            AND staff.role = 'Admin'
        )
    );

-- Insert default reminder message if it doesn't exist
INSERT INTO settings (key, value) 
VALUES ('reminder_message', 'Hello Follow-Up Team,\n\nThis is a reminder to check on visitors who need follow-up. Please review the admin dashboard for visitors with "First Visit" status.\n\nThank you!')
ON CONFLICT (key) DO NOTHING;

-- Note: This implementation uses the Resend API directly via fetch() instead of the Resend SDK
-- to avoid dependency issues with @react-email/render. The RESEND_API_KEY environment variable
-- is still required for email sending functionality.
