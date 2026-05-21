import { supabase } from '../config/supabase.js';

const CHANNEL_SELECT =
  'id, user_id, token, page_id, channel_type, created_at, updated_at';

export async function getChannelsByUserIdAndTypes(userId, channelTypes) {
  const { data, error } = await supabase
    .from('channel_details')
    .select(CHANNEL_SELECT)
    .eq('user_id', userId)
    .in('channel_type', channelTypes)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function getChannelsByUserId(userId, channelType) {
  let query = supabase
    .from('channel_details')
    .select(CHANNEL_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (channelType) {
    query = query.eq('channel_type', channelType);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function upsertChannel(userId, payload) {
  const { data, error } = await supabase
    .from('channel_details')
    .upsert(
      {
        user_id: userId,
        token: payload.token,
        page_id: payload.page_id,
        channel_type: payload.channel_type,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,page_id,channel_type' }
    )
    .select(CHANNEL_SELECT)
    .single();

  if (error) {
    if (error.code === '23503') {
      const notFound = new Error('User not found');
      notFound.statusCode = 404;
      throw notFound;
    }
    throw error;
  }

  return data;
}
