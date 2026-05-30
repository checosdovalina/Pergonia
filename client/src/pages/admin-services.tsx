import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Service, InsertService, insertServiceSchema } from "@shared/schema";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Eye, EyeOff, Loader2, Waves, TreePine, Sofa, Wrench, Layers } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const CATEGORIES = [
  { value: "albercas", label: "Albercas", icon: Waves },
  { value: "pergolas", label: "Pérgolas", icon: Layers },
  { value: "jardines", label: "Jardines", icon: TreePine },
  { value: "areas_sociales", label: "Áreas Sociales", icon: Sofa },
  { value: "remodelacion", label: "Remodelación", icon: Wrench },
  { value: "otro", label: "Otro", icon: Layers },
];

const UNITS = [
  { value: "proyecto", label: "Por Proyecto" },
  { value: "m2", label: "Por m²" },
  { value: "ml", label: "Por metro lineal" },
  { value: "pieza", label: "Por pieza" },
];

const formSchema = insertServiceSchema.extend({
  name: z.string().min(1, "El nombre es requerido"),
  category: z.string().min(1, "La categoría es requerida"),
});

type FormValues = z.infer<typeof formSchema>;

function categoryLabel(cat: string) {
  return CATEGORIES.find(c => c.value === cat)?.label ?? cat;
}

function categoryColor(cat: string) {
  const map: Record<string, string> = {
    albercas: "bg-blue-100 text-blue-800",
    pergolas: "bg-amber-100 text-amber-800",
    jardines: "bg-green-100 text-green-800",
    areas_sociales: "bg-purple-100 text-purple-800",
    remodelacion: "bg-orange-100 text-orange-800",
    otro: "bg-gray-100 text-gray-800",
  };
  return map[cat] ?? "bg-gray-100 text-gray-800";
}

export default function AdminServices() {
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<Service | null>(null);
  const [deleteItem, setDeleteItem] = useState<Service | null>(null);
  const [filterCat, setFilterCat] = useState("todos");
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", category: "albercas", description: "", basePrice: null,
      unit: "proyecto", imageUrl: "", isActive: true, displayOrder: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("POST", "/api/services", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Servicio creado exitosamente" });
      setFormOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Error al crear", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FormValues> }) =>
      apiRequest("PUT", `/api/services/${id}`, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Servicio actualizado" });
      setFormOpen(false);
      setEditItem(null);
      form.reset();
    },
    onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/services/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({ title: "Servicio eliminado" });
      setDeleteItem(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      apiRequest("PUT", `/api/services/${id}`, { isActive }).then(r => r.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/services"] }),
  });

  function openCreate() {
    setEditItem(null);
    form.reset({ name: "", category: "albercas", description: "", basePrice: null, unit: "proyecto", imageUrl: "", isActive: true, displayOrder: 0 });
    setFormOpen(true);
  }

  function openEdit(item: Service) {
    setEditItem(item);
    form.reset({
      name: item.name,
      category: item.category,
      description: item.description ?? "",
      basePrice: item.basePrice ?? null,
      unit: item.unit ?? "proyecto",
      imageUrl: item.imageUrl ?? "",
      isActive: item.isActive ?? true,
      displayOrder: item.displayOrder ?? 0,
    });
    setFormOpen(true);
  }

  function onSubmit(data: FormValues) {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  const filtered = filterCat === "todos" ? items : items.filter(i => i.category === filterCat);
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Layout title="Catálogo de Servicios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Catálogo de Servicios</h1>
            <p className="text-muted-foreground text-sm mt-1">Gestiona albercas, pérgolas, jardines y demás servicios de Pergonia</p>
          </div>
          <Button onClick={openCreate} className="gap-2 bg-[#4a5e30] hover:bg-[#3a4a24]">
            <Plus className="w-4 h-4" /> Nuevo Servicio
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {[{ value: "todos", label: "Todos" }, ...CATEGORIES].map(cat => (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCat === cat.value
                  ? "bg-[#4a5e30] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#4a5e30]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay servicios en esta categoría</p>
            <p className="text-sm mt-1">Haz clic en "Nuevo Servicio" para agregar uno</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(item => (
              <Card key={item.id} className={`relative overflow-hidden ${!item.isActive ? "opacity-60" : ""}`}>
                {item.imageUrl && (
                  <div className="h-40 overflow-hidden">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${categoryColor(item.category)}`}>
                        {categoryLabel(item.category)}
                      </span>
                    </div>
                    {!item.isActive && <Badge variant="secondary" className="text-xs shrink-0">Inactivo</Badge>}
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                  )}

                  {item.basePrice && (
                    <p className="text-sm font-semibold text-[#4a5e30]">
                      ${Number(item.basePrice).toLocaleString("es-MX")}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        / {UNITS.find(u => u.value === item.unit)?.label ?? item.unit}
                      </span>
                    </p>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => openEdit(item)}>
                      <Edit className="w-3 h-3" /> Editar
                    </Button>
                    <Button
                      size="sm" variant="outline"
                      onClick={() => toggleMutation.mutate({ id: item.id, isActive: !item.isActive })}
                      title={item.isActive ? "Ocultar" : "Mostrar"}
                    >
                      {item.isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => setDeleteItem(item)}>
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={open => { setFormOpen(open); if (!open) setEditItem(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Editar Servicio" : "Nuevo Servicio"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del servicio *</FormLabel>
                  <FormControl><Input {...field} placeholder="Ej. Alberca Infinity con Desbordamiento" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="unit" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select value={field.value ?? "proyecto"} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {UNITS.map(u => <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} value={field.value ?? ""} rows={3}
                      placeholder="Describe el servicio, materiales, alcance del trabajo..." />
                  </FormControl>
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="basePrice" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio base (MXN)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.01"
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? null : e.target.value)}
                        placeholder="0.00" />
                    </FormControl>
                  </FormItem>
                )} />

                <FormField control={form.control} name="displayOrder" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orden de display</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value ?? ""}
                      placeholder="https://images.unsplash.com/..." />
                  </FormControl>
                  {field.value && (
                    <img src={field.value} alt="preview" className="mt-2 h-24 w-full object-cover rounded" onError={e => (e.currentTarget.style.display = "none")} />
                  )}
                </FormItem>
              )} />

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1 bg-[#4a5e30] hover:bg-[#3a4a24]">
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editItem ? "Guardar Cambios" : "Crear Servicio"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancelar</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteItem} onOpenChange={open => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará <strong>{deleteItem?.name}</strong> del catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
