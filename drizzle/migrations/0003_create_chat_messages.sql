CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  user_id uuid,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX chat_messages_session_idx ON public.chat_messages (session_id, created_at);

GRANT SELECT, INSERT ON public.chat_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chat_messages TO authenticated;
GRANT ALL ON public.chat_messages TO service_role;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone reads own session messages"
ON public.chat_messages FOR SELECT TO anon, authenticated
USING (length(session_id) >= 10 AND length(session_id) <= 80);

CREATE POLICY "Anyone adds own session messages"
ON public.chat_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(session_id) >= 10 AND length(session_id) <= 80
  AND role IN ('user', 'assistant')
  AND length(content) <= 4000
);