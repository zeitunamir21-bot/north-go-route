CREATE TABLE IF NOT EXISTS public.driver_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  doc_type text NOT NULL,
  file_path text NOT NULL,
  file_name text,
  status text NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.driver_documents TO authenticated;
GRANT ALL ON public.driver_documents TO service_role;

ALTER TABLE public.driver_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers view own documents"
ON public.driver_documents FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Drivers insert own documents"
ON public.driver_documents FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (SELECT 1 FROM public.drivers d WHERE d.id = driver_id AND d.user_id = auth.uid())
  AND length(doc_type) <= 60
  AND length(file_path) <= 400
  AND coalesce(length(file_name), 0) <= 200
);

CREATE POLICY "Drivers delete own documents"
ON public.driver_documents FOR DELETE TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update documents"
ON public.driver_documents FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS driver_documents_driver_id_idx ON public.driver_documents(driver_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_driver_documents_updated_at
BEFORE UPDATE ON public.driver_documents
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE POLICY "Drivers upload own docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'driver-docs' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner or admin reads docs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'driver-docs'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Owner or admin deletes docs"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'driver-docs'
  AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(), 'admin'))
);