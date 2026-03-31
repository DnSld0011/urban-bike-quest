import { LayoutDashboard, MapPin, Bike, Route, Map, Users, Settings, LogOut, Wrench, ShieldCheck } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

// Todos los ítems de menú principales con su módulo de permiso asociado
const mainItems = [
  { icon: LayoutDashboard, title: "Panel",         url: "/",           module: null        }, // siempre visible
  { icon: MapPin,          title: "Estaciones",    url: "/stations",   module: "stations"  },
  { icon: Bike,            title: "Bicicletas",    url: "/bikes",      module: "bikes"     },
  { icon: Route,           title: "Viajes",        url: "/trips",      module: "trips"     },
  { icon: Map,             title: "Mapa en Vivo",  url: "/map",        module: null        }, // siempre visible
  { icon: Wrench,          title: "Mantenimiento", url: "/maintenance",module: "maintenance"},
];

const adminItems = [
  { title: "Usuarios",         url: "/users",    icon: Users,        module: "users"    },
  { title: "Roles y Permisos", url: "/roles",    icon: ShieldCheck,  module: null       }, // solo admin real ve esto
  { title: "Configuración",    url: "/settings", icon: Settings,     module: "settings" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, can } = useAuth();
  const isAdmin = user?.role_id === 1;

  // Filtrar ítems visibles basado en permisos del rol
  const visibleMainItems = mainItems.filter((item) =>
    item.module === null ? true : can(item.module, "view")
  );
  // Los ítems admin: el de "Roles y Permisos" solo para admin real (role_id=1)
  const visibleAdminItems = adminItems.filter((item) => {
    if (item.url === "/roles") return isAdmin;         // solo superadmin
    if (isAdmin) return true;                          // admin ve todo lo administrativo
    if (item.module === null) return false;
    return can(item.module, "view");                   // otros roles: verificar permiso
  });

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Iniciales del usuario
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
            <Bike className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">
                BikeFlow
              </h1>
              <p className="text-[10px] text-sidebar-foreground">Movilidad Inteligente</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Gestión
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Administración
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleAdminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      activeClassName="bg-sidebar-accent text-primary font-medium"
                    >
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        {/* Info del usuario */}
        {!collapsed && user && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground">{user.email}</p>
            </div>
          </div>
        )}

        {/* Botón cerrar sesión */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
