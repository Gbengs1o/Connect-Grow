'use server';
import { createClient } from '@/lib/supabase/server';

// Define the settings type
type ScheduleSettings = {
  days: string[];
  time: string;
  enabled: boolean;
  message: string;
};

// Update the cron job schedule in Supabase
export async function updateCronJobSchedule(
  days: string[],
  time: string,
  enabled: boolean,
  message: string
) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated.' };
    }

    // Upsert the schedule settings
    const { error } = await supabase
      .from('reminder_settings')
      .upsert({
        user_id: user.id,
        days: days,
        time: time,
        enabled: enabled,
        message: message,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('Supabase update error:', error);
      return { success: false, error: 'Failed to save settings to database.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// Get current settings from Supabase
export async function getCurrentSettings() {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated.' };
    }

    // Fetch the current settings
    const { data, error } = await supabase
      .from('reminder_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Supabase fetch error:', error);
      return { success: false, error: 'Failed to fetch settings.' };
    }

    return { 
      success: true, 
      data: data as ScheduleSettings | null 
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// Send immediate reminder via Edge Function
export async function sendImmediateReminder(message: string) {
  try {
    const supabase = await createClient();

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated.' };
    }

    // Call the Edge Function to send the email
    const { data, error } = await supabase.functions.invoke('send-immediate-reminder', {
      body: { 
        message: message,
        user_id: user.id 
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error: 'Failed to send reminder.' };
    }

    // Log to database for record-keeping
    const { error: insertError } = await supabase
      .from('immediate_reminders')
      .insert({
        user_id: user.id,
        message: message,
        sent_at: new Date().toISOString(),
        status: 'sent'
      });

    if (insertError) {
      console.error('Failed to log reminder:', insertError);
      // Don't fail the whole operation if logging fails
    }

    return { 
      success: true, 
      email_id: data?.email_id,
      sent_to: data?.sent_to 
    };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// Test the Edge Function connection (optional helper)
export async function testEdgeFunctionConnection() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated.' };
    }

    // Try to invoke the scheduled reminders function manually
    const { data, error } = await supabase.functions.invoke('send-scheduled-reminders', {
      body: {}
    });

    if (error) {
      console.error('Edge function test error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// Get reminder history (optional - for viewing past sent reminders)
export async function getReminderHistory(limit: number = 10) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated.' };
    }

    // Fetch reminder history
    const { data, error } = await supabase
      .from('immediate_reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch history:', error);
      return { success: false, error: 'Failed to fetch reminder history.' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

// Delete schedule (optional - if user wants to remove their schedule)
export async function deleteSchedule() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: 'User not authenticated.' };
    }

    const { error } = await supabase
      .from('reminder_settings')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to delete schedule:', error);
      return { success: false, error: 'Failed to delete schedule.' };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}