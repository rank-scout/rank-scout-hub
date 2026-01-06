import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTree, FileBox, TrendingUp, Users } from "lucide-react";

export default function AdminDashboard() {
  const { data: categories = [] } = useCategories(true);
  const { data: projects = [] } = useProjects(true);

  const activeCategories = categories.filter((c) => c.is_active).length;
  const activeProjects = projects.filter((p) => p.is_active).length;

  const stats = [
    {
      title: "Kategorien",
      value: categories.length,
      subtitle: `${activeCategories} aktiv`,
      icon: FolderTree,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      title: "Projekte",
      value: projects.length,
      subtitle: `${activeProjects} aktiv`,
      icon: FileBox,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      title: "Dating",
      value: categories.filter((c) => c.theme === "DATING").length,
      subtitle: "Kategorien",
      icon: Users,
      color: "text-dating",
      bg: "bg-dating/10",
    },
    {
      title: "Casino",
      value: categories.filter((c) => c.theme === "CASINO").length,
      subtitle: "Kategorien",
      icon: TrendingUp,
      color: "text-casino",
      bg: "bg-casino/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">
          Willkommen zurück!
        </h2>
        <p className="text-muted-foreground">
          Hier ist eine Übersicht deines Rank-Scout Portals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">Letzte Kategorien</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Kategorien vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{category.icon || "📊"}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.theme}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      category.is_active 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {category.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">Letzte Projekte</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keine Projekte vorhanden.</p>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{project.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{project.url}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                      project.is_active 
                        ? "bg-green-500/10 text-green-500" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {project.is_active ? "Aktiv" : "Inaktiv"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
