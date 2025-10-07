'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const statusSchema = z.enum(["First Visit", "Contacted", "Second Visit", "Regular", "Inactive"]);

export async function updateVisitorStatus(visitorId: string, formData: FormData) {
  const supabase = createClient();
  
  const newStatus = formData.get('status');

  const validation = statusSchema.safeParse(newStatus);
  if (!validation.success) {
    return { success: false, error: 'Invalid status value.' };
  }

  const { error } = await supabase
    .from('visitors')
    .update({ status: validation.data })
    .eq('id', visitorId);

  if (error) {
    console.error('Supabase status update error:', error.message);
    return { success: false, error: 'Failed to update status.' };
  }

  revalidatePath(`/admin/visitors/${visitorId}`);
  revalidatePath(`/admin/visitors`);
  revalidatePath(`/admin`);

  return { success: true, message: 'Status updated successfully!' };
}
