import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useForumThreads, useForumCategories } from "@/hooks/useForum";
import { MessageSquare, Eye, Pin, Clock, Search, Filter, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Forum() {
  const { data: threads, isLoading } = useForumThreads();
  const { data: categories } = useForumCategories();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filteredThreads = threads?.filter((thread) => {
    const matchesSearch =
      thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || thread.category_id === categoryFilter;
    return matchesSearch && matchesCategory && thread.is_active;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-4">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Community Forum</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Diskussionen & Erfahrungen
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tausche dich mit anderen aus, stelle Fragen und teile deine Erfahrungen
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Beiträge durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="all">Alle Kategorien</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Thread List */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
            ) : filteredThreads && filteredThreads.length > 0 ? (
              <div className="space-y-4">
                {filteredThreads.map((thread) => (
                  <Link key={thread.id} to={`/forum/${thread.slug}`}>
                    <Card className="hover:shadow-md transition-all duration-300 hover:border-primary/30 group">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {thread.is_pinned && (
                                <Badge variant="secondary" className="gap-1">
                                  <Pin className="w-3 h-3" />
                                  Angepinnt
                                </Badge>
                              )}
                              {thread.is_locked && (
                                <Badge variant="outline">Geschlossen</Badge>
                              )}
                              {thread.is_answered && (
                                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                  ✓ Beantwortet
                                </Badge>
                              )}
                            </div>

                            <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {thread.title}
                            </h2>

                            <p className="text-muted-foreground line-clamp-2 mb-3">
                              {thread.content.replace(/<[^>]*>/g, "").substring(0, 200)}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {thread.author_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {formatDate(thread.created_at || "")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5" />
                                {thread.view_count || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Keine Beiträge gefunden</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Versuche es mit anderen Suchbegriffen"
                    : "Es wurden noch keine Beiträge erstellt"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
