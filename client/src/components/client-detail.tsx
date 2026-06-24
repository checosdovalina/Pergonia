import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Client, Project, Quote } from "@shared/schema";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";

interface ClientDetailProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClientDetail({ client, isOpen, onClose }: ClientDetailProps) {
  if (!client) return null;

  // Fetch related projects and quotes for this client
  const { data: projects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    enabled: isOpen && !!client.id,
  });

  const { data: quotes } = useQuery<Quote[]>({
    queryKey: ["/api/quotes"],
    enabled: isOpen && !!client.id,
  });

  // Filter projects and quotes for this specific client
  const clientProjects = projects?.filter(p => p.clientId === client.id) || [];
  const clientQuotes = (quotes as any[])?.filter((q: any) => {
    if (q.clientId === client.id) return true;           // cotización directa
    const project = projects?.find(p => p.id === q.projectId);
    return project?.clientId === client.id;              // vía proyecto
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "in_progress":
      case "sent":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const totalProjects = clientProjects.length;
  const completedProjects = clientProjects.filter(p => p.status === "completed").length;
  const totalQuoteValue = clientQuotes.reduce((sum, quote) => sum + (quote.totalEstimate || 0), 0);
  const approvedQuotes = clientQuotes.filter(q => q.status === "approved").length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="projects">Proyectos ({totalProjects})</TabsTrigger>
            <TabsTrigger value="quotes">Cotizaciones ({clientQuotes.length})</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{client.address}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{totalProjects}</div>
                      <div className="text-sm text-gray-600">Proyectos</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
                      <div className="text-sm text-gray-600">Completados</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{clientQuotes.length}</div>
                      <div className="text-sm text-gray-600">Cotizaciones</div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{approvedQuotes}</div>
                      <div className="text-sm text-gray-600">Aprobadas</div>
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-3xl font-bold text-gray-700">${totalQuoteValue.toLocaleString("es-MX")}</div>
                    <div className="text-sm text-gray-600">Valor total cotizado</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle>Notas</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {clientProjects.length > 0 ? (
              <div className="grid gap-4">
                {clientProjects.map((project) => (
                  <Card key={project.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{project.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span>${project.totalCost?.toLocaleString() || 'TBD'}</span>
                        </div>
                        {project.startDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Inicio: {format(new Date(project.startDate), 'dd MMM yyyy', { locale: es })}</span>
                          </div>
                        )}
                        {project.dueDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>Entrega: {format(new Date(project.dueDate), 'dd MMM yyyy', { locale: es })}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin proyectos</h3>
                <p className="text-gray-500">Este cliente aún no tiene proyectos asignados.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-4">
            {clientQuotes.length > 0 ? (
              <div className="grid gap-4">
                {clientQuotes.map((quote) => {
                  const project = projects?.find(p => p.id === quote.projectId);
                  return (
                    <Card key={quote.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              #{quote.id} — {quote.workAddress || project?.title || client.name}
                            </CardTitle>
                            <CardDescription>
                              Creada: {format(new Date(quote.createdAt), 'dd MMM yyyy', { locale: es })}
                            </CardDescription>
                          </div>
                          <Badge className={getStatusColor(quote.status)}>
                            {getStatusIcon(quote.status)}
                            <span className="ml-1 capitalize">{quote.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold">${Number(quote.totalEstimate || 0).toLocaleString("es-MX")}</span>
                          </div>
                          {quote.sentDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span>Enviada: {format(new Date(quote.sentDate), 'dd MMM yyyy', { locale: es })}</span>
                            </div>
                          )}
                          {quote.validUntil && (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>Válida hasta: {format(new Date(quote.validUntil), 'dd MMM yyyy', { locale: es })}</span>
                            </div>
                          )}
                        </div>
                        {quote.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">{quote.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin cotizaciones</h3>
                <p className="text-gray-500">Este cliente aún no tiene cotizaciones registradas.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Línea de tiempo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Creación del cliente */}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium">Cliente registrado</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(client.createdAt), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  
                  {/* Proyectos */}
                  {clientProjects.map((project) => (
                    <div key={project.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium">Proyecto "{project.title}" creado</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(project.createdAt), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Cotizaciones */}
                  {clientQuotes.map((quote: any) => {
                    const project = projects?.find(p => p.id === quote.projectId);
                    return (
                      <div key={quote.id} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <p className="font-medium">
                            Cotización #{quote.id} — {quote.workAddress || project?.title || client.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(quote.createdAt), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {clientProjects.length === 0 && clientQuotes.length === 0 && (
                    <div className="text-center py-8">
                      <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Sin actividad</h3>
                      <p className="text-gray-500">El historial del cliente aparecerá aquí conforme se creen proyectos y cotizaciones.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}