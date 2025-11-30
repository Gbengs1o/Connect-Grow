'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { Resend } from 'resend';
import { revalidatePath } from 'next/cache';
import { format } from 'date-fns';
import { getEmailLists, addEmailList, deleteEmailList, addEmailToList, removeEmailFromList, type EmailList } from '@/lib/email-list-manager';

const attendanceSchema = z.object({
  visitorIds: z.array(z.string().uuid()).optional().default([]),
  emailListIds: z.array(z.string()).optional().default([]),
});

const emailListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'List name too long'),
});

const recipientSchema = z.object({
  listId: z.string().min(1, 'Invalid list ID'),
  email: z.string().email('Invalid email address'),
});

const emailTemplateSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  body: z.string().min(1, 'Body is required').max(2000, 'Body too long'),
});

export async function getFirstTimeVisitors() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('visitors')
    .select('id, full_name')
    .eq('status', 'First Visit')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching first-time visitors:', error);
    return [];
  }
  
  return data;
}

export async function getEmailListsData() {
  return getEmailLists();
}

export async function processAttendance(prevState: any, formData: FormData) {
  const supabase = createClient();
  
  if (!process.env.RESEND_API_KEY) {
    return { success: false, message: 'Resend API key is not configured.' };
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  const validation = attendanceSchema.safeParse({
    visitorIds: formData.getAll('visitorIds'),
    emailListIds: formData.getAll('emailListIds'),
  });
  
  if (!validation.success) {
    return { success: false, message: 'Invalid form data.' };
  }
  
  const { visitorIds: tickedVisitorIds, emailListIds: selectedEmailListIds } = validation.data;
  
  if (tickedVisitorIds.length === 0) {
    return { success: true, message: 'No visitors were selected. Nothing to update.' };
  }
  
  const { data: updatedVisitors, error: updateError } = await supabase
    .from('visitors')
    .update({ status: 'Second Visit' })
    .in('id', tickedVisitorIds)
    .select('full_name');
  
  if (updateError) {
    console.error('Error updating visitor status:', updateError);
    return { success: false, message: 'Failed to update visitor statuses.' };
  }
  
  if (selectedEmailListIds.length > 0 && updatedVisitors && updatedVisitors.length > 0) {
    // Get email lists from local storage
    const emailLists = getEmailLists();
    const selectedLists = emailLists.filter(list => selectedEmailListIds.includes(list.id));
    
    // Collect all email addresses from selected lists
    const recipientEmails: string[] = [];
    selectedLists.forEach(list => {
      recipientEmails.push(...list.emails);
    });
    
    if (recipientEmails.length > 0) {
      const today = format(new Date(), 'PPP');
      
      // Get the dynamic email template
      const template = await getAttendanceEmailTemplate();
      
      // Format the visitor list
      const visitorList = updatedVisitors
        .map(visitor => `- ${visitor.full_name} is now a Second Timer.`)
        .join('\n');
      
      // Replace placeholders in the template
      const subject = template.subject.replace('{{attendance_date}}', today);
      const bodyText = template.body
        .replace('{{visitor_list}}', visitorList)
        .replace('{{attendance_date}}', today);
      
      // Convert newlines to HTML breaks for better email formatting
      const bodyHtml = bodyText.replace(/\n/g, '<br>');
      
      try {
        await resend.emails.send({
          from: 'Visitor System <visitors@innovastsolution.com>',
          to: recipientEmails,
          subject: subject,
          html: bodyHtml,
        });
      } catch (emailError) {
        // Log the entire error object to the server console for full details.
        console.error('Resend API Error - Full Details:', emailError);
        // Provide a more helpful message to the user.
        return { success: false, message: 'Statuses updated, but the notification email failed to send. Please check the server logs for a detailed error from the email provider.' };
      }
    }
  }
  
  revalidatePath('/admin/attendance');
  revalidatePath('/admin/visitors');
  revalidatePath('/admin');
  
  return { success: true, message: `Successfully processed attendance for ${updatedVisitors.length} visitor(s)!` };
}

// Email List Management Actions

export async function createEmailListAction(prevState: any, formData: FormData) {
  const validation = emailListSchema.safeParse({
    name: formData.get('name'),
  });
  
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }
  
  const { name } = validation.data;
  
  const success = addEmailList(name);
  
  if (!success) {
    return { success: false, message: 'A list with this name already exists or failed to create.' };
  }
  
  revalidatePath('/admin/attendance');
  return { success: true, message: 'Email list created successfully!' };
}

export async function deleteEmailListAction(listId: string) {
  const success = deleteEmailList(listId);
  
  if (!success) {
    return { success: false, message: 'Failed to delete email list.' };
  }
  
  revalidatePath('/admin/attendance');
  return { success: true, message: 'Email list deleted successfully!' };
}

export async function addRecipientToListAction(prevState: any, formData: FormData) {
  const validation = recipientSchema.safeParse({
    listId: formData.get('listId'),
    email: formData.get('email'),
  });
  
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }
  
  const { listId, email } = validation.data;
  
  const success = addEmailToList(listId, email);
  
  if (!success) {
    return { success: false, message: 'This email is already in the list or failed to add.' };
  }
  
  revalidatePath('/admin/attendance');
  return { success: true, message: 'Recipient added successfully!' };
}

export async function getRecipientsForListAction(listId: string) {
  const emailLists = getEmailLists();
  const list = emailLists.find(l => l.id === listId);
  
  if (!list) {
    return [];
  }
  
  return list.emails.map((email, index) => ({
    id: `${listId}-${index}`,
    email,
    name: null
  }));
}

export async function deleteRecipientAction(listId: string, email: string) {
  const success = removeEmailFromList(listId, email);
  
  if (!success) {
    return { success: false, message: 'Failed to remove recipient.' };
  }
  
  revalidatePath('/admin/attendance');
  return { success: true, message: 'Recipient removed successfully!' };
}

// Email Template Management Actions

export async function getAttendanceEmailTemplate() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'attendance_email_template')
    .single();
  
  if (error) {
    console.error('Error fetching email template:', error);
    // Return default template if not found
    return {
      subject: 'Visitor Status Update: {{attendance_date}}',
      body: 'The following guest(s) have returned for a second visit:\\n\\n{{visitor_list}}'
    };
  }
  
  return data.value;
}

export async function updateAttendanceEmailTemplate(prevState: any, formData: FormData) {
  const supabase = createClient();
  
  const validation = emailTemplateSchema.safeParse({
    subject: formData.get('subject'),
    body: formData.get('body'),
  });
  
  if (!validation.success) {
    return { success: false, message: validation.error.errors[0].message };
  }
  
  const { subject, body } = validation.data;
  
  const { error } = await supabase
    .from('app_settings')
    .upsert({
      key: 'attendance_email_template',
      value: { subject, body },
      updated_at: new Date().toISOString()
    });
  
  if (error) {
    console.error('Error updating email template:', error);
    return { success: false, message: 'Failed to update email template.' };
  }
  
  revalidatePath('/admin/attendance');
  return { success: true, message: 'Email template updated successfully!' };
}