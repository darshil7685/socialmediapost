CREATE TYPE channel_type AS ENUM ('instagram', 'facebook', 'linkedin');

CREATE TABLE public.channel_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  page_id TEXT NOT NULL,
  channel_type channel_type NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, page_id, channel_type)
);

CREATE INDEX idx_channel_details_user_id ON public.channel_details (user_id);

ALTER TABLE public.channel_details ENABLE ROW LEVEL SECURITY;
