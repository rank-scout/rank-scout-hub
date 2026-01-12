import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardTheme } from "@/hooks/useDashboardTheme";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Landingpages", icon: FolderTree, path: "/admin/categories" },
  { label: "Projekte", icon: FileBox, path: "/admin/projects" },
  { label: "Redirects", icon: Link2, path: "/admin/redirects" },
  { label: "Footer-Links", icon: Link2, path: "/admin/footer-links" },
  { label: "Leads", icon: Mail, path: "/admin/leads" },
  { label: "Einstellungen", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const { user, isLoading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dashboardTheme = useDashboardTheme();

  // Server-side admin verification - critical for security
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
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  if (isLoading || isVerifyingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sidebar">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Server-side admin check - prevents UI bypass attacks
  if (!isServerAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={cn("min-h-screen flex", dashboardTheme === "light" ? "bg-white" : "bg-sidebar")}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform lg:translate-x-0 lg:static lg:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg text-sidebar-foreground">
                Admin
              </span>
            </Link>
            <button
              className="lg:hidden p-2 text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-sidebar-foreground/60">
                  {isServerAdmin ? "Administrator" : "Benutzer"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={signOut}
              className="w-full justify-start gap-2 border-sidebar-border hover:bg-sidebar-accent"
            >
              <LogOut className="w-4 h-4" />
              Abmelden
            </Button>
          </div>

          {/* Back to site */}
          <div className="p-4 pt-0">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground">
                ← Zur Website
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-16 bg-background border-b border-border flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            className="lg:hidden p-2 -ml-2 text-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-lg text-foreground ml-2 lg:ml-0">
            {navItems.find((item) => item.path === location.pathname)?.label || "Admin"}
          </h1>
        </header>

        {/* Page content */}
        <div className="flex-1 p-4 lg:p-6 bg-muted/30">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
