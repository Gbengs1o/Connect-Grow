-- Create the email_lists table
CREATE TABLE IF NOT EXISTS email_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the email_recipients table
CREATE TABLE IF NOT EXISTS email_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES email_lists(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(list_id, email)
);

-- Enable Row Level Security
ALTER TABLE email_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_recipients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for Admins only
CREATE POLICY "Admins can manage email lists" ON email_lists
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.user_id = auth.uid() 
            AND staff.role = 'Admin'
        )
    );

CREATE POLICY "Admins can manage email recipients" ON email_recipients
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM staff 
            WHERE staff.user_id = auth.uid() 
            AND staff.role = 'Admin'
        )
    );

-- Insert some default email lists
INSERT INTO email_lists (name, description) 
VALUES 
    ('Pastors', 'Church pastoral team'),
    ('Follow-Up Team', 'Visitor follow-up coordinators'),
    ('Leadership', 'Church leadership team')
ON CONFLICT (name) DO NOTHING;

-- Note: Add email recipients manually through the admin interface or by running additional INSERT statements
-- Example:
-- INSERT INTO email_recipients (list_id, email, name) 
-- VALUES 
--     ((SELECT id FROM email_lists WHERE name = 'Pastors'), 'pastor@church.com', 'Pastor John'),
--     ((SELECT id FROM email_lists WHERE name = 'Follow-Up Team'), 'followup@church.com', 'Follow-up Coordinator');