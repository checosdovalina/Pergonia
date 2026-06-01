import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Eye, Edit, Trash2, FileDown, List, Grid3X3, Search, X, FileText, CheckCircle, Clock, XCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PergoniaQuoteForm } from "@/components/pergonia-quote-form";
import { SimpleQuoteDetail } from "@/components/simple-quote-detail";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  draft:     { label: "Borrador",   color: "text-gray-600",  bg: "bg-gray-100",   icon: Clock },
  sent:      { label: "Enviada",    color: "text-blue-700",  bg: "bg-blue-100",   icon: Send },
  approved:  { label: "Aprobada",   color: "text-green-700", bg: "bg-green-100",  icon: CheckCircle },
  rejected:  { label: "Rechazada",  color: "text-red-700",   bg: "bg-red-100",    icon: XCircle },
  converted: { label: "Convertida", color: "text-purple-700",bg: "bg-purple-100", icon: FileText },
};

function StatusPill({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, color: "text-gray-600", bg: "bg-gray-100", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

export default function SimpleQuotes() {
  const [showQuoteForm, setShowQuoteForm]     = useState(false);
  const [quoteToEdit, setQuoteToEdit]         = useState<any>(null);
  const [quoteToDelete, setQuoteToDelete]     = useState<any>(null);
  const [viewingQuote, setViewingQuote]       = useState<any>(null);
  const [viewMode, setViewMode]               = useState<"list" | "cards">("list");
  const [statusFilter, setStatusFilter]       = useState("all");
  const [searchTerm, setSearchTerm]           = useState("");
  const { toast } = useToast();

  const { data: quotes = [], isLoading } = useQuery({ queryKey: ["/api/quotes"] });
  const { data: projects = [] }          = useQuery({ queryKey: ["/api/projects"] });
  const { data: clients = [] }           = useQuery({ queryKey: ["/api/clients"] });

  const simpleQuotes = [...quotes].filter((q: any) => q.scopeOfWork);

  const filtered = simpleQuotes.filter((q: any) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (searchTerm) {
      const proj = (projects as any[]).find((p: any) => p.id === q.projectId);
      const cl   = proj ? (clients as any[]).find((c: any) => c.id === proj.clientId) : null;
      const txt  = [proj?.title, cl?.name, q.scopeOfWork, q.notes].filter(Boolean).join(" ").toLowerCase();
      if (!txt.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  }).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  // Summary counts
  const counts = {
    all:       simpleQuotes.length,
    draft:     simpleQuotes.filter((q: any) => q.status === "draft").length,
    sent:      simpleQuotes.filter((q: any) => q.status === "sent").length,
    approved:  simpleQuotes.filter((q: any) => q.status === "approved").length,
    rejected:  simpleQuotes.filter((q: any) => q.status === "rejected").length,
    converted: simpleQuotes.filter((q: any) => q.status === "converted").length,
  };

  const totalApproved = simpleQuotes
    .filter((q: any) => q.status === "approved")
    .reduce((s: number, q: any) => s + Number(q.totalEstimate || 0), 0);

  const getProject = (id: number) => (projects as any[]).find((p: any) => p.id === id);
  const getClient  = (projectId: number) => {
    const proj = getProject(projectId);
    return proj ? (clients as any[]).find((c: any) => c.id === proj.clientId) : null;
  };

  const handleNewQuote = () => { setQuoteToEdit(null); setShowQuoteForm(true); };
  const handleEditQuote = (q: any) => { setQuoteToEdit(q); setShowQuoteForm(true); };
  const handleCloseForm = () => { setShowQuoteForm(false); setQuoteToEdit(null); };

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    try {
      await apiRequest("DELETE", `/api/simple-quotes/${quoteToDelete.id}`);
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({ title: "Cotización eliminada" });
    } catch {
      toast({ title: "Error al eliminar", variant: "destructive" });
    } finally {
      setQuoteToDelete(null);
    }
  };

  const handleExportTxt = (quote: any) => {
    const proj = getProject(quote.projectId);
    const cl   = getClient(quote.projectId);
    const txt = [
      `Cotización #${quote.id}`,
      `Proyecto: ${proj?.title || "—"}`,
      `Cliente: ${cl?.name || "—"}`,
      `Total: $${Number(quote.totalEstimate || 0).toLocaleString("es-MX")} MXN`,
      `Estatus: ${STATUS_CONFIG[quote.status]?.label || quote.status}`,
      "",
      "Alcance del trabajo:",
      quote.scopeOfWork || "—",
      quote.notes ? `\nNotas:\n${quote.notes}` : "",
    ].join("\n").trim();

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = `cotizacion-${quote.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Cotización exportada" });
  };

  if (isLoading) {
    return (
      <Layout title="Cotizaciones">
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4a5e30]" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Cotizaciones">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Cotizaciones</h1>
          <p className="text-muted-foreground mt-1">Gestión de propuestas y presupuestos</p>
        </div>
        <Button onClick={handleNewQuote} className="gap-2 bg-[#4a5e30] hover:bg-[#3a4a24] shadow-sm">
          <Plus className="w-4 h-4" /> Nueva Cotización
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total",      value: counts.all,      accent: "#4a5e30" },
          { label: "Enviadas",   value: counts.sent,     accent: "#2563eb" },
          { label: "Aprobadas",  value: counts.approved, accent: "#16a34a" },
          { label: "Aprobadas $",value: `$${totalApproved.toLocaleString("es-MX")}`, accent: "#c9a962" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border p-4 shadow-sm">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all",       label: "Todas" },
              { value: "draft",     label: "Borrador" },
              { value: "sent",      label: "Enviada" },
              { value: "approved",  label: "Aprobada" },
              { value: "rejected",  label: "Rechazada" },
              { value: "converted", label: "Convertida" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  statusFilter === opt.value
                    ? "bg-[#4a5e30] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label} {opt.value !== "all" && counts[opt.value as keyof typeof counts] !== undefined ? `(${counts[opt.value as keyof typeof counts]})` : ""}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 h-8 w-44 text-sm"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode("list")}
                className={`px-2.5 py-1.5 ${viewMode === "list" ? "bg-[#4a5e30] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("cards")}
                className={`px-2.5 py-1.5 ${viewMode === "cards" ? "bg-[#4a5e30] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <FileText className="w-14 h-14 mx-auto mb-4 opacity-25" />
          <p className="font-semibold text-base">No hay cotizaciones</p>
          <p className="text-sm mt-1">Crea la primera con el botón de arriba</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Proyecto</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estatus</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((q: any) => {
                  const proj = getProject(q.projectId);
                  const cl   = getClient(q.projectId);
                  const date = q.sentDate || q.createdAt;
                  return (
                    <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-400 font-mono text-xs">#{q.id}</td>
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900 truncate max-w-[180px]">{proj?.title || `Proyecto #${q.projectId}`}</p>
                        <p className="text-xs text-gray-400 truncate max-w-[180px] mt-0.5">{q.scopeOfWork?.substring(0, 60)}…</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{cl?.name || "—"}</td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        ${Number(q.totalEstimate || 0).toLocaleString("es-MX")}
                      </td>
                      <td className="px-5 py-3.5"><StatusPill status={q.status} /></td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                        {date ? format(new Date(date), "dd MMM yyyy", { locale: es }) : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setViewingQuote(q)} title="Ver detalle">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditQuote(q)} title="Editar">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleExportTxt(q)} title="Exportar">
                            <FileDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => setQuoteToDelete(q)} title="Eliminar">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((q: any) => {
            const proj = getProject(q.projectId);
            const cl   = getClient(q.projectId);
            const date = q.sentDate || q.createdAt;
            return (
              <Card key={q.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-mono mb-1">#{q.id}</p>
                      <h3 className="font-semibold text-gray-900 truncate">{proj?.title || `Proyecto #${q.projectId}`}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{cl?.name || "—"}</p>
                    </div>
                    <StatusPill status={q.status} />
                  </div>

                  {q.scopeOfWork && (
                    <p className="text-xs text-gray-500 line-clamp-2 border-t pt-2">{q.scopeOfWork}</p>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-bold text-[#4a5e30]">
                      ${Number(q.totalEstimate || 0).toLocaleString("es-MX")}
                    </span>
                    {date && (
                      <span className="text-xs text-gray-400">
                        {format(new Date(date), "dd MMM yyyy", { locale: es })}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1.5 pt-1 border-t">
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => setViewingQuote(q)}>
                      <Eye className="w-3 h-3" /> Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={() => handleEditQuote(q)}>
                      <Edit className="w-3 h-3" /> Editar
                    </Button>
                    <Button variant="outline" size="sm" className="px-2" onClick={() => handleExportTxt(q)}>
                      <FileDown className="w-3 h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="px-2 text-red-500 hover:text-red-700" onClick={() => setQuoteToDelete(q)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={showQuoteForm} onOpenChange={setShowQuoteForm}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{quoteToEdit ? "Editar Cotización" : "Nueva Cotización"}</DialogTitle>
            <DialogDescription>
              {quoteToEdit ? "Modifica los datos de la cotización" : "Crea una nueva propuesta para el cliente"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <PergoniaQuoteForm initialData={quoteToEdit || undefined} onSuccess={handleCloseForm} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <SimpleQuoteDetail
        open={!!viewingQuote}
        onOpenChange={open => !open && setViewingQuote(null)}
        quote={viewingQuote}
        onEdit={q => { setViewingQuote(null); handleEditQuote(q); }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!quoteToDelete} onOpenChange={() => setQuoteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la cotización <strong>#{quoteToDelete?.id}</strong> permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDeleteQuote}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
