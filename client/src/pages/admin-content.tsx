import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PageContent } from "@shared/schema";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Save, Plus, Loader2, FileText, Pencil } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const defaultContent = [
  { key: "hero_titulo", section: "hero", label: "Título Principal (Hero)", value: "Diseñamos albercas y espacios que transforman tu vida" },
  { key: "hero_subtitulo", section: "hero", label: "Subtítulo (Hero)", value: "Especialistas en construcción de albercas residenciales, comerciales y áreas sociales de lujo en Torreón, Coahuila y toda La Comarca Lagunera." },
  { key: "sobre_nosotros", section: "nosotros", label: "Texto Sobre Nosotros", value: "En Pergonia combinamos diseño arquitectónico, ingeniería de calidad y atención personalizada para crear espacios acuáticos y sociales que superan expectativas." },
  { key: "anos_experiencia", section: "stats", label: "Años de Experiencia", value: "15+" },
  { key: "proyectos_realizados", section: "stats", label: "Proyectos Realizados", value: "150+" },
  { key: "telefono", section: "contacto", label: "Teléfono / WhatsApp", value: "871 218 7073" },
  { key: "email", section: "contacto", label: "Correo Electrónico", value: "contacto@pergonia.mx" },
  { key: "horario", section: "contacto", label: "Horario de Atención", value: "Lunes – Viernes: 8:00 – 18:00 | Sábado: 9:00 – 14:00" },
  { key: "facebook_url", section: "redes", label: "URL de Facebook", value: "https://facebook.com/pergonia.arquitectura" },
  { key: "instagram_url", section: "redes", label: "URL de Instagram", value: "https://instagram.com/pergonia.arquitectura" },
  { key: "whatsapp_url", section: "redes", label: "URL de WhatsApp", value: "https://wa.me/528712187073" },
];

const sections = [
  { key: "hero", label: "Sección Principal (Hero)" },
  { key: "nosotros", label: "Sobre Nosotros" },
  { key: "stats", label: "Estadísticas" },
  { key: "contacto", label: "Información de Contacto" },
  { key: "redes", label: "Redes Sociales" },
];

export default function AdminContent() {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [newContent, setNewContent] = useState({ key: "", label: "", value: "", section: "general" });
  const { toast } = useToast();

  const { data: contents = [], isLoading } = useQuery<PageContent[]>({
    queryKey: ["/api/page-content"],
  });

  const saveMutation = useMutation({
    mutationFn: ({ key, value, section, label }: { key: string; value: string; section?: string; label?: string }) =>
      apiRequest("PUT", `/api/page-content/${encodeURIComponent(key)}`, { value, section, label }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-content"] });
      toast({ title: "Contenido guardado" });
      setEditingKey(null);
    },
    onError: () => toast({ title: "Error al guardar", variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof newContent) =>
      apiRequest("POST", "/api/page-content", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/page-content"] });
      toast({ title: "Contenido agregado" });
      setAddOpen(false);
      setNewContent({ key: "", label: "", value: "", section: "general" });
    },
    onError: () => toast({ title: "Error al agregar", variant: "destructive" }),
  });

  const getContent = (key: string) => {
    const saved = contents.find(c => c.key === key);
    const def = defaultContent.find(d => d.key === key);
    return saved || def;
  };

  const getValue = (key: string) => {
    return getContent(key)?.value || "";
  };

  const startEdit = (key: string) => {
    setEditingKey(key);
    setEditValue(getValue(key));
  };

  const saveEdit = (key: string, section?: string, label?: string) => {
    saveMutation.mutate({ key, value: editValue, section, label });
  };

  const isLongText = (key: string) => {
    return key.includes("titulo") || key.includes("subtitulo") || key.includes("sobre") || key.includes("horario");
  };

  return (
    <Layout title="Contenido del Sitio">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contenido del Sitio Web</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Edita los textos e información que aparecen en el sitio público.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4 mr-2" /> Agregar Campo
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map(section => {
              const sectionItems = defaultContent.filter(d => d.section === section.key);
              const customItems = contents.filter(c => c.section === section.key && !defaultContent.find(d => d.key === c.key));
              const allItems = [...sectionItems, ...customItems.map(c => ({ key: c.key, section: c.section, label: c.label || c.key, value: c.value || "" }))];

              if (allItems.length === 0) return null;

              return (
                <Card key={section.key}>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {section.label}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Sección: <code className="bg-muted px-1 py-0.5 rounded text-xs">{section.key}</code>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {allItems.map(item => (
                      <div key={item.key} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <label className="text-sm font-medium text-foreground">{item.label}</label>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Clave: <code className="bg-muted px-1 py-0.5 rounded">{item.key}</code>
                            </div>
                          </div>
                          {editingKey !== item.key && (
                            <Button variant="ghost" size="sm" onClick={() => startEdit(item.key)} className="h-8 flex-shrink-0">
                              <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                            </Button>
                          )}
                        </div>
                        {editingKey === item.key ? (
                          <div className="space-y-2">
                            {isLongText(item.key) ? (
                              <Textarea value={editValue} onChange={e => setEditValue(e.target.value)}
                                rows={3} className="resize-none text-sm" />
                            ) : (
                              <Input value={editValue} onChange={e => setEditValue(e.target.value)} className="text-sm" />
                            )}
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(item.key, item.section, item.label)}
                                disabled={saveMutation.isPending} className="bg-primary hover:bg-primary/90 text-white">
                                {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 mr-1" />}
                                Guardar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingKey(null)}>Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                            {getValue(item.key) || <em className="text-muted-foreground/60">Sin valor asignado</em>}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}

            {/* Custom content not in default sections */}
            {(() => {
              const customOther = contents.filter(c => !sections.find(s => s.key === c.section) && !defaultContent.find(d => d.key === c.key));
              if (customOther.length === 0) return null;
              return (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Contenido Personalizado</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customOther.map(item => (
                      <div key={item.key} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <label className="text-sm font-medium">{item.label || item.key}</label>
                            <div className="text-xs text-muted-foreground">
                              <code className="bg-muted px-1 py-0.5 rounded">{item.key}</code>
                              {item.section && <Badge variant="outline" className="ml-2 text-xs">{item.section}</Badge>}
                            </div>
                          </div>
                          {editingKey !== item.key && (
                            <Button variant="ghost" size="sm" onClick={() => startEdit(item.key)} className="h-8">
                              <Pencil className="w-3.5 h-3.5 mr-1" /> Editar
                            </Button>
                          )}
                        </div>
                        {editingKey === item.key ? (
                          <div className="space-y-2">
                            <Textarea value={editValue} onChange={e => setEditValue(e.target.value)} rows={3} className="resize-none text-sm" />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => saveEdit(item.key, item.section || "", item.label || "")}
                                disabled={saveMutation.isPending} className="bg-primary hover:bg-primary/90 text-white">
                                <Save className="w-3.5 h-3.5 mr-1" /> Guardar
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingKey(null)}>Cancelar</Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
                            {item.value || <em>Sin valor</em>}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Campo de Contenido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Etiqueta (nombre visible)</label>
              <Input value={newContent.label} onChange={e => setNewContent(p => ({ ...p, label: e.target.value }))}
                placeholder="Ej: Frase promocional del hero" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Clave única (sin espacios)</label>
              <Input value={newContent.key} onChange={e => setNewContent(p => ({ ...p, key: e.target.value.toLowerCase().replace(/\s+/g, "_") }))}
                placeholder="Ej: frase_promo" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Sección</label>
              <select value={newContent.section}
                onChange={e => setNewContent(p => ({ ...p, section: e.target.value }))}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm">
                {sections.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                <option value="general">General</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Valor</label>
              <Textarea value={newContent.value} onChange={e => setNewContent(p => ({ ...p, value: e.target.value }))}
                rows={3} className="resize-none" placeholder="Texto o valor del campo" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancelar</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white"
                disabled={!newContent.key || !newContent.label || createMutation.isPending}
                onClick={() => createMutation.mutate(newContent)}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Agregar Campo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
