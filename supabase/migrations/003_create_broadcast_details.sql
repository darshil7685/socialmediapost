CREATE TABLE public.broadcast_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  channel_type channel_type NOT NULL,
  message TEXT,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_broadcast_details_user_id ON public.broadcast_details (user_id);
CREATE INDEX idx_broadcast_details_created_at ON public.broadcast_details (created_at DESC);

ALTER TABLE public.broadcast_details ENABLE ROW LEVEL SECURITY;
