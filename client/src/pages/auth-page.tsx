import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Droplets, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Link } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, { message: "El usuario es requerido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const { user, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });
  
  useEffect(() => {
    if (user) setLocation("/dashboard");
  }, [user, setLocation]);
  
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ username: data.username, password: data.password });
  };
  
  return (
    <div className="min-h-screen flex bg-[#f8f4ec]">
      {/* Left panel */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center px-12 py-12"
        style={{ background: "linear-gradient(145deg, #3a4a28 0%, #4d6035 60%, #2c3a1e 100%)" }}>
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-2xl text-white tracking-wide">PERGONIA</div>
              <div className="text-white/60 text-sm">Arquitectura Exterior</div>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
            Portal de Administración
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            Gestiona tu sitio web, galería de proyectos, clientes y cotizaciones desde un solo lugar.
          </p>

          <div className="space-y-4">
            {[
              "Administra clientes y cotizaciones",
              "Actualiza la galería de proyectos",
              "Edita el contenido del sitio web",
              "Gestiona usuarios y accesos",
            ].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-[#c9a962]/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-[#c9a962]" />
                </div>
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <Link href="/">
              <button className="text-sm text-white/50 hover:text-white transition-colors">
                ← Volver al sitio web
              </button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Right panel - Login form */}
      <div className="w-full lg:w-2/5 xl:w-1/3 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-primary tracking-wide">PERGONIA</span>
            </div>
            <p className="text-muted-foreground text-sm">Arquitectura Exterior</p>
          </div>
          
          <Card className="shadow-lg border-0 bg-white">
            <CardContent className="pt-8 pb-8 px-8">
              <div className="text-center mb-7">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Iniciar Sesión</h2>
                <p className="text-sm text-muted-foreground mt-1">Accede al portal de administración</p>
              </div>
              
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-sm font-medium">Usuario</Label>
                  <Input 
                    id="username" 
                    placeholder="tu_usuario"
                    className="bg-[#f8f4ec] border-[#e8e0cc] focus:border-primary"
                    {...loginForm.register("username")}
                  />
                  {loginForm.formState.errors.username && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.username.message}</p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••"
                    className="bg-[#f8f4ec] border-[#e8e0cc] focus:border-primary"
                    {...loginForm.register("password")}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "Entrando..." : "Iniciar Sesión"}
                </Button>
              </form>
              
              <p className="mt-6 text-center text-xs text-muted-foreground">
                ¿Sin cuenta? Solicita acceso a un administrador.
              </p>
            </CardContent>
          </Card>

          <div className="text-center mt-6 lg:hidden">
            <Link href="/">
              <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                ← Volver al sitio web
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
