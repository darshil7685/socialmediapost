import { supabase } from '../config/supabase.js';

const BROADCAST_SELECT =
  'id, user_id, channel_type, message, file_path, created_at';

export async function createBroadcastDetail({
  userId,
  channelType,
  message,
  filePath,
}) {
  const { data, error } = await supabase
    .from('broadcast_details')
    .insert({
      user_id: userId,
      channel_type: channelType,
      message: message ?? null,
      file_path: filePath,
    })
    .select(BROADCAST_SELECT)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getBroadcastDetailsByUserId(userId) {
  const { data, error } = await supabase
    .from('broadcast_details')
    .select(BROADCAST_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}
