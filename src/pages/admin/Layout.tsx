import { Navigate, Outlet, NavLink, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  LayoutDashboard, 
  FolderTree, 
  FileBox,
  Link2,
  Mail,
  Settings, 
  LogOut, 
  Search,
  Loader2,
  Menu,
  X,
  UploadCloud,
  Layers,
  BarChart3,
  Globe,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Navigation Items
const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Projekte", icon: Globe, path: "/admin/projects" },
  { label: "Kategorien", icon: Layers, path: "/admin/categories" },
  { label: "Magazin", icon: BookOpen, path: "/admin/forum" },
  { label: "Publisher", icon: UploadCloud, path: "/admin/multi-publisher" },
  { label: "Redirects", icon: BarChart3, path: "/admin/redirects" },
  { label: "Footer-Links", icon: Link2, path: "/admin/footer-links" },
  { label: "Leads", icon: Mail, path: "/admin/leads" },
  { label: "Einstellungen", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: isServerAdmin, isLoading: isVerifyingAdmin } = useQuery({
    queryKey: ['verify-admin', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('verify_admin_access');
      if (error) {
        console.error('Admin verification failed:', error);
        return false;
      }
      return data === true;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isServerAdmin) {
    return <Navigate to="/" replace />;
  }

  const currentTitle = navItems.find((item) => 
    item.path === "/admin" 
      ? location.pathname === "/admin" 
      : location.pathname.startsWith(item.path)
  )?.label || "Dashboard";

  return (
    <div className="min-h-screen flex bg-background font-body">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-primary/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-primary-foreground border-r border-white/10 shadow-xl transition-transform lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shadow-lg shadow-secondary/20">
                <span className="font-display font-bold text-xl text-white">R</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-white leading-none">
                  Rank-Scout
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-1">
                  Admin Hub
                </span>
              </div>
            </Link>
            <button
              className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-secondary text-white shadow-md translate-x-1"
                    : "text-slate-300 hover:bg-white/10 hover:text-white hover:translate-x-1"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                    )} />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-3 mb-4 px-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center shadow-inner">
                <span className="text-sm font-bold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <p className="text-xs text-slate-400">Online</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Link to="/">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-400 hover:text-white hover:bg-white/5 font-normal">
                  <Globe className="w-4 h-4" />
                  Zur Website
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-start gap-2 text-red-300 hover:text-red-100 hover:bg-red-500/10 font-normal"
              >
                <LogOut className="w-4 h-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <header className="lg:hidden h-16 bg-primary border-b border-white/10 flex items-center px-4 sticky top-0 z-30 shadow-md">
          <button className="p-2 -ml-2 text-white" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-3 font-display font-bold text-white text-lg">Rank-Scout</span>
        </header>

        <div className="hidden lg:flex h-16 bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-20 px-8 items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
             <span className="text-muted-foreground font-medium">Admin</span>
             <span className="text-slate-300">/</span>
             <h1 className="text-primary font-bold text-lg capitalize">{currentTitle}</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs font-mono text-muted-foreground bg-slate-100 px-2 py-1 rounded">v2.0.1</div>
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-fade-in">
             <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}