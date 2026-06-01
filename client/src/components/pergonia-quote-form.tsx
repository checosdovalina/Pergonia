import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Calculator, Users, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ClientForm } from "@/components/client-form";
import { ProjectForm } from "@/components/project-form";

// ── Tipos de servicio de Pergonia ───────────────────────────────────────────
const SERVICIOS = [
  { id: "alberca",      label: "Alberca",         desc: "Construcción o remodelación de alberca" },
  { id: "deck",         label: "Deck / Terraza",   desc: "Deck de madera, WPC o concreto" },
  { id: "pergola",      label: "Pérgola / Palapa", desc: "Estructura de sombra o cubierta" },
  { id: "area_social",  label: "Área Social",      desc: "Asador, bar, comedor exterior" },
  { id: "jardin",       label: "Jardín",           desc: "Paisajismo y áreas verdes" },
  { id: "remodelacion", label: "Remodelación",     desc: "Renovación de espacios exteriores" },
  { id: "otro",         label: "Otro",             desc: "Servicio personalizado" },
];

const UNIDADES = ["m²", "ml", "m³", "pieza", "juego", "global", "hora", "kg"];

// ── Schema ──────────────────────────────────────────────────────────────────
const partidaSchema = z.object({
  descripcion:   z.string().min(1, "Requerido"),
  unidad:        z.string().default("global"),
  cantidad:      z.number().min(0).default(1),
  precioUnitario: z.number().min(0).default(0),
  subtotal:      z.number().default(0),
});

const formSchema = z.object({
  projectId:    z.number().min(1, "Selecciona un proyecto"),
  servicios:    z.array(z.string()).min(1, "Selecciona al menos un tipo de servicio"),
  partidas:     z.array(partidaSchema).default([]),
  scopeOfWork:  z.string().optional(),
  totalEstimate: z.number().min(0).default(0),
  notes:        z.string().optional(),
  validUntil:   z.date().optional(),
  sentDate:     z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  initialData?: any;
  onSuccess: () => void;
}

export function PergoniaQuoteForm({ initialData, onSuccess }: Props) {
  const { toast } = useToast();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [showClientForm,   setShowClientForm]   = useState(false);
  const [showProjectForm,  setShowProjectForm]  = useState(false);
  const [validUntilOpen,   setValidUntilOpen]   = useState(false);
  const [sentDateOpen,     setSentDateOpen]     = useState(false);

  const { data: clients  = [] } = useQuery({ queryKey: ["/api/clients"]  });
  const { data: projects = [] } = useQuery({ queryKey: ["/api/projects"] });

  const filteredProjects = selectedClientId
    ? (projects as any[]).filter((p: any) => p.clientId === selectedClientId)
    : (projects as any[]);

  // Reconstruct initialData servicios from isInterior / isExterior / isSpecialRequirements
  // and partidas from exteriorBreakdown (jsonb)
  const getInitialServicios = (): string[] => {
    if (!initialData) return [];
    try {
      const eb = initialData.exteriorBreakdown;
      if (eb && eb._pergoniaServicios) return eb._pergoniaServicios;
    } catch {}
    return [];
  };
  const getInitialPartidas = (): FormValues["partidas"] => {
    if (!initialData) return [];
    try {
      const eb = initialData.exteriorBreakdown;
      if (eb && eb._pergoniaPartidas) return eb._pergoniaPartidas;
    } catch {}
    return [];
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectId:    initialData?.projectId || 0,
      servicios:    getInitialServicios(),
      partidas:     getInitialPartidas(),
      scopeOfWork:  initialData?.scopeOfWork || "",
      totalEstimate: Number(initialData?.totalEstimate || 0),
      notes:        initialData?.notes || "",
      validUntil:   initialData?.validUntil ? new Date(initialData.validUntil) : undefined,
      sentDate:     initialData?.sentDate   ? new Date(initialData.sentDate)   : undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "partidas" });

  // Auto-select client when editing
  useEffect(() => {
    if (initialData?.projectId) {
      const proj = (projects as any[]).find((p: any) => p.id === initialData.projectId);
      if (proj) setSelectedClientId(proj.clientId);
    }
  }, [initialData, projects]);

  // Calculate total from partidas
  const calcularTotal = () => {
    const partidas = form.getValues("partidas");
    const total = partidas.reduce((acc, p) => acc + (p.cantidad * p.precioUnitario), 0);
    form.setValue("totalEstimate", total);
  };

  const actualizarSubtotal = (index: number) => {
    const p = form.getValues(`partidas.${index}`);
    const sub = (p.cantidad || 0) * (p.precioUnitario || 0);
    form.setValue(`partidas.${index}.subtotal`, sub);
    calcularTotal();
  };

  const agregarPartida = () => {
    append({ descripcion: "", unidad: "global", cantidad: 1, precioUnitario: 0, subtotal: 0 });
  };

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        projectId:    data.projectId,
        totalEstimate: data.totalEstimate,
        scopeOfWork:  data.scopeOfWork || "",
        notes:        data.notes || "",
        validUntil:   data.validUntil  ? data.validUntil.toISOString()  : null,
        sentDate:     data.sentDate    ? data.sentDate.toISOString()    : null,
        status:       "draft",
        isInterior:   false,
        isExterior:   false,
        isSpecialRequirements: false,
        interiorBreakdown: null,
        specialRequirements: null,
        optionalComments: null,
        // Store Pergonia-specific data in exteriorBreakdown jsonb
        exteriorBreakdown: {
          _pergoniaServicios: data.servicios,
          _pergoniaPartidas:  data.partidas,
        },
      };

      if (initialData?.id) {
        const res = await apiRequest("PUT", `/api/simple-quotes/${initialData.id}`, payload);
        if (!res.ok) throw new Error("Error al actualizar cotización");
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/simple-quotes", payload);
        if (!res.ok) throw new Error("Error al crear cotización");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quotes"] });
      toast({ title: initialData?.id ? "Cotización actualizada" : "Cotización creada" });
      onSuccess();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const handleClientCreated = (newClient?: any) => {
    setShowClientForm(false);
    queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
    if (newClient?.id) setSelectedClientId(newClient.id);
    toast({ title: "Cliente creado" });
  };

  const handleProjectCreated = (newProject?: any) => {
    setShowProjectForm(false);
    queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    if (newProject?.id) form.setValue("projectId", newProject.id);
    toast({ title: "Proyecto creado" });
  };

  const totalEstimate = form.watch("totalEstimate");
  const partidas = form.watch("partidas");
  const totalCalculado = partidas.reduce((acc, p) => acc + ((p.cantidad || 0) * (p.precioUnitario || 0)), 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => mutation.mutate(d))} className="space-y-6">

        {/* ── Cliente / Proyecto ─────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Cliente */}
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>Cliente</FormLabel>
              <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs"
                onClick={() => setShowClientForm(true)}>
                <Users className="h-3 w-3 mr-1" /> Nuevo Cliente
              </Button>
            </div>
            <Select
              onValueChange={v => { setSelectedClientId(parseInt(v)); form.setValue("projectId", 0); }}
              value={selectedClientId?.toString() || ""}
            >
              <SelectTrigger><SelectValue placeholder="Selecciona un cliente primero" /></SelectTrigger>
              <SelectContent>
                {(clients as any[]).map((c: any) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          {/* Proyecto */}
          <FormField control={form.control} name="projectId" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Proyecto</FormLabel>
                <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs"
                  onClick={() => setShowProjectForm(true)} disabled={!selectedClientId}>
                  <FolderPlus className="h-3 w-3 mr-1" /> Nuevo Proyecto
                </Button>
              </div>
              <Select
                onValueChange={v => field.onChange(parseInt(v))}
                value={field.value?.toString() || ""}
                disabled={!selectedClientId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !selectedClientId ? "Selecciona un cliente primero"
                      : filteredProjects.length === 0 ? "Sin proyectos para este cliente"
                      : "Selecciona un proyecto"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredProjects.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* ── Tipos de servicio ──────────────────────────────────────────── */}
        <FormField control={form.control} name="servicios" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base font-semibold">Tipo de Servicio</FormLabel>
            <p className="text-xs text-muted-foreground mb-3">Selecciona los servicios que incluye esta cotización</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SERVICIOS.map(s => {
                const checked = field.value?.includes(s.id);
                return (
                  <label key={s.id}
                    className={cn(
                      "flex items-start gap-2 rounded-lg border p-3 cursor-pointer transition-colors",
                      checked ? "border-[#4a5e30] bg-[#4a5e30]/5" : "hover:bg-gray-50"
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={c => {
                        const cur = field.value || [];
                        field.onChange(c ? [...cur, s.id] : cur.filter(x => x !== s.id));
                      }}
                      className="mt-0.5"
                    />
                    <div>
                      <p className="text-sm font-medium leading-none">{s.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        )} />

        {/* ── Partidas de obra ───────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Partidas de Obra</h3>
              <p className="text-xs text-muted-foreground">Desglose detallado del trabajo a realizar</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={agregarPartida}
              className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" /> Agregar partida
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground">Sin partidas. Agrega conceptos de trabajo.</p>
              <Button type="button" variant="outline" size="sm" className="mt-2 gap-1"
                onClick={agregarPartida}>
                <Plus className="w-3.5 h-3.5" /> Agregar primera partida
              </Button>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="bg-gray-50 grid grid-cols-12 gap-1 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-4">Descripción</div>
                <div className="col-span-2">Unidad</div>
                <div className="col-span-2 text-right">Cantidad</div>
                <div className="col-span-2 text-right">P. Unit.</div>
                <div className="col-span-1 text-right">Subtotal</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              <div className="divide-y">
                {fields.map((field, i) => (
                  <div key={field.id} className="grid grid-cols-12 gap-1 px-3 py-2 items-center">
                    {/* Descripción */}
                    <div className="col-span-4">
                      <FormField control={form.control} name={`partidas.${i}.descripcion`}
                        render={({ field: f }) => (
                          <Input {...f} placeholder="Ej. Construcción de alberca…" className="h-8 text-xs" />
                        )} />
                    </div>

                    {/* Unidad */}
                    <div className="col-span-2">
                      <FormField control={form.control} name={`partidas.${i}.unidad`}
                        render={({ field: f }) => (
                          <Select onValueChange={f.onChange} value={f.value}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {UNIDADES.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        )} />
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-2">
                      <FormField control={form.control} name={`partidas.${i}.cantidad`}
                        render={({ field: f }) => (
                          <Input type="number" step="0.01" min="0" className="h-8 text-xs text-right"
                            value={f.value}
                            onChange={e => { f.onChange(parseFloat(e.target.value) || 0); actualizarSubtotal(i); }}
                          />
                        )} />
                    </div>

                    {/* Precio unitario */}
                    <div className="col-span-2">
                      <FormField control={form.control} name={`partidas.${i}.precioUnitario`}
                        render={({ field: f }) => (
                          <Input type="number" step="0.01" min="0" className="h-8 text-xs text-right"
                            value={f.value}
                            onChange={e => { f.onChange(parseFloat(e.target.value) || 0); actualizarSubtotal(i); }}
                          />
                        )} />
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-1 text-right">
                      <span className="text-xs font-semibold text-[#4a5e30]">
                        ${((form.watch(`partidas.${i}.cantidad`) || 0) * (form.watch(`partidas.${i}.precioUnitario`) || 0)).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Eliminar */}
                    <div className="col-span-1 flex justify-end">
                      <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                        onClick={() => { remove(i); calcularTotal(); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total row */}
              <div className="bg-[#4a5e30]/5 border-t px-3 py-3 flex items-center justify-between gap-3">
                <Button type="button" variant="outline" size="sm" className="gap-1 text-xs"
                  onClick={() => { calcularTotal(); }}>
                  <Calculator className="w-3.5 h-3.5" /> Calcular total
                </Button>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Total calculado:</span>
                  <span className="text-lg font-bold text-[#4a5e30]">
                    ${totalCalculado.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Total manual (override) ────────────────────────────────────── */}
        <FormField control={form.control} name="totalEstimate" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold">Total Estimado (MXN)</FormLabel>
            <p className="text-xs text-muted-foreground">Se calcula automáticamente de las partidas, o puedes ajustarlo manualmente</p>
            <FormControl>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <Input type="number" step="0.01" min="0" className="pl-7 font-semibold text-base"
                  value={field.value}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* ── Alcance del trabajo ────────────────────────────────────────── */}
        <FormField control={form.control} name="scopeOfWork" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold">Alcance del Trabajo</FormLabel>
            <p className="text-xs text-muted-foreground">Descripción general del proyecto (aparece en el PDF)</p>
            <FormControl>
              <Textarea {...field} placeholder="Describe el alcance general del proyecto: materiales, acabados, garantías, condiciones…"
                className="min-h-[100px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* ── Fechas ─────────────────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="validUntil" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Válida Hasta</FormLabel>
              <Popover open={validUntilOpen} onOpenChange={setValidUntilOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value}
                    onSelect={d => { field.onChange(d); setValidUntilOpen(false); }}
                    disabled={d => d < new Date()} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="sentDate" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Fecha de Envío</FormLabel>
              <Popover open={sentDateOpen} onOpenChange={setSentDateOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline" className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                      {field.value ? format(field.value, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value}
                    onSelect={d => { field.onChange(d); setSentDateOpen(false); }}
                    initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* ── Notas internas ─────────────────────────────────────────────── */}
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notas Internas</FormLabel>
            <p className="text-xs text-muted-foreground">Solo visibles para el equipo, no aparecen en el PDF del cliente</p>
            <FormControl>
              <Textarea {...field} placeholder="Notas sobre materiales especiales, condiciones del cliente, seguimiento…"
                className="min-h-[80px]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* ── Botones ─────────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onSuccess}>Cancelar</Button>
          <Button type="submit" disabled={mutation.isPending}
            className="bg-[#4a5e30] hover:bg-[#3a4a24] min-w-[140px]">
            {mutation.isPending
              ? "Guardando…"
              : initialData?.id ? "Actualizar Cotización" : "Crear Cotización"}
          </Button>
        </div>
      </form>

      {/* ClientForm — tiene su propio Dialog interno */}
      <ClientForm
        open={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
        }}
      />

      {/* Dialog — Nuevo Proyecto */}
      <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            <DialogDescription>Agrega un proyecto para el cliente seleccionado</DialogDescription>
          </DialogHeader>
          <ProjectForm
            onSuccess={handleProjectCreated}
            initialData={selectedClientId ? ({ clientId: selectedClientId } as any) : undefined}
          />
        </DialogContent>
      </Dialog>
    </Form>
  );
}
