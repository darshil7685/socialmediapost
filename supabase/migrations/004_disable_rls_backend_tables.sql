-- Backend-only tables: Express uses service role / direct DB.
-- RLS was enabled without policies, which blocks inserts with anon/publishable keys.

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_details DISABLE ROW LEVEL SECURITY;
