import { supabase } from "@/integrations/supabase/client";

export const DOCS_BUCKET = "driver-docs";

/** Documents required to register as a NorthGo driver. */
export const REQUIRED_DOCS = [
  { key: "driving_licence", label: "Driving licence" },
  { key: "national_id", label: "National ID (front & back)" },
  { key: "psv_badge", label: "PSV badge" },
  { key: "insurance", label: "Vehicle insurance certificate" },
  { key: "logbook", label: "Vehicle logbook" },
  { key: "good_conduct", label: "Certificate of good conduct" },
  { key: "inspection", label: "NTSA inspection certificate" },
] as const;

export function docLabel(key: string) {
  return REQUIRED_DOCS.find((d) => d.key === key)?.label ?? key;
}

/** Create a short-lived signed URL for a private driver document. */
export async function signDocUrl(path: string, expiresIn = 60 * 10): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(DOCS_BUCKET).createSignedUrl(path, expiresIn);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

/** Upload a document file into the signed-in driver's own folder. */
export async function uploadDriverDoc(opts: {
  userId: string;
  driverId: string;
  docType: string;
  file: File;
}): Promise<{ error: string | null }> {
  const { userId, driverId, docType, file } = opts;
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${docType}-${Date.now()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from(DOCS_BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (upErr) return { error: upErr.message };

  const { error: rowErr } = await supabase.from("driver_documents").insert({
    driver_id: driverId,
    user_id: userId,
    doc_type: docType,
    file_path: path,
    file_name: file.name.slice(0, 200),
  });
  if (rowErr) {
    await supabase.storage.from(DOCS_BUCKET).remove([path]);
    return { error: rowErr.message };
  }
  return { error: null };
}
