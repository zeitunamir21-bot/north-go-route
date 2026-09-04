import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Eye, FolderLock, X } from "lucide-react";
import { docLabel, signDocUrl } from "@/lib/driver-docs";

type Doc = {
  id: string;
  driver_id: string;
  doc_type: string;
  file_path: string;
  file_name: string | null;
  status: string;
  created_at: string;
};

/** Admin-only viewer for driver registration documents (RLS restricts this to admins). */
export function AdminDriverDocs({ drivers }: { drivers: { id: string; full_name: string }[] }) {
  const qc = useQueryClient();

  const { data: docs = [] } = useQuery({
    queryKey: ["admin", "driver-docs"],
    queryFn: async (): Promise<Doc[]> => {
      const { data, error } = await supabase
        .from("driver_documents")
        .select("id,driver_id,doc_type,file_path,file_name,status,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Live notification when a driver uploads a new document
  useEffect(() => {
    const channel = supabase
      .channel("admin-driver-docs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "driver_documents" },
        (payload) => {
          const d = payload.new as { doc_type?: string };
          toast.success(`New driver document uploaded: ${docLabel(d.doc_type ?? "")}`);
          qc.invalidateQueries({ queryKey: ["admin", "driver-docs"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  async function setStatus(id: string, status: string) {
    const { error } = await supabase.from("driver_documents").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Document ${status}`);
      qc.invalidateQueries({ queryKey: ["admin", "driver-docs"] });
    }
  }

  async function view(path: string) {
    const url = await signDocUrl(path);
    if (!url) toast.error("Could not open document");
    else window.open(url, "_blank", "noopener");
  }

  const byDriver = drivers
    .map((d) => ({ driver: d, docs: docs.filter((x) => x.driver_id === d.id) }))
    .filter((g) => g.docs.length > 0);

  return (
    <section className="mt-10">
      <div className="flex items-center gap-2">
        <FolderLock className="h-5 w-5 text-primary" />
        <h2 className="font-display text-2xl font-bold">Driver documents</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Private files visible to the NorthGo admin only.
      </p>

      <div className="mt-4 space-y-4">
        {byDriver.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            No documents uploaded yet.
          </div>
        )}
        {byDriver.map(({ driver, docs: list }) => (
          <div key={driver.id} className="rounded-2xl border border-border bg-card p-5">
            <div className="font-display text-lg font-bold">{driver.full_name}</div>
            <ul className="mt-3 space-y-2">
              {list.map((doc) => (
                <li
                  key={doc.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2 text-sm"
                >
                  <span className="min-w-0">
                    <span className="font-medium">{docLabel(doc.doc_type)}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {doc.file_name ?? doc.file_path}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    <Badge
                      variant={
                        doc.status === "approved"
                          ? "default"
                          : doc.status === "rejected"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {doc.status}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => view(doc.file_path)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setStatus(doc.id, "approved")}>
                      <Check className="h-4 w-4 text-primary" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setStatus(doc.id, "rejected")}>
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
