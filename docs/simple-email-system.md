# Simple Email List System

## Overview
The attendance system now uses a simple, local email list management system that stores email lists in a JSON file within the Next.js application. This eliminates the need for complex database setup while maintaining full functionality.

## How It Works

### Email Storage
- Email lists are stored in `src/lib/email-lists.json`
- No database required - everything is managed locally
- Easy to backup and version control

### Email Sending
- Uses Resend API with `innovastsolution.com` domain
- Requires `RESEND_API_KEY` in `.env.local`
- Sends to all emails in selected lists

### Attendance Process
1. **Mark Attendance**: Select returning first-time visitors
2. **Choose Lists**: Select which email lists to notify
3. **Submit**: System updates visitor status AND sends emails

## Configuration

### Environment Variables
Add to your `.env.local`:
```
RESEND_API_KEY=your_resend_api_key_here
```

### Default Email Lists
The system comes with three default lists:
- **Pastors**: pastor@innovastsolution.com
- **Follow-Up Team**: followup@innovastsolution.com  
- **Leadership Team**: leadership@innovastsolution.com

### Managing Email Lists
1. **Create Lists**: Use the "Create New List" button
2. **Add Emails**: Click "Manage" on any list to add recipients
3. **Delete Lists**: Use the delete button (with confirmation)
4. **Remove Emails**: Individual emails can be removed from lists

## Email Template
The system uses customizable email templates with placeholders:
- `{{visitor_list}}` - List of returning visitors
- `{{attendance_date}}` - Current date

## Features
- ✅ **Simple Setup**: No database configuration needed
- ✅ **Local Storage**: Email lists stored in JSON file
- ✅ **Full Management**: Create, edit, delete lists and recipients
- ✅ **Reliable Sending**: Uses Resend API with verified domain
- ✅ **Customizable**: Edit email templates directly in UI
- ✅ **Attendance Tracking**: Updates visitor status from "First Visit" to "Second Visit"

## File Structure
```
src/
├── lib/
│   ├── email-lists.json          # Email list storage
│   └── email-list-manager.ts     # Management functions
└── app/admin/attendance/
    ├── actions.ts                # Server actions (updated)
    ├── page.tsx                  # Main attendance page
    └── components/
        ├── AttendanceForm.tsx    # Visitor selection form
        └── EmailListManager.tsx  # Email list management UI
```

## Usage
1. Visit `/admin/attendance`
2. Create your email lists and add recipients
3. Mark attendance for returning visitors
4. Select notification lists
5. Submit to update statuses and send emails

The system is now ready to use with minimal setup required!