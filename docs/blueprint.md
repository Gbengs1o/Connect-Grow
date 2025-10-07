# **App Name**: Connect & Grow

## Core Features:

- User Authentication: Secure user authentication system with login and sign-out functionality using Supabase Auth.
- Visitor Welcome Form: Public-facing form to capture new visitor information (full name, email, phone, visit date, service type, prayer request) and store it in Supabase visitors table.
- Admin Dashboard: Secure dashboard with at-a-glance statistics: new visitors this week, total visitors, needs follow-up.  Displays a table of the 5 most recent visitors.
- Visitor List: Table view of all visitors, searchable by name, with links to individual detail pages.
- Visitor Detail Page: Display all visitor details, including a form to update their status and a communication log.
- Status Updates: Allow admins to update visitor status via a dropdown and save it to the database using a Server Action.
- AI Assisted follow up message: Use a Large Language Model tool to compose the body of a message for reaching out to new visitors

## Style Guidelines:

- Primary color: Warm Teal (#4DB6AC), reminiscent of growth and tranquility.
- Background color: Very light grayish-teal (#F0F4F3).
- Accent color: Yellow-Orange (#F4511E) to signal important CTAs.
- Headline font: 'Belleza' (sans-serif) for headlines and short amounts of text. Body font: 'Alegreya' (serif) if longer text is anticipated. 
- Use simple, clear icons from a set like Feather or Tabler Icons, related to user management and communication.
- Use a clean, card-based layout for the admin dashboard. Employ a sidebar for navigation.
- Subtle transitions and animations on form submissions and data updates.