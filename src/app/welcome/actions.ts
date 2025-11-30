// FILE: src/app/welcome/actions.ts

'use server'; // This file ONLY contains server-side logic.

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

// This schema defines the shape of the data coming from the form.
const visitorFormSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone_number: z.string().optional(),
  visit_date: z.date(),
  service_type: z.enum(['Sunday Service', 'Tuesday Bible Study']),
  source: z.enum(['In-Person', 'Online']),
  prayer_request: z.string().optional(),
});

// This is the function that will run on the server to save the data.
export async function addVisitor(data: z.infer<typeof visitorFormSchema>) {
  // We use the server client, which is allowed because we have an INSERT policy.
  const supabase = createClient();
  
  // Validate the incoming data against the schema for security.
  const validatedData = visitorFormSchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  const { full_name, email, phone_number, visit_date, service_type, source, prayer_request } = validatedData.data;

  // Insert the validated data into the 'visitors' table.
  const { error } = await supabase.from('visitors').insert({
    full_name,
    email: email || null,
    phone_number: phone_number || null,
    visit_date: visit_date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
    service_type,
    source,
    prayer_request: prayer_request || null,
    status: 'First Visit', // Always set the initial status
  });

  if (error) {
    console.error('Supabase error:', error.message);
    return { success: false, error: 'Failed to save visitor information.' };
  }

  // Tell Next.js to refresh the data on the admin dashboard.
  revalidatePath('/admin');
  return { success: true };
}