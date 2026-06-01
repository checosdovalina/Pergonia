import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Project, Client } from "@shared/schema";
import { Layout } from "@/components/layout";
import { ProjectForm } from "@/components/project-form";
import { ProjectCard } from "@/components/project-card";
import { ProjectModal } from "@/components/project-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, List, GridIcon, Filter, Trash } from "lucide-react";

export default function Projects() {
  const [match, params] = useRoute("/projects/:id");
  const [location, setLocation] = useLocation();
  const isViewingSpecificProject = match && params?.id;

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects");
      if (!res.ok) throw new Error("Error al cargar proyectos");
      return res.json();
    },
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Error al cargar clientes");
      return res.json();
    },
  });

  const { data: specificProject, isLoading: isLoadingSpecificProject } = useQuery<Project>({
    queryKey: ["/api/projects", params?.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params?.id}`);
      if (!res.ok) throw new Error("Error al cargar proyecto");
      return res.json();
    },
    enabled: Boolean(isViewingSpecificProject),
  });

  useEffect(() => {
    if (isViewingSpecificProject && specificProject) {
      setSelectedProject(specificProject);
      setShowProjectDetails(true);
    }
  }, [isViewingSpecificProject, specificProject]);

  const handleEditProject = (project: Project) => {
    setProjectToEdit(project);
    setShowProjectDetails(false);
    setShowProjectForm(true);
  };

  const handleNewProject = () => {
    setProjectToEdit(null);
    setShowProjectForm(true);
  };

  const handleCloseForm = () => {
    setShowProjectForm(false);
    setProjectToEdit(null);
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetails(true);
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await apiRequest("DELETE", `/api/projects/${projectToDelete.id}`, undefined);
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto ha sido eliminado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el proyecto: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProjectToDelete(null);
    }
  };

  const filteredProjects = projects?.filter((project) => {
    if (statusFilter !== "all" && project.status !== statusFilter) return false;
    if (clientFilter !== "all" && project.clientId !== parseInt(clientFilter)) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        project.title.toLowerCase().includes(q) ||
        project.description.toLowerCase().includes(q) ||
        project.address.toLowerCase().includes(q) ||
        project.serviceType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Visita Pendiente",
      quoted: "Cotización Enviada",
      approved: "Cotización Aprobada",
      preparing: "En Preparación",
      in_progress: "En Progreso",
      reviewing: "Revisión Final",
      completed: "Completado",
      archived: "Archivado",
    };
    return labels[status] ?? status;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800",
      quoted: "bg-blue-100 text-blue-800",
      approved: "bg-emerald-100 text-emerald-800",
      preparing: "bg-purple-100 text-purple-800",
      in_progress: "bg-[#4a5e30]/10 text-[#4a5e30]",
      reviewing: "bg-orange-100 text-orange-800",
      completed: "bg-green-100 text-green-800",
      archived: "bg-gray-100 text-gray-600",
    };
    return colors[status] ?? "bg-gray-100 text-gray-600";
  };

  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client ? client.name : `Cliente #${clientId}`;
  };

  if (isViewingSpecificProject && isLoadingSpecificProject) {
    return (
      <Layout title="Cargando Proyecto...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#4a5e30] border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-[#4a5e30]">Cargando detalles del proyecto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (isViewingSpecificProject && specificProject) {
    return (
      <Layout title={`Proyecto: ${specificProject.title}`}>
        <ProjectModal
          open={true}
          onOpenChange={() => setLocation("/projects")}
          project={specificProject}
          onEdit={handleEditProject}
        />
        <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{projectToEdit ? "Editar Proyecto" : "Nuevo Proyecto"}</DialogTitle>
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

  return (
    <Layout title="Proyectos">
      {/* Header */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-gray-200 focus-visible:ring-[#4a5e30]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-[#4a5e30]/10 border-[#4a5e30] text-[#4a5e30]" : ""}
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-[#4a5e30]/10 border-[#4a5e30] text-[#4a5e30]" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleNewProject}
              className="bg-[#4a5e30] hover:bg-[#3a4e22] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Estado del Proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="pending">Visita Pendiente</SelectItem>
              <SelectItem value="quoted">Cotización Enviada</SelectItem>
              <SelectItem value="approved">Cotización Aprobada</SelectItem>
              <SelectItem value="preparing">En Preparación</SelectItem>
              <SelectItem value="in_progress">En Progreso</SelectItem>
              <SelectItem value="reviewing">Revisión Final</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los clientes</SelectItem>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id.toString()}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoadingProjects ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-[#4a5e30] border-t-transparent rounded-full" />
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <>
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="relative group">
                  <ProjectCard project={project} onClick={handleProjectClick} />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(project);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === "list" && (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100">
                <thead>
                  <tr className="bg-[#4a5e30]/5">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4a5e30] uppercase tracking-wider">Proyecto</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4a5e30] uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4a5e30] uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4a5e30] uppercase tracking-wider">Prioridad</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4a5e30] uppercase tracking-wider">Progreso</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#4a5e30] uppercase tracking-wider">Fechas</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#4a5e30] uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredProjects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => handleProjectClick(project)}
                      className="hover:bg-[#4a5e30]/5 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-gray-900">{project.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{project.address}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{getClientName(project.clientId)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${getStatusBadgeColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                          project.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : project.priority === "medium"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-green-100 text-green-800"
                        }`}>
                          {project.priority === "high" ? "Alta" : project.priority === "medium" ? "Media" : "Baja"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {project.progress !== undefined && project.progress !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-[#4a5e30]"
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{project.progress}%</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">
                        {project.startDate && <div>Inicio: {new Date(project.startDate).toLocaleDateString("es-MX")}</div>}
                        {project.dueDate && <div>Entrega: {new Date(project.dueDate).toLocaleDateString("es-MX")}</div>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#4a5e30] hover:text-[#3a4e22] hover:bg-[#4a5e30]/10"
                          onClick={(e) => { e.stopPropagation(); handleEditProject(project); }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(project); }}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-gray-400">
          {searchTerm || statusFilter !== "all" || clientFilter !== "all"
            ? "No se encontraron proyectos con los filtros aplicados."
            : "Sin proyectos registrados. Crea uno nuevo con el botón 'Nuevo Proyecto'."}
        </div>
      )}

      {/* Project Details Modal */}
      <ProjectModal
        open={showProjectDetails}
        onOpenChange={setShowProjectDetails}
        project={selectedProject}
        onEdit={handleEditProject}
      />

      {/* Project Form Dialog */}
      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#4a5e30]">
              {projectToEdit ? "Editar Proyecto" : "Nuevo Proyecto"}
            </DialogTitle>
            <DialogDescription>
              {projectToEdit
                ? "Modifica los detalles del proyecto según sea necesario"
                : "Completa el formulario para crear un nuevo proyecto"}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto pr-2">
            <ProjectForm initialData={projectToEdit || undefined} onSuccess={handleCloseForm} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Proyecto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proyecto será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
