import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Calculator, Users, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
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

const UNIDADES = ["global", "m²", "ml", "m³", "pieza", "juego", "hora", "kg"];

// ── Schema ──────────────────────────────────────────────────────────────────
const partidaSchema = z.object({
  descripcion:    z.string().min(1, "Requerido"),
  unidad:         z.string().default("global"),
  cantidad:       z.number().min(0).default(1),
  precioUnitario: z.number().min(0).default(0),
  subtotal:       z.number().default(0),
  subItems:       z.array(z.string()).default([]),   // sub-conceptos tipo bullet
  nota:           z.string().optional(),             // condición / nota por partida
});

const formSchema = z.object({
  clientId:      z.number().min(1, "Selecciona un cliente"),
  workAddress:   z.string().optional(),
  servicios:     z.array(z.string()).min(1, "Selecciona al menos un tipo de servicio"),
  partidas:      z.array(partidaSchema).default([]),
  scopeOfWork:   z.string().optional(),
  totalEstimate: z.number().min(0).default(0),
  notes:         z.string().optional(),
  validUntil:    z.date().optional(),
  sentDate:      z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  initialData?: any;
  onSuccess: () => void;
}

export function PergoniaQuoteForm({ initialData, onSuccess }: Props) {
  const { toast } = useToast();
  const [showClientForm, setShowClientForm] = useState(false);
  const [validUntilOpen, setValidUntilOpen] = useState(false);
  const [sentDateOpen,   setSentDateOpen]   = useState(false);
  const [expandedRows, setExpandedRows]     = useState<Set<number>>(new Set());

  const { data: clients = [] } = useQuery({ queryKey: ["/api/clients"] });

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
      clientId:      initialData?.clientId || 0,
      workAddress:   initialData?.workAddress || "",
      servicios:     getInitialServicios(),
      partidas:      getInitialPartidas(),
      scopeOfWork:   initialData?.scopeOfWork || "",
      totalEstimate: Number(initialData?.totalEstimate || 0),
      notes:         initialData?.notes || "",
      validUntil:    initialData?.validUntil ? new Date(initialData.validUntil) : undefined,
      sentDate:      initialData?.sentDate   ? new Date(initialData.sentDate)   : undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "partidas" });

  const calcularTotal = () => {
    const partidas = form.getValues("partidas");
    const total = partidas.reduce((acc, p) => acc + ((p.cantidad || 1) * (p.precioUnitario || 0)), 0);
    form.setValue("totalEstimate", total);
  };

  const actualizarSubtotal = (index: number) => {
    const p = form.getValues(`partidas.${index}`);
    const sub = (p.cantidad || 1) * (p.precioUnitario || 0);
    form.setValue(`partidas.${index}.subtotal`, sub);
    calcularTotal();
  };

  const agregarPartida = () => {
    append({ descripcion: "", unidad: "global", cantidad: 1, precioUnitario: 0, subtotal: 0, subItems: [], nota: "" });
  };

  const toggleExpand = (i: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  // Agregar / quitar sub-concepto
  const agregarSubItem = (i: number) => {
    const cur = form.getValues(`partidas.${i}.subItems`) || [];
    form.setValue(`partidas.${i}.subItems`, [...cur, ""]);
  };
  const quitarSubItem = (i: number, j: number) => {
    const cur = form.getValues(`partidas.${i}.subItems`) || [];
    form.setValue(`partidas.${i}.subItems`, cur.filter((_: string, idx: number) => idx !== j));
  };

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const payload = {
        clientId:      data.clientId,
        projectId:     null,
        workAddress:   data.workAddress || "",
        totalEstimate: data.totalEstimate,
        scopeOfWork:   data.scopeOfWork || "",
        notes:         data.notes || "",
        validUntil:    data.validUntil  ? data.validUntil.toISOString()  : null,
        sentDate:      data.sentDate    ? data.sentDate.toISOString()    : null,
        status:        "draft",
        isInterior:    false,
        isExterior:    false,
        isSpecialRequirements: false,
        interiorBreakdown: null,
        specialRequirements: null,
        optionalComments: null,
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
    if (newClient?.id) form.setValue("clientId", newClient.id);
    toast({ title: "Cliente creado" });
  };

  const partidas = form.watch("partidas");
  const totalCalculado = partidas.reduce((acc, p) => acc + ((p.cantidad || 1) * (p.precioUnitario || 0)), 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(d => mutation.mutate(d))} className="space-y-6">

        {/* ── Cliente + Dirección ─────────────────────────────────────────── */}
        <div className="grid gap-4 md:grid-cols-2">
          <FormField control={form.control} name="clientId" render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Cliente <span className="text-red-500">*</span></FormLabel>
                <Button type="button" variant="outline" size="sm" className="h-7 px-2 text-xs"
                  onClick={() => setShowClientForm(true)}>
                  <Users className="h-3 w-3 mr-1" /> Nuevo Cliente
                </Button>
              </div>
              <Select
                onValueChange={v => field.onChange(parseInt(v))}
                value={field.value > 0 ? field.value.toString() : ""}
              >
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Selecciona un cliente" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {(clients as any[]).map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="workAddress" render={({ field }) => (
            <FormItem>
              <FormLabel>Dirección del Trabajo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Ej. Fracc. Las Quintas, Torreón, Coah." />
              </FormControl>
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
              <p className="text-xs text-muted-foreground">Cada partida puede tener sub-conceptos y notas</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={agregarPartida}
              className="gap-1 text-xs">
              <Plus className="w-3.5 h-3.5" /> Agregar partida
            </Button>
          </div>

          {fields.length === 0 ? (
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Sin partidas. Agrega los conceptos de trabajo.</p>
              <Button type="button" variant="outline" size="sm" className="gap-1"
                onClick={agregarPartida}>
                <Plus className="w-3.5 h-3.5" /> Agregar primera partida
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {fields.map((field, i) => {
                const isExpanded = expandedRows.has(i);
                const subItems: string[] = form.watch(`partidas.${i}.subItems`) || [];
                const nota: string = form.watch(`partidas.${i}.nota`) || "";
                const monto = (form.watch(`partidas.${i}.cantidad`) || 1) * (form.watch(`partidas.${i}.precioUnitario`) || 0);

                return (
                  <div key={field.id} className="border rounded-lg overflow-hidden shadow-sm">
                    {/* ── Fila principal ── */}
                    <div className="grid grid-cols-12 gap-1 px-3 py-2.5 bg-white items-center">
                      {/* Descripción */}
                      <div className="col-span-5">
                        <FormField control={form.control} name={`partidas.${i}.descripcion`}
                          render={({ field: f }) => (
                            <Input {...f} placeholder="Ej. Obra negra, Tema eléctrico…" className="h-8 text-sm font-medium" />
                          )} />
                      </div>

                      {/* Cantidad */}
                      <div className="col-span-2">
                        <FormField control={form.control} name={`partidas.${i}.cantidad`}
                          render={({ field: f }) => (
                            <Input type="number" step="0.01" min="0" className="h-8 text-xs text-right"
                              placeholder="Cant."
                              value={f.value}
                              onChange={e => { f.onChange(parseFloat(e.target.value) || 0); actualizarSubtotal(i); }}
                            />
                          )} />
                      </div>

                      {/* Precio unitario */}
                      <div className="col-span-3">
                        <FormField control={form.control} name={`partidas.${i}.precioUnitario`}
                          render={({ field: f }) => (
                            <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
                              <Input type="number" step="0.01" min="0" className="h-8 text-xs text-right pl-5"
                                placeholder="0.00"
                                value={f.value}
                                onChange={e => { f.onChange(parseFloat(e.target.value) || 0); actualizarSubtotal(i); }}
                              />
                            </div>
                          )} />
                      </div>

                      {/* Subtotal */}
                      <div className="col-span-1 text-right">
                        <span className="text-xs font-bold text-[#4a5e30]">
                          ${monto.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="col-span-1 flex items-center justify-end gap-0.5">
                        <Button type="button" variant="ghost" size="sm"
                          className={cn("h-7 w-7 p-0 transition-colors", isExpanded ? "text-[#4a5e30]" : "text-gray-400 hover:text-[#4a5e30]")}
                          title={isExpanded ? "Ocultar detalle" : "Agregar sub-conceptos / nota"}
                          onClick={() => toggleExpand(i)}>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                          onClick={() => { remove(i); calcularTotal(); setExpandedRows(prev => { const n = new Set(prev); n.delete(i); return n; }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* ── Panel expandible: sub-conceptos + nota ── */}
                    {isExpanded && (
                      <div className="bg-gray-50 border-t px-4 py-3 space-y-3">
                        {/* Sub-conceptos */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sub-conceptos</p>
                            <Button type="button" variant="outline" size="sm" className="h-6 px-2 text-[10px] gap-1"
                              onClick={() => agregarSubItem(i)}>
                              <Plus className="w-3 h-3" /> Agregar
                            </Button>
                          </div>
                          {subItems.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Sin sub-conceptos. Agrega detalles como materiales, actividades incluidas…</p>
                          ) : (
                            <div className="space-y-1.5">
                              {subItems.map((sub: string, j: number) => (
                                <div key={j} className="flex items-center gap-2">
                                  <span className="text-[#4a5e30] text-sm leading-none">•</span>
                                  <Input
                                    className="h-7 text-xs flex-1"
                                    placeholder="Ej. Quitar arenilla, Yeso en paredes…"
                                    value={sub}
                                    onChange={e => {
                                      const cur = [...(form.getValues(`partidas.${i}.subItems`) || [])];
                                      cur[j] = e.target.value;
                                      form.setValue(`partidas.${i}.subItems`, cur);
                                    }}
                                  />
                                  <Button type="button" variant="ghost" size="sm"
                                    className="h-7 w-7 p-0 text-red-400 hover:text-red-600"
                                    onClick={() => quitarSubItem(i, j)}>
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Nota / condición */}
                        <div>
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">Nota / Condición</p>
                          <Input
                            className="h-7 text-xs italic"
                            placeholder="Ej. Materiales proporcionados por el cliente, incluye garantía de 1 año…"
                            value={nota}
                            onChange={e => form.setValue(`partidas.${i}.nota`, e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    {/* Indicador visual de sub-conceptos cuando está cerrado */}
                    {!isExpanded && (subItems.length > 0 || nota) && (
                      <div className="px-4 py-1.5 bg-[#4a5e30]/5 border-t flex items-center gap-2 text-[10px] text-[#4a5e30]">
                        {subItems.length > 0 && <span>• {subItems.length} sub-concepto{subItems.length > 1 ? "s" : ""}</span>}
                        {nota && <span>• Nota: {nota.length > 40 ? nota.slice(0, 40) + "…" : nota}</span>}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Total calculado */}
              <div className="flex items-center justify-between px-4 py-3 bg-[#4a5e30]/5 rounded-lg border border-[#4a5e30]/20">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" className="gap-1 text-xs h-7"
                    onClick={calcularTotal}>
                    <Calculator className="w-3.5 h-3.5" /> Recalcular
                  </Button>
                  <span className="text-xs text-muted-foreground">{fields.length} partida{fields.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total calculado</p>
                  <p className="text-lg font-bold text-[#4a5e30]">
                    ${totalCalculado.toLocaleString("es-MX", { minimumFractionDigits: 2 })} MXN
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Total manual (override) ────────────────────────────────────── */}
        <FormField control={form.control} name="totalEstimate" render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold">Total Estimado (MXN)</FormLabel>
            <p className="text-xs text-muted-foreground">Se calcula automáticamente de las partidas, o ajústalo manualmente</p>
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
              <Textarea {...field} placeholder="Describe el alcance general: materiales, acabados, garantías, condiciones…"
                className="min-h-[90px]" />
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
            <p className="text-xs text-muted-foreground">Solo visibles para el equipo, no aparecen en el PDF</p>
            <FormControl>
              <Textarea {...field} placeholder="Seguimiento, condiciones especiales del cliente, materiales especiales…"
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

      <ClientForm
        open={showClientForm}
        onClose={() => {
          setShowClientForm(false);
          queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
        }}
      />
    </Form>
  );
}
