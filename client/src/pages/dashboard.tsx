import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Project, Quote, Client } from "@shared/schema";
import { Layout } from "@/components/layout";
import { ProjectModal } from "@/components/project-modal";
import { ProjectForm } from "@/components/project-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Layers,
  FileText,
  Users,
  CheckCircle2,
  ArrowRight,
  Plus,
  MapPin,
  Clock,
  TrendingUp,
  Waves,
  TreePine,
  Building2,
  Hammer,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_LABEL: Record<string, string> = {
  pending:    "Visita Pendiente",
  quoted:     "Cotización Enviada",
  approved:   "Cotización Aprobada",
  preparing:  "En Preparación",
  in_progress:"En Progreso",
  reviewing:  "Revisión Final",
  completed:  "Completado",
  archived:   "Archivado",
};

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-gray-100 text-gray-600",
  quoted:     "bg-blue-100 text-blue-700",
  approved:   "bg-emerald-100 text-emerald-700",
  preparing:  "bg-purple-100 text-purple-700",
  in_progress:"bg-[#4a5e30]/10 text-[#4a5e30] font-semibold",
  reviewing:  "bg-amber-100 text-amber-700",
  completed:  "bg-green-100 text-green-700",
  archived:   "bg-gray-100 text-gray-400",
};

const QUOTE_STATUS_LABEL: Record<string, string> = {
  draft:    "Borrador",
  sent:     "Enviada",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const QUOTE_STATUS_COLOR: Record<string, string> = {
  draft:    "bg-gray-100 text-gray-500",
  sent:     "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const SERVICE_ICON: Record<string, JSX.Element> = {
  "Alberca Residencial": <Waves className="h-4 w-4" />,
  "Alberca Comercial":   <Waves className="h-4 w-4" />,
  "Jardín / Paisajismo": <TreePine className="h-4 w-4" />,
  "Área Social":         <Building2 className="h-4 w-4" />,
  "Remodelación":        <Hammer className="h-4 w-4" />,
};

const defaultIcon = <Layers className="h-4 w-4" />;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const { data: projects, isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const { data: quotes, isLoading: loadingQuotes } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
    queryFn: async () => {
      const res = await fetch("/api/quotes");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Error");
      return res.json();
    },
  });

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const activeProjects = projects?.filter((p) =>
    ["in_progress", "preparing", "reviewing"].includes(p.status)
  ).length ?? 0;

  const pendingQuotes = quotes?.filter((q) =>
    ["sent", "draft"].includes(q.status)
  ).length ?? 0;

  const completedThisMonth = projects?.filter((p) => {
    if (p.status !== "completed" || !p.completedDate) return false;
    const d = new Date(p.completedDate);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length ?? 0;

  const totalClients = clients?.length ?? 0;

  // ── Lists ─────────────────────────────────────────────────────────────────
  const activeProjectsList = projects
    ?.filter((p) => ["in_progress", "preparing", "reviewing", "approved"].includes(p.status))
    .slice(0, 6) ?? [];

  const recentQuotes = [...(quotes ?? [])]
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
    .slice(0, 5);

  const handleProjectClick = (p: Project) => { setSelectedProject(p); setShowProjectDetails(true); };
  const handleEditProject  = (p: Project) => { setProjectToEdit(p); setShowProjectDetails(false); setShowProjectForm(true); };
  const handleCloseForm    = () => { setShowProjectForm(false); setProjectToEdit(null); };

  const fmt = (d: any) => d ? format(new Date(d), "d MMM yyyy", { locale: es }) : "—";

  const getClientName = (id: number) => clients?.find((c) => c.id === id)?.name ?? `Cliente #${id}`;

  // ── KPI card helper ───────────────────────────────────────────────────────
  const KpiCard = ({
    label, value, sub, icon, accent,
  }: { label: string; value: string | number; sub?: string; icon: JSX.Element; accent: string }) => (
    <div className={`rounded-xl p-5 flex items-start gap-4 bg-white border border-gray-100 shadow-sm`}>
      <div className={`${accent} rounded-lg p-3 shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700 leading-tight">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <Layout title="Inicio">
      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Proyectos Activos"
          value={activeProjects}
          sub="En ejecución / preparación"
          icon={<Layers className="h-5 w-5 text-white" />}
          accent="bg-[#4a5e30]"
        />
        <KpiCard
          label="Cotizaciones Pendientes"
          value={pendingQuotes}
          sub="Enviadas o en borrador"
          icon={<FileText className="h-5 w-5 text-white" />}
          accent="bg-[#c9a962]"
        />
        <KpiCard
          label="Completados Este Mes"
          value={completedThisMonth}
          sub="Proyectos entregados"
          icon={<CheckCircle2 className="h-5 w-5 text-white" />}
          accent="bg-emerald-600"
        />
        <KpiCard
          label="Total de Clientes"
          value={totalClients}
          sub="Registrados en el sistema"
          icon={<Users className="h-5 w-5 text-white" />}
          accent="bg-slate-600"
        />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Proyectos activos — 2/3 */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#4a5e30]" />
              Proyectos en Curso
            </h2>
            <Button
              size="sm"
              variant="ghost"
              className="text-[#4a5e30] hover:bg-[#4a5e30]/10 text-xs"
              onClick={() => setLocation("/dashboard/projects")}
            >
              Ver todos <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {loadingProjects ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-6 w-6 border-4 border-[#4a5e30] border-t-transparent rounded-full" />
            </div>
          ) : activeProjectsList.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No hay proyectos activos.
              <Button
                size="sm"
                className="ml-2 bg-[#4a5e30] hover:bg-[#3a4e22] text-white"
                onClick={() => setShowProjectForm(true)}
              >
                <Plus className="h-3 w-3 mr-1" /> Crear proyecto
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {activeProjectsList.map((p) => (
                <li
                  key={p.id}
                  className="flex items-start gap-3 px-5 py-4 hover:bg-[#4a5e30]/5 cursor-pointer transition-colors"
                  onClick={() => handleProjectClick(p)}
                >
                  <div className="mt-0.5 p-2 rounded-lg bg-[#4a5e30]/10 text-[#4a5e30] shrink-0">
                    {SERVICE_ICON[p.serviceType] ?? defaultIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900 truncate">{p.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{p.address}</span>
                    </p>
                    {p.status === "in_progress" && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-[#4a5e30]"
                            style={{ width: `${p.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">{p.progress ?? 0}%</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 shrink-0 pt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {p.dueDate ? fmt(p.dueDate) : "Sin fecha"}
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
            <Button
              className="w-full bg-[#4a5e30] hover:bg-[#3a4e22] text-white"
              size="sm"
              onClick={() => { setProjectToEdit(null); setShowProjectForm(true); }}
            >
              <Plus className="h-4 w-4 mr-2" /> Nuevo Proyecto
            </Button>
          </div>
        </div>

        {/* Panel derecho — 1/3 */}
        <div className="flex flex-col gap-6">

          {/* Cotizaciones recientes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#c9a962]" />
                Cotizaciones
              </h2>
              <Button
                size="sm"
                variant="ghost"
                className="text-[#4a5e30] hover:bg-[#4a5e30]/10 text-xs"
                onClick={() => setLocation("/dashboard/simple-quotes")}
              >
                Ver todas <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {loadingQuotes ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-5 w-5 border-4 border-[#4a5e30] border-t-transparent rounded-full" />
              </div>
            ) : recentQuotes.length === 0 ? (
              <p className="text-center py-8 text-gray-400 text-sm">Sin cotizaciones.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {recentQuotes.map((q) => (
                  <li
                    key={q.id}
                    className="px-4 py-3 hover:bg-[#4a5e30]/5 cursor-pointer transition-colors"
                    onClick={() => setLocation("/dashboard/simple-quotes")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">{q.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${QUOTE_STATUS_COLOR[q.status]}`}>
                        {QUOTE_STATUS_LABEL[q.status] ?? q.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{fmt(q.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Accesos Rápidos</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                { label: "Clientes",    icon: <Users className="h-4 w-4" />,    path: "/dashboard/clients"       },
                { label: "Cotizaciones",icon: <FileText className="h-4 w-4" />, path: "/dashboard/simple-quotes" },
                { label: "Proyectos",   icon: <Layers className="h-4 w-4" />,   path: "/dashboard/projects"      },
                { label: "Facturas",    icon: <CheckCircle2 className="h-4 w-4"/>,path: "/dashboard/invoices"    },
              ].map(({ label, icon, path }) => (
                <button
                  key={label}
                  onClick={() => setLocation(path)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-gray-100 hover:border-[#4a5e30]/40 hover:bg-[#4a5e30]/5 transition-colors text-center"
                >
                  <span className="text-[#4a5e30]">{icon}</span>
                  <span className="text-xs font-medium text-gray-700">{label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modals ── */}
      <ProjectModal
        open={showProjectDetails}
        onOpenChange={setShowProjectDetails}
        project={selectedProject}
        onEdit={handleEditProject}
      />

      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#4a5e30]">
              {projectToEdit ? "Editar Proyecto" : "Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              {projectToEdit
                ? "Modifica los detalles del proyecto"
                : "Completa el formulario para crear un nuevo proyecto"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <ProjectForm initialData={projectToEdit || undefined} onSuccess={handleCloseForm} />
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
