import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FileUp, Loader2, ShieldCheck, Trash2, Eye } from "lucide-react";
import { DOCS_BUCKET, REQUIRED_DOCS, docLabel, signDocUrl, uploadDriverDoc } from "@/lib/driver-docs";

type Doc = {
  id: string;
  doc_type: string;
  file_path: string;
  file_name: string | null;
  status: string;
  notes: string | null;
  created_at: string;
};

export function DriverDocuments({ userId, driverId }: { userId: string; driverId: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});

  const { data: docs = [], refetch } = useQuery({
    queryKey: ["driver-docs", driverId],
    queryFn: async (): Promise<Doc[]> => {
      const { data, error } = await supabase
        .from("driver_documents")
        .select("id,doc_type,file_path,file_name,status,notes,created_at")
        .eq("driver_id", driverId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  async function handleFile(docType: string, file: File | undefined) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large (max 10MB)");
      return;
    }
    setBusy(docType);
    const { error } = await uploadDriverDoc({ userId, driverId, docType, file });
    setBusy(null);
    if (error) toast.error(error);
    else {
      toast.success(`${docLabel(docType)} uploaded — sent to NorthGo admin for review`);
      refetch();
    }
  }

  async function view(path: string) {
    const url = await signDocUrl(path);
    if (!url) toast.error("Could not open document");
    else window.open(url, "_blank", "noopener");
  }

  async function remove(doc: Doc) {
    if (!confirm("Delete this document?")) return;
    await supabase.storage.from(DOCS_BUCKET).remove([doc.file_path]);
    const { error } = await supabase.from("driver_documents").delete().eq("id", doc.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      refetch();
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl font-bold">Registration documents</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload clear photos or PDFs. Only the NorthGo admin can view these files — they are never public.
      </p>

      <div className="mt-5 space-y-3">
        {REQUIRED_DOCS.map((d) => {
          const uploaded = docs.filter((x) => x.doc_type === d.key);
          return (
            <div key={d.key} className="rounded-xl border border-border/70 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-medium">{d.label}</div>
                <div className="flex items-center gap-2">
                  {uploaded[0] ? (
                    <Badge
                      variant={
                        uploaded[0].status === "approved"
                          ? "default"
                          : uploaded[0].status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {uploaded[0].status}
                    </Badge>
                  ) : (
                    <Badge variant="outline">missing</Badge>
                  )}
                  <input
                    ref={(el) => {
                      inputs.current[d.key] = el;
                    }}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      handleFile(d.key, e.target.files?.[0]);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === d.key}
                    onClick={() => inputs.current[d.key]?.click()}
                  >
                    {busy === d.key ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <FileUp className="mr-1 h-4 w-4" />
                    )}
                    Upload
                  </Button>
                </div>
              </div>

              {uploaded.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {uploaded.map((doc) => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                    >
                      <span className="truncate">{doc.file_name ?? doc.file_path}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <Button size="icon" variant="ghost" onClick={() => view(doc.file_path)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(doc)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {uploaded[0]?.notes && (
                <p className="mt-2 text-xs text-muted-foreground">Admin note: {uploaded[0].notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
