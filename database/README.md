# Database Setup

## Required Tables for Attendance Feature

To use the attendance tracking feature, you need to create the email notification tables and settings table in your Supabase database.

### Setup Instructions

1. **Run the email tables SQL script:**
   - Open your Supabase dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of `email_tables.sql`
   - Execute the script

2. **Run the settings table SQL script:**
   - Copy and paste the contents of `settings.sql`
   - Execute the script
   - This creates the customizable email template system

3. **Add email recipients:**
   After creating the tables, add email recipients to your lists:
   
   ```sql
   -- Example: Add recipients to the Pastors list
   INSERT INTO email_recipients (list_id, email, name) 
   VALUES 
       ((SELECT id FROM email_lists WHERE name = 'Pastors'), 'pastor@yourchurch.com', 'Pastor Name'),
       ((SELECT id FROM email_lists WHERE name = 'Follow-Up Team'), 'followup@yourchurch.com', 'Follow-up Coordinator');
   ```

4. **Configure Resend API:**
   - Add your `RESEND_API_KEY` to `.env.local`
   - The system now uses `visitors@innovastsolution.com` as the verified sender address

### Table Structure

- **email_lists**: Stores notification list names (Pastors, Follow-Up Team, etc.)
- **email_recipients**: Stores email addresses associated with each list
- **app_settings**: Stores customizable email templates and other application settings

All tables have Row Level Security (RLS) enabled and are only accessible by authenticated users.

### New Features

- **Customizable Email Templates**: Admins can edit email subject and body directly in the UI
- **Enhanced Recipient Management**: View, add, and delete individual email recipients
- **Improved Error Logging**: Detailed error messages for email sending failures
- **Dynamic Placeholders**: Use `{{visitor_list}}` and `{{attendance_date}}` in templates