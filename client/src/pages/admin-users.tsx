import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Users, Plus, Edit, Trash, Shield, User, Loader2, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

type SafeUser = { id: number; username: string; name: string; role: string };

const editSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  role: z.enum(["user", "admin", "superadmin"]),
});

const createSchema = editSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type EditValues = z.infer<typeof editSchema>;
type CreateValues = z.infer<typeof createSchema>;

const roleConfig: Record<string, { label: string; color: string }> = {
  superadmin: { label: "Super Admin", color: "bg-red-100 text-red-700 border-red-200" },
  admin: { label: "Administrador", color: "bg-primary/10 text-primary border-primary/20" },
  user: { label: "Usuario", color: "bg-muted text-muted-foreground border-border" },
};

export default function AdminUsers() {
  const [editUser, setEditUser] = useState<SafeUser | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteUser, setDeleteUser] = useState<SafeUser | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading } = useQuery<SafeUser[]>({
    queryKey: ["/api/users"],
  });

  const editForm = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", username: "", role: "user" },
  });

  const createForm = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { name: "", username: "", role: "user", password: "" },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EditValues }) =>
      apiRequest("PUT", `/api/users/${id}`, data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Usuario actualizado" });
      setEditUser(null);
    },
    onError: () => toast({ title: "Error al actualizar usuario", variant: "destructive" }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateValues) =>
      apiRequest("POST", "/api/register", data).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Usuario creado exitosamente" });
      setCreateOpen(false);
      createForm.reset();
    },
    onError: () => toast({ title: "Error al crear usuario", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/users/${id}`).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "Usuario eliminado" });
      setDeleteUser(null);
    },
    onError: () => toast({ title: "Error al eliminar usuario", variant: "destructive" }),
  });

  const openEdit = (u: SafeUser) => {
    setEditUser(u);
    editForm.reset({ name: u.name, username: u.username, role: u.role as "user" | "admin" | "superadmin" });
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  const canManage = currentUser?.role === "admin" || currentUser?.role === "superadmin";

  return (
    <Layout title="Gestión de Usuarios">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Usuarios</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Administra los usuarios con acceso al portal administrativo.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
            </Button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o usuario..." className="pl-9" />
        </div>

        {!canManage && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            Solo los administradores pueden gestionar usuarios.
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Sin usuarios</h3>
              <p className="text-muted-foreground text-sm">No se encontraron usuarios con ese criterio de búsqueda.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(u => {
              const role = roleConfig[u.role] || roleConfig.user;
              const isCurrentUser = u.id === currentUser?.id;
              return (
                <Card key={u.id} className={`transition-shadow hover:shadow-md ${isCurrentUser ? "ring-2 ring-primary/30" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground flex items-center gap-1">
                            {u.name}
                            {isCurrentUser && <span className="text-xs text-primary">(tú)</span>}
                          </div>
                          <div className="text-sm text-muted-foreground">@{u.username}</div>
                        </div>
                      </div>
                      <Badge className={`text-xs border ${role.color} font-medium`}>{role.label}</Badge>
                    </div>
                    {canManage && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 h-8" onClick={() => openEdit(u)}>
                          <Edit className="w-3.5 h-3.5 mr-1" /> Editar
                        </Button>
                        {!isCurrentUser && (
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive"
                            onClick={() => setDeleteUser(u)}>
                            <Trash className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onOpenChange={o => !o && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(data => editUser && updateMutation.mutate({ id: editUser.id, data }))} className="space-y-4">
              <FormField control={editForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={editForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setEditUser(null)}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={o => { setCreateOpen(o); if (!o) createForm.reset(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(data => createMutation.mutate(data))} className="space-y-4">
              <FormField control={createForm.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo *</FormLabel>
                  <FormControl><Input {...field} placeholder="Nombre del usuario" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de usuario *</FormLabel>
                  <FormControl><Input {...field} placeholder="usuario123" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña *</FormLabel>
                  <FormControl><Input {...field} type="password" placeholder="Mínimo 6 caracteres" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={createForm.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="user">Usuario</SelectItem>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => { setCreateOpen(false); createForm.reset(); }}>Cancelar</Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-white" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Crear Usuario"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteUser} onOpenChange={o => !o && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al usuario "{deleteUser?.name}" (@{deleteUser?.username}) permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteUser && deleteMutation.mutate(deleteUser.id)}
              className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
