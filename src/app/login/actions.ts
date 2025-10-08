'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  // Step 1: Authenticate the user
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return redirect('/login?message=Could not authenticate user. Please check your credentials.');
  }

  // Step 2: Authorize the user by checking their role in the 'staff' table
  const { data: staffProfile, error: profileError } = await supabase
    .from('staff')
    .select('role')
    .eq('user_id', authData.user.id)
    .single();

  if (profileError || !staffProfile) {
    // This happens if RLS blocks the query or the user isn't in the staff table
    await supabase.auth.signOut(); // Log them out for security
    return redirect('/login?message=Your account could not be verified.');
  }

  // Step 3: Check the role and redirect accordingly
  if (staffProfile.role === 'Admin' || staffProfile.role === 'Follow-Up Team') {
    // Success! User is approved.
    revalidatePath('/', 'layout');
    redirect('/admin');
  } else {
    // User is 'Pending' or has an unrecognized role
    await supabase.auth.signOut(); // Log them out
    return redirect('/login?message=Your account is pending approval.');
  }
}