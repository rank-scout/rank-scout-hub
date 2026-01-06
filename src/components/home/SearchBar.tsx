import { useState, useRef, useEffect } from "react";
import { Search, ExternalLink } from "lucide-react";
import { useProjects, type ProjectWithCategory } from "@/hooks/useProjects";
import { Input } from "@/components/ui/input";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { data: projects = [] } = useProjects();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Filter projects based on query
  const filteredProjects = query.length >= 2
    ? projects.filter((project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
        project.short_description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Suche nach Portalen, Apps oder Kategorien..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full h-14 pl-12 pr-4 text-lg bg-muted/50 border-border/50 rounded-xl focus:border-primary focus:ring-primary/20 placeholder:text-muted-foreground"
        />
      </div>

      {/* Dropdown Results */}
      {isOpen && filteredProjects.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in">
          {filteredProjects.map((project) => (
            <SearchResultItem key={project.id} project={project} onClose={() => setIsOpen(false)} />
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && filteredProjects.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg p-6 text-center z-50 animate-fade-in">
          <p className="text-muted-foreground">Keine Ergebnisse gefunden für "{query}"</p>
        </div>
      )}
    </div>
  );
}

function SearchResultItem({ project, onClose }: { project: ProjectWithCategory; onClose: () => void }) {
  const themeColor = getThemeColor(project.categories?.theme);

  return (
    <a
      href={`/go/${project.slug}`}
      onClick={onClose}
      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors border-b border-border last:border-b-0 group"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${themeColor}`}>
        <span className="text-lg">{project.categories?.icon || "📊"}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {project.name}
        </h4>
        {project.short_description && (
          <p className="text-sm text-muted-foreground truncate">
            {project.short_description}
          </p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}

function getThemeColor(theme?: string): string {
  switch (theme) {
    case "DATING":
      return "bg-dating/20 text-dating";
    case "CASINO":
      return "bg-casino/20 text-casino";
    case "ADULT":
      return "bg-adult/20 text-adult";
    default:
      return "bg-primary/20 text-primary";
  }
}
