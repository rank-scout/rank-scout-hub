import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, ArrowUp, ArrowDown, Scale, Loader2 } from "lucide-react";

interface FooterLink {
  id: string;
  category_id: string | null;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
  column_name: string | null;
  created_at: string;
}

interface CategoryLegalLinksEditorProps {
  categoryId: string | null;
}

export function CategoryLegalLinksEditor({ categoryId }: CategoryLegalLinksEditorProps) {
  const queryClient = useQueryClient();
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  // Fetch category-specific legal links
  const { data: links = [], isLoading } = useQuery({
    queryKey: ["category-legal-links", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      
      const { data, error } = await supabase
        .from("footer_links")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data || []) as FooterLink[];
    },
    enabled: !!categoryId,
  });

  // Create link mutation
  const createLink = useMutation({
    mutationFn: async (link: { label: string; url: string; category_id: string; sort_order: number }) => {
      const { data, error } = await supabase
        .from("footer_links")
        .insert({ ...link, is_active: true, column_name: "legal" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-legal-links", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      setNewLabel("");
      setNewUrl("");
      toast({ title: "Legal-Link hinzugefügt" });
    },
    onError: () => {
      toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
    },
  });

  // Update link mutation
  const updateLink = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<FooterLink> & { id: string }) => {
      const { error } = await supabase
        .from("footer_links")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-legal-links", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
    },
  });

  // Delete link mutation
  const deleteLink = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("footer_links")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["category-legal-links", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["footer-links"] });
      toast({ title: "Legal-Link gelöscht" });
    },
    onError: () => {
      toast({ title: "Fehler beim Löschen", variant: "destructive" });
    },
  });

  const handleAddLink = () => {
    if (!categoryId) {
      toast({ 
        title: "Hinweis", 
        description: "Bitte speichere zuerst die Landingpage, dann kannst du Legal-Links hinzufügen.", 
        variant: "destructive" 
      });
      return;
    }
    if (!newLabel.trim() || !newUrl.trim()) {
      toast({ title: "Bitte Label und URL eingeben", variant: "destructive" });
      return;
    }
    createLink.mutate({
      label: newLabel.trim(),
      url: newUrl.trim(),
      category_id: categoryId,
      sort_order: links.length,
    });
  };

  const handleMoveOrder = async (link: FooterLink, direction: "up" | "down") => {
    const currentIndex = links.findIndex((l) => l.id === link.id);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= links.length) return;

    const otherLink = links[newIndex];
    
    await Promise.all([
      updateLink.mutateAsync({ id: link.id, sort_order: otherLink.sort_order }),
      updateLink.mutateAsync({ id: otherLink.id, sort_order: link.sort_order }),
    ]);
  };

  const handleToggleActive = (link: FooterLink) => {
    updateLink.mutate({ id: link.id, is_active: !link.is_active });
  };

  const handleDelete = (id: string) => {
    if (confirm("Legal-Link wirklich löschen?")) {
      deleteLink.mutate(id);
    }
  };

  const handleLabelChange = (id: string, label: string) => {
    updateLink.mutate({ id, label });
  };

  const handleUrlChange = (id: string, url: string) => {
    updateLink.mutate({ id, url });
  };

  if (!categoryId) {
    return (
      <div className="border border-dashed border-muted-foreground/30 rounded-lg p-6 text-center">
        <Scale className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          Speichere zuerst die Landingpage, dann kannst du hier Legal-Links hinzufügen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Scale className="w-4 h-4 text-primary" />
        <h5 className="font-medium text-foreground">Legal-Links (Impressum, Datenschutz etc.)</h5>
      </div>
      <p className="text-xs text-muted-foreground">
        Diese Links erscheinen im Footer dieser Landingpage. Wenn keine Links definiert sind, werden die globalen Links verwendet.
      </p>

      {/* Existing links */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : links.length > 0 ? (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {links.map((link, index) => (
            <div 
              key={link.id} 
              className={`flex items-center gap-2 p-2 rounded-lg border ${link.is_active ? 'bg-card' : 'bg-muted/30 opacity-60'}`}
            >
              <div className="flex flex-col gap-0.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => handleMoveOrder(link, "up")}
                  disabled={index === 0}
                >
                  <ArrowUp className="w-3 h-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => handleMoveOrder(link, "down")}
                  disabled={index === links.length - 1}
                >
                  <ArrowDown className="w-3 h-3" />
                </Button>
              </div>
              <Input
                defaultValue={link.label}
                onBlur={(e) => {
                  if (e.target.value !== link.label) {
                    handleLabelChange(link.id, e.target.value);
                  }
                }}
                placeholder="Label"
                className="flex-1 h-8 text-sm"
              />
              <Input
                defaultValue={link.url}
                onBlur={(e) => {
                  if (e.target.value !== link.url) {
                    handleUrlChange(link.id, e.target.value);
                  }
                }}
                placeholder="URL"
                className="flex-1 h-8 text-sm"
              />
              <Switch
                checked={link.is_active}
                onCheckedChange={() => handleToggleActive(link)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => handleDelete(link.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic py-2">
          Keine spezifischen Legal-Links für diese Landingpage. Es werden die globalen Links verwendet.
        </p>
      )}

      {/* Add new link */}
      <div className="border-t pt-4 mt-4">
        <Label className="text-sm font-medium mb-2 block">Neuen Legal-Link hinzufügen</Label>
        <div className="flex items-center gap-2">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Label (z.B. Impressum)"
            className="flex-1 h-9"
          />
          <Input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="URL (z.B. /impressum)"
            className="flex-1 h-9"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddLink}
            disabled={createLink.isPending}
            className="gap-1 shrink-0"
          >
            {createLink.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}
