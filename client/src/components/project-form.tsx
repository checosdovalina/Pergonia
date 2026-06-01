import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProjectSchema } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon, Upload, X, FileText, Users } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StaffAssignment } from "@/components/staff-assignment";
import { ImageUpload } from "@/components/ui/image-upload";
import { ClientForm } from "@/components/client-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formSchema = insertProjectSchema
  .extend({
    startDate: z.date().optional(),
    dueDate: z.date().optional(),
  })
  .omit({
    assignedStaff: true,
    images: true,
    documents: true,
  });

type ProjectFormValues = z.infer<typeof formSchema>;

interface ProjectFormProps {
  initialData?: ProjectFormValues & { id?: number; assignedStaff?: number[] };
  onSuccess: () => void;
}

export function ProjectForm({ initialData, onSuccess }: ProjectFormProps) {
  const { toast } = useToast();
  const [assignedStaff, setAssignedStaff] = useState<number[]>(initialData?.assignedStaff || []);
  const [images, setImages] = useState<string[]>((initialData?.images as string[]) || []);
  const [documents, setDocuments] = useState<any[]>((initialData?.documents as any[]) || []);
  const [showClientForm, setShowClientForm] = useState(false);

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const res = await fetch("/api/clients");
      if (!res.ok) throw new Error("Error al cargar clientes");
      return res.json();
    },
  });

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      address: "",
      serviceType: "",
      status: "pending",
      priority: "medium",
      progress: 0,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const projectData = { ...data, assignedStaff, images, documents };
      if (initialData?.id) {
        return apiRequest("PUT", `/api/projects/${initialData.id}`, projectData);
      } else {
        return apiRequest("POST", "/api/projects", projectData);
      }
    },
    onSuccess: () => {
      toast({
        title: initialData?.id ? "Proyecto actualizado" : "Proyecto creado",
        description: initialData?.id
          ? "El proyecto ha sido actualizado exitosamente"
          : "El proyecto ha sido creado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `No se pudo ${initialData?.id ? "actualizar" : "crear"} el proyecto: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    const submissionData = {
      ...data,
      startDate: data.startDate instanceof Date ? data.startDate : undefined,
      dueDate: data.dueDate instanceof Date ? data.dueDate : undefined,
      assignedStaff,
      images,
      documents,
    };
    mutation.mutate(submissionData);
  };

  const handleClientCreated = () => {
    setShowClientForm(false);
    queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    toast({ title: "Cliente creado", description: "El cliente fue creado exitosamente" });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Nombre + Cliente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del Proyecto</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: Alberca Residencial Torres" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Cliente</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClientForm(true)}
                    className="h-8 px-2 text-[#4a5e30] border-[#4a5e30]/40 hover:bg-[#4a5e30]/10"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Nuevo Cliente
                  </Button>
                </div>
                <Select
                  onValueChange={(value) => {
                    const clientId = parseInt(value);
                    field.onChange(clientId);
                    const selectedClient = clients?.find((c: any) => c.id === clientId);
                    if (selectedClient?.address) form.setValue("address", selectedClient.address);
                  }}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients?.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Descripción */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe el proyecto y sus detalles" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Dirección */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección</FormLabel>
              <FormControl>
                <Input placeholder="Dirección completa del proyecto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tipo de Servicio + Tipo de Proyecto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Servicio</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de servicio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Alberca Residencial">Alberca Residencial</SelectItem>
                    <SelectItem value="Alberca Comercial">Alberca Comercial</SelectItem>
                    <SelectItem value="Deck / Terraza">Deck / Terraza</SelectItem>
                    <SelectItem value="Pérgola">Pérgola</SelectItem>
                    <SelectItem value="Área Social">Área Social</SelectItem>
                    <SelectItem value="Jardín / Paisajismo">Jardín / Paisajismo</SelectItem>
                    <SelectItem value="Remodelación">Remodelación</SelectItem>
                    <SelectItem value="Proyecto Integral">Proyecto Integral</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Proyecto</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="residential">Residencial</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Prioridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estado + Progreso */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avance (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value || "0"))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Inicio</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Entrega</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Imágenes */}
        <div className="space-y-4">
          <FormLabel className="text-base font-semibold text-[#4a5e30]">Imágenes del Proyecto</FormLabel>
          <ImageUpload value={images} onChange={setImages} label="Subir imágenes" />
        </div>

        {/* Documentos */}
        <div className="space-y-4">
          <FormLabel className="text-base font-semibold text-[#4a5e30]">Documentos del Proyecto</FormLabel>
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
            <div className="text-center">
              <FileText className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.multiple = true;
                  input.accept = ".pdf,.doc,.docx,.txt,.xls,.xlsx";
                  input.onchange = (e) => {
                    const files = Array.from((e.target as HTMLInputElement).files || []);
                    const newDocs = files.map((file) => ({
                      name: file.name,
                      size: file.size,
                      type: file.type,
                      url: URL.createObjectURL(file),
                    }));
                    setDocuments([...documents, ...newDocs]);
                  };
                  input.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Documentos
              </Button>
              <p className="text-xs text-gray-400 mt-2">PDF, DOC, DOCX, TXT, XLS, XLSX (máx. 10 MB por archivo)</p>
            </div>

            {documents.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm text-gray-600">Documentos cargados:</h4>
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{doc.name}</span>
                      <span className="text-xs text-gray-400">({Math.round(doc.size / 1024)} KB)</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDocuments(documents.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Personal */}
        <div>
          <FormLabel className="text-base font-semibold text-[#4a5e30]">Personal Asignado</FormLabel>
          <StaffAssignment selectedStaff={assignedStaff} onChange={setAssignedStaff} />
        </div>

        {/* Acciones */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#4a5e30] hover:bg-[#3a4e22] text-white"
          >
            {mutation.isPending
              ? "Guardando..."
              : initialData?.id
              ? "Actualizar Proyecto"
              : "Crear Proyecto"}
          </Button>
        </div>
      </form>

      {/* Modal crear cliente */}
      <Dialog open={showClientForm} onOpenChange={setShowClientForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#4a5e30]">Crear Nuevo Cliente</DialogTitle>
            <DialogDescription>Agrega un nuevo cliente al sistema</DialogDescription>
          </DialogHeader>
          <ClientForm onSuccess={handleClientCreated} />
        </DialogContent>
      </Dialog>
    </Form>
  );
}
