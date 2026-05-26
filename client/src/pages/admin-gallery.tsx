import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { GalleryItem, InsertGalleryItem } from "@shared/schema";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash, Eye, EyeOff, Image, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertGalleryItemSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const categories = [
  { value: "albercas", label: "Albercas" },
  { value: "areas_sociales", label: "Áreas Sociales" },
  { value: "jardines", label: "Jardines" },
  { value: "pergolas", label: "Pérgolas" },
  { value: "remodelacion", label: "Remodelación" },
];

const formSchema = insertGalleryItemSchema.extend({
  title: z.string().min(1, "El título es requerido"),
  imageUrl: z.string().url("Ingresa una URL válida de imagen"),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminGallery() {
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [filterCat, setFilterCat] = useState<string>("todos");
  const { toast } = useToast();

  const { data: items = [], isLoading } = useQuery<GalleryItem[]>({
    queryKey: ["/api/gallery"],
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", description: "", imageUrl: "", category: "albercas", displayOrder: 0, isVisible: true },
  });

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("POST", "/api/gallery", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Imagen agregada exitosamente" });
      setFormOpen(false);
      form.reset();
    },
    onError: () => toast({ title: "Error al agregar imagen", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FormValues> }) =>
      apiRequest("PUT", `/api/gallery/${id}`, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Imagen actualizada" });
      setFormOpen(false);
      setEditItem(null);
      form.reset();
    },
    onError: () => toast({ title: "Error al actualizar", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/gallery/${id}`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({ title: "Imagen eliminada" });
      setDeleteItem(null);
    },
    onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
  });

  const toggleVisibility = (item: GalleryItem) => {
    updateMutation.mutate({ id: item.id, data: { isVisible: !item.isVisible } });
  };

  const openEdit = (item: GalleryItem) => {
    setEditItem(item);
    form.reset({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      category: item.category,
      displayOrder: item.displayOrder || 0,
      isVisible: item.isVisible ?? true,
    });
    setFormOpen(true);
  };

  const openCreate = () => {
    setEditItem(null);
    form.reset({ title: "", description: "", imageUrl: "", category: "albercas", displayOrder: 0, isVisible: true });
    setFormOpen(true);
  };

  const onSubmit = (data: FormValues) => {
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const filtered = filterCat === "todos" ? items : items.filter(i => i.category === filterCat);

  const categoryLabel = (cat: string) => categories.find(c => c.value === cat)?.label || cat;

  return (
    <Layout title="Galería de Proyectos">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Galería de Proyectos</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Administra las imágenes que se muestran en el sitio web público.
            </p>
          </div>
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Agregar Imagen
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[{ value: "todos", label: "Todos" }, ...categories].map(cat => (
            <button key={cat.value} onClick={() => setFilterCat(cat.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterCat === cat.value ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-primary/10"
              }`}>
              {cat.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Image className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Sin imágenes</h3>
              <p className="text-muted-foreground text-sm mb-4">Agrega imágenes para mostrar en la galería del sitio web.</p>
              <Button onClick={openCreate} className="bg-primary hover:bg-primary/90 text-white">
                <Plus className="w-4 h-4 mr-2" /> Agregar primera imagen
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(item => (
              <Card key={item.id} className={`overflow-hidden transition-opacity ${!item.isVisible ? "opacity-60" : ""}`}>
                <div className="aspect-[4/3] bg-muted overflow-hidden relative">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Imagen"; }} />
                  {!item.isVisible && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-black/60 text-white border-0">Oculto</Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                    <Badge variant="outline" className="text-xs flex-shrink-0">{categoryLabel(item.category)}</Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleVisibility(item)} className="flex-1 h-8">
                      {item.isVisible ? <Eye className="w-3.5 h-3.5 mr-1" /> : <EyeOff className="w-3.5 h-3.5 mr-1" />}
                      {item.isVisible ? "Visible" : "Oculto"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} className="h-8 px-2">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteItem(item)} className="h-8 px-2 text-destructive hover:text-destructive">
                      <Trash className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={(o) => { setFormOpen(o); if (!o) { setEditItem(null); form.reset(); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editItem ? "Editar Imagen" : "Agregar Imagen"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl><Input {...field} placeholder="Ej: Alberca Infinity Residencial" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la Imagen *</FormLabel>
                  <FormControl><Input {...field} placeholder="https://..." type="url" /></FormControl>
                  <FormMessage />
                  {field.value && field.value.startsWith("http") && (
                    <img src={field.value} alt="preview" className="w-full h-32 object-cover rounded-md mt-2 bg-muted" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  )}
                </FormItem>
              )} />
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {categories.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl><Textarea {...field} value={field.value || ""} placeholder="Ej: Proyecto residencial Torreón" rows={2} className="resize-none" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="displayOrder" render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden de visualización</FormLabel>
                  <FormControl><Input {...field} type="number" onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setFormOpen(false); setEditItem(null); form.reset(); }}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editItem ? "Guardar Cambios" : "Agregar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar imagen?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará "{deleteItem?.title}" de la galería permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
