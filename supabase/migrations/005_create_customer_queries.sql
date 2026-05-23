CREATE TABLE public.customer_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  company_name TEXT,
  phone_number TEXT,
  email_id TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_queries_created_at ON public.customer_queries (created_at DESC);

ALTER TABLE public.customer_queries DISABLE ROW LEVEL SECURITY;
