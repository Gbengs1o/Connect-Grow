'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const signupFormSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function signUpAction(data: z.infer<typeof signupFormSchema>) {
  const supabase = await createClient();
  
  const validatedData = signupFormSchema.safeParse(data);
  if (!validatedData.success) {
    return { success: false, error: 'Invalid data provided.' };
  }

  const { full_name, email, password } = validatedData.data;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  });

  if (error) {
    console.error('Supabase sign up error:', error.message);
    if (error.message.includes('User already registered')) {
        return { success: false, error: 'A user with this email already exists.' };
    }
    return { success: false, error: 'Failed to create account.' };
  }

  return { success: true };
}
