import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "@shared/schema";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  className?: string;
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const getPriorityBadgeClasses = (priority: string) => {
    switch (priority) {
      case "high":   return "bg-red-100 text-red-800";
      case "medium": return "bg-amber-100 text-amber-800";
      case "low":    return "bg-green-100 text-green-800";
      default:       return "bg-gray-100 text-gray-600";
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":   return "Alta";
      case "medium": return "Media";
      case "low":    return "Baja";
      default:       return "Normal";
    }
  };

  const getStatusAccent = (status: string) => {
    switch (status) {
      case "in_progress": return "border-l-4 border-[#4a5e30]";
      case "completed":   return "border-l-4 border-emerald-500";
      case "reviewing":   return "border-l-4 border-amber-400";
      case "pending":     return "border-l-4 border-gray-300";
      default:            return "";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending:    "Visita Pendiente",
      quoted:     "Cotización Enviada",
      approved:   "Cotización Aprobada",
      preparing:  "En Preparación",
      in_progress:"En Progreso",
      reviewing:  "Revisión Final",
      completed:  "Completado",
      archived:   "Archivado",
    };
    return labels[status] ?? status;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending:    "bg-gray-100 text-gray-600",
      quoted:     "bg-blue-100 text-blue-700",
      approved:   "bg-emerald-100 text-emerald-700",
      preparing:  "bg-purple-100 text-purple-700",
      in_progress:"bg-[#4a5e30]/10 text-[#4a5e30]",
      reviewing:  "bg-amber-100 text-amber-700",
      completed:  "bg-green-100 text-green-700",
      archived:   "bg-gray-100 text-gray-500",
    };
    return colors[status] ?? "bg-gray-100 text-gray-600";
  };

  const formatDate = (date: Date | undefined | null) => {
    if (!date) return "No definida";
    return format(new Date(date), "d MMM", { locale: es });
  };

  const getDateDisplay = () => {
    switch (project.status) {
      case "pending":    return `Agenda: ${formatDate(project.startDate)}`;
      case "quoted":     return `Enviado: ${formatDate(project.createdAt)}`;
      case "approved":   return `Aprobado: ${formatDate(project.startDate)}`;
      case "preparing":  return `Inicio: ${formatDate(project.startDate)}`;
      case "in_progress":return `Inicio: ${formatDate(project.startDate)}`;
      case "reviewing":  return `Revisión: ${formatDate(new Date())}`;
      case "completed":  return `Terminado: ${formatDate(project.completedDate)}`;
      default:           return `Creado: ${formatDate(project.createdAt)}`;
    }
  };

  const isDelayed =
    project.status === "in_progress" &&
    (project.progress ?? 0) < 50 &&
    new Date() > new Date(project.startDate as Date);

  return (
    <Card
      className={cn(
        "bg-white cursor-pointer transition-all hover:shadow-md mb-2",
        getStatusAccent(project.status),
        className
      )}
      onClick={() => onClick(project)}
    >
      <CardContent className="p-4">
        {/* Title + Priority */}
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4 className="font-semibold text-sm text-gray-900 leading-snug">{project.title}</h4>
          <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium shrink-0", getPriorityBadgeClasses(project.priority))}>
            {getPriorityLabel(project.priority)}
          </span>
        </div>

        {/* Status badge */}
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getStatusBadgeColor(project.status))}>
          {getStatusLabel(project.status)}
        </span>

        {/* Address */}
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{project.address}</span>
        </p>

        {/* Progress bar for in-progress */}
        {project.status === "in_progress" && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className={cn("h-2 rounded-full", isDelayed ? "bg-red-400" : "bg-[#4a5e30]")}
                style={{ width: `${project.progress || 0}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0">{project.progress || 0}%</span>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-2 mt-3 flex justify-between items-center text-xs">
          <span className={cn(
            "flex items-center gap-1",
            project.status === "completed"
              ? "text-emerald-600 font-medium"
              : isDelayed
              ? "text-red-500 font-medium"
              : "text-gray-400"
          )}>
            <Calendar className="h-3 w-3" />
            {getDateDisplay()}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#4a5e30] hover:text-[#3a4e22] hover:bg-[#4a5e30]/10 p-0 h-auto text-xs font-medium"
            onClick={(e) => { e.stopPropagation(); onClick(project); }}
          >
            Ver detalles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
