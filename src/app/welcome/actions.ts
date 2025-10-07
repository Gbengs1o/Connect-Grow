'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const visitorFormSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email().optional().or(z.literal('')),
  phone_number: z.string().optional(),
  visit_date: z.date(),
  service_type: z.enum(['Sunday Service', 'Tuesday Bible Study']),
  source: z.enum(['In-Person', 'Online']),
  prayer_request: z.string().optional(),
});

export async function addVisitor(data: z.infer<typeof visitorFormSchema>) {
  const supabase = createClient();
  
  const validatedData = visitorFormSchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  const { full_name, email, phone_number, visit_date, service_type, source, prayer_request } = validatedData.data;

  const { error } = await supabase.from('visitors').insert({
    full_name,
    email: email || null,
    phone_number: phone_number || null,
    visit_date: visit_date.toISOString().split('T')[0], // Format as YYYY-MM-DD
    service_type,
    source,
    prayer_request: prayer_request || null,
    status: 'First Visit',
  });

  if (error) {
    console.error('Supabase error:', error.message);
    return { success: false, error: 'Failed to save visitor information.' };
  }

  revalidatePath('/admin');
  return { success: true };
}
