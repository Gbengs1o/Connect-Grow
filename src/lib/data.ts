// src/lib/data.ts - Final Version with Workaround for Database Relationship Issue

import { unstable_noStore as noStore } from 'next/cache';
import { createClient } from './supabase/server';
import { supabaseAdmin } from './supabase/admin';
import type { CommunicationLog, Staff, Visitor } from './types';

// --- Functions that MUST use the ADMIN client to bypass RLS ---

export async function getDashboardStats() {
  noStore();
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const [totalRes, newRes, followupRes] = await Promise.all([
      supabaseAdmin.from('visitors').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('visitors').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      supabaseAdmin.from('visitors').select('*', { count: 'exact', head: true }).eq('status', 'First Visit')
    ]);
    if (totalRes.error) throw totalRes.error;
    if (newRes.error) throw newRes.error;
    if (followupRes.error) throw followupRes.error;
    return {
      totalVisitors: totalRes.count ?? 0,
      newVisitorsThisWeek: newRes.count ?? 0,
      needsFollowUp: followupRes.count ?? 0,
    };
  } catch (error) {
    console.error('Database Error: Failed to fetch dashboard stats.', error);
    return { totalVisitors: 0, newVisitorsThisWeek: 0, needsFollowUp: 0 };
  }
}

export async function getRecentVisitors() {
  noStore();
  try {
    const { data, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .order('visit_date', { ascending: false })
      .limit(5);
    if (error) throw error;
    return (data as Visitor[]) || [];
  } catch (error) {
    console.error('Database Error: Failed to fetch recent visitors.', error);
    return [];
  }
}

export async function getAllVisitors(query: string) {
  noStore();
  try {
    let queryBuilder = supabaseAdmin.from('visitors').select('*').order('visit_date', { ascending: false });
    if (query) {
      queryBuilder = queryBuilder.ilike('full_name', `%${query}%`);
    }
    const { data, error } = await queryBuilder;
    if (error) throw error;
    return (data as Visitor[]) || [];
  } catch (error) {
    console.error('Database Error: Failed to fetch all visitors.', error);
    return [];
  }
}

export async function getVisitorById(id: string) {
  noStore();
  try {
    const { data, error } = await supabaseAdmin
      .from('visitors')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Visitor | null;
  } catch (error) {
    console.error('Database Error: Failed to fetch visitor by ID.', error);
    return null;
  }
}

export async function getCommunicationsForVisitor(visitorId: string) {
  noStore();
  try {
    const { data, error } = await supabaseAdmin
      .from('communications_log')
      .select('*')
      .eq('visitor_id', visitorId)
      .order('sent_at', { ascending: false });
    if (error) throw error;
    return (data as CommunicationLog[]) || [];
  } catch (error) {
    console.error('Database Error: Failed to fetch communications log.', error);
    return [];
  }
}

// --- WORKAROUND VERSION FOR getAllStaff ---
// This function manually fetches users and joins the data in code
// to bypass the database foreign key relationship error.
export async function getAllStaff() {
  noStore();
  try {
    // Step 1: Fetch all staff profiles from your table
    const { data: staff, error: staffError } = await supabaseAdmin
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });
    if (staffError) throw staffError;
    if (!staff || staff.length === 0) return [];

    // Step 2: Get the list of user IDs from the profiles
    const userIds = staff.map(member => member.user_id).filter(Boolean);
    if (userIds.length === 0) {
      return staff.map(member => ({ ...member, email: 'N/A' }));
    }

    // Step 3: Fetch all users from Supabase Auth to get their emails
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (usersError) throw usersError;

    // Step 4: Create a fast lookup map: Map<userId, email>
    const emailMap = new Map(users.map(u => [u.id, u.email]));

    // Step 5: Combine the staff profiles with their emails
    return staff.map(member => ({
      ...member,
      email: emailMap.get(member.user_id) || 'User email not found',
    })) as Staff[] || [];

  } catch (error) {
    console.error('Database Error: Failed to fetch all staff.', error);
    return [];
  }
}

// --- Function that uses the USER-CONTEXT client ---
export async function getStaffMember(userId: string) {
  noStore();
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error("Database Error: Failed to fetch staff member profile.", error);
    }
    return data as Staff | null;
  } catch (error) {
    console.error("Catastrophic error in getStaffMember", error);
    return null;
  }
}