import { supabase } from '../config/supabase.js';

const QUERY_SELECT =
  'id, name, company_name, phone_number, email_id, message, created_at';

export async function createQuery(payload) {
  const { data, error } = await supabase
    .from('customer_queries')
    .insert({
      name: payload.name ?? null,
      company_name: payload.company_name ?? null,
      phone_number: payload.phone_number ?? null,
      email_id: payload.email_id ? payload.email_id.toLowerCase() : null,
      message: payload.message ?? null,
    })
    .select(QUERY_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function listQueries(limit = 50) {
  const cappedLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);

  const { data, error } = await supabase
    .from('customer_queries')
    .select(QUERY_SELECT)
    .order('created_at', { ascending: false })
    .limit(cappedLimit);

  if (error) {
    throw error;
  }

  return data;
}
