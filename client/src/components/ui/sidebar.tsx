import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Home, 
  Users, 
  FileText, 
  UserCog,
  Settings, 
  LogOut, 
  Menu, 
  X,
  MessageSquarePlus,
  Image,
  FileEdit,
  ChevronDown,
  Droplets,
  Network,
  Clipboard,
  DollarSign,
  TrendingUp,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

type NavGroup = {
  label: string;
  links: { name: string; path: string; icon: React.ReactNode }[];
};

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState<string[]>([]);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const closeMobileSidebar = () => setShowMobileSidebar(false);
  const toggleMobileSidebar = () => setShowMobileSidebar(!showMobileSidebar);
  
  const navigateTo = (path: string) => {
    setLocation(path);
    closeMobileSidebar();
  };

  const toggleGroup = (label: string) => {
    setCollapsed(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const navGroups: NavGroup[] = [
    {
      label: "Principal",
      links: [
        { name: "Dashboard", path: "/dashboard", icon: <Home className="w-4 h-4" /> },
        { name: "Contactos / Leads", path: "/dashboard/leads", icon: <MessageSquarePlus className="w-4 h-4" /> },
      ],
    },
    {
      label: "Sitio Web",
      links: [
        { name: "Galería de Proyectos", path: "/dashboard/gallery", icon: <Image className="w-4 h-4" /> },
        { name: "Catálogo de Servicios", path: "/dashboard/services", icon: <Layers className="w-4 h-4" /> },
        { name: "Contenido del Sitio", path: "/dashboard/content", icon: <FileEdit className="w-4 h-4" /> },
      ],
    },
    {
      label: "Clientes y Proyectos",
      links: [
        { name: "Clientes", path: "/dashboard/clients", icon: <Users className="w-4 h-4" /> },
        { name: "Cotizaciones", path: "/dashboard/simple-quotes", icon: <FileText className="w-4 h-4" /> },
        { name: "Proyectos", path: "/dashboard/projects", icon: <Network className="w-4 h-4" /> },
      ],
    },
    {
      label: "Finanzas",
      links: [
        { name: "Facturas", path: "/dashboard/invoices", icon: <FileText className="w-4 h-4" /> },
        { name: "Pagos y Gastos", path: "/dashboard/payments", icon: <DollarSign className="w-4 h-4" /> },
      ],
    },
    {
      label: "Administración",
      links: [
        { name: "Usuarios", path: "/dashboard/users", icon: <UserCog className="w-4 h-4" /> },
        { name: "Configuración", path: "/dashboard/settings", icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];
  
  const userInitials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "US";

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard";
    return location.startsWith(path);
  };
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-primary border-b border-primary/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center flex-shrink-0">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-base tracking-wide leading-none">PERGONIA</div>
            <div className="text-white/60 text-[10px] leading-none mt-0.5">Admin Portal</div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10 h-8 w-8" onClick={closeMobileSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage alt={user?.name} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{userInitials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role === "superadmin" ? "Super Admin" : user?.role}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-auto py-3 px-2">
        {navGroups.map((group) => {
          const isCollapsed = collapsed.includes(group.label);
          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                {group.label}
                <ChevronDown className={cn("w-3 h-3 transition-transform", isCollapsed && "-rotate-90")} />
              </button>
              {!isCollapsed && (
                <div className="space-y-0.5">
                  {group.links.map((link) => (
                    <Button
                      key={link.path}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm h-9 px-3 rounded-lg",
                        isActive(link.path)
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "text-foreground/70 hover:bg-muted hover:text-foreground"
                      )}
                      onClick={() => navigateTo(link.path)}
                    >
                      {link.icon}
                      <span className="ml-2.5">{link.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 text-sm h-9 px-3"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="w-4 h-4" />
          <span className="ml-2.5">Cerrar Sesión</span>
        </Button>
        <div className="text-center mt-2">
          <a href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">← Ver sitio web</a>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-primary z-30 border-b border-primary/20 flex items-center px-4 safe-top">
        <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="text-white hover:bg-white/10 h-9 w-9">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1 flex justify-center items-center gap-2">
          <Droplets className="w-4 h-4 text-white" />
          <span className="font-bold text-white tracking-wide">PERGONIA</span>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={closeMobileSidebar} />
      )}
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 flex-col border-r bg-background transition-transform lg:translate-x-0 lg:flex safe-left safe-top safe-bottom",
          showMobileSidebar ? "translate-x-0 flex" : "-translate-x-full hidden lg:flex",
          className
        )}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
