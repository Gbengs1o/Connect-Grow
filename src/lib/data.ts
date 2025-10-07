import { createClient } from './supabase/server';
import { subDays } from 'date-fns';
import { unstable_noStore as noStore } from 'next/cache';
import type { CommunicationLog, Visitor } from './types';

export async function getDashboardStats() {
  noStore();
  const supabase = createClient();
  const sevenDaysAgo = subDays(new Date(), 7).toISOString();

  const { count: totalVisitors, error: totalError } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true });

  const { count: newVisitors, error: newError } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .gte('visit_date', sevenDaysAgo);

  const { count: needsFollowUp, error: followUpError } = await supabase
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'First Visit');

  if (totalError || newError || followUpError) {
    console.error('Error fetching dashboard stats:', totalError, newError, followUpError);
    return {
      totalVisitors: 0,
      newVisitorsThisWeek: 0,
      needsFollowUp: 0,
    };
  }

  return {
    totalVisitors: totalVisitors ?? 0,
    newVisitorsThisWeek: newVisitors ?? 0,
    needsFollowUp: needsFollowUp ?? 0,
  };
}

export async function getRecentVisitors() {
  noStore();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .order('visit_date', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching recent visitors:', error);
    return [];
  }
  return data as Visitor[];
}

export async function getAllVisitors(query: string) {
  noStore();
  const supabase = createClient();
  let queryBuilder = supabase.from('visitors').select('*').order('visit_date', { ascending: false });

  if (query) {
    queryBuilder = queryBuilder.ilike('full_name', `%${query}%`);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Error fetching all visitors:', error);
    return [];
  }
  return data as Visitor[];
}


export async function getVisitorById(id: string) {
  noStore();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching visitor by ID:', error);
    return null;
  }
  return data as Visitor;
}

export async function getCommunicationsForVisitor(visitorId: string) {
    noStore();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('communications_log')
      .select('*')
      .eq('visitor_id', visitorId)
      .order('sent_at', { ascending: false });
  
    if (error) {
      console.error('Error fetching communications log:', error);
      return [];
    }
    return data as CommunicationLog[];
  }
