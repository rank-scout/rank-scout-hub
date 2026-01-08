import { useState } from "react";
import { useRedirects, useCreateRedirect, useUpdateRedirect, useDeleteRedirect, type Redirect } from "@/hooks/useRedirects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Copy } from "lucide-react";

export default function AdminRedirects() {
  const { data: redirects = [], isLoading } = useRedirects(true);
  const createRedirect = useCreateRedirect();
  const updateRedirect = useUpdateRedirect();
  const deleteRedirect = useDeleteRedirect();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<Redirect | null>(null);
  const [formData, setFormData] = useState({ slug: "", target_url: "", is_active: true });

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const redirectBaseUrl = `${supabaseUrl}/functions/v1/go-redirect?slug=`;

  function openCreateDialog() {
    setEditingRedirect(null);
    setFormData({ slug: "", target_url: "", is_active: true });
    setIsDialogOpen(true);
  }

  function openEditDialog(redirect: Redirect) {
    setEditingRedirect(redirect);
    setFormData({
      slug: redirect.slug,
      target_url: redirect.target_url,
      is_active: redirect.is_active,
    });
    setIsDialogOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingRedirect) {
        await updateRedirect.mutateAsync({ id: editingRedirect.id, input: formData });
        toast({ title: "Redirect aktualisiert" });
      } else {
        await createRedirect.mutateAsync(formData);
        toast({ title: "Redirect erstellt" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Ein Fehler ist aufgetreten",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Möchtest du diesen Redirect wirklich löschen?")) return;
    try {
      await deleteRedirect.mutateAsync(id);
      toast({ title: "Redirect gelöscht" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Redirect konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  }

  async function handleToggleActive(redirect: Redirect) {
    try {
      await updateRedirect.mutateAsync({
        id: redirect.id,
        input: { is_active: !redirect.is_active },
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Status konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  }

  function copyRedirectUrl(slug: string) {
    navigator.clipboard.writeText(`${redirectBaseUrl}${slug}`);
    toast({ title: "URL kopiert" });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Redirects</h2>
          <p className="text-muted-foreground">Verwalte Tracking-Links und zähle Klicks.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Neuer Redirect
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingRedirect ? "Redirect bearbeiten" : "Neuer Redirect"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input 
                  id="slug" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="tinder-offer"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Wird zu: {redirectBaseUrl}<span className="font-medium">{formData.slug || "..."}</span>
                </p>
              </div>

              <div>
                <Label htmlFor="target_url">Ziel-URL (Affiliate Link)</Label>
                <Input 
                  id="target_url" 
                  type="url"
                  value={formData.target_url}
                  onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                  placeholder="https://tracking.example.com/go/..."
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Aktiv</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={createRedirect.isPending || updateRedirect.isPending}
              >
                {(createRedirect.isPending || updateRedirect.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingRedirect ? "Speichern" : "Erstellen"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Slug</TableHead>
                <TableHead>Ziel</TableHead>
                <TableHead className="text-center">Klicks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Keine Redirects vorhanden. Erstelle deinen ersten Tracking-Link.
                  </TableCell>
                </TableRow>
              ) : (
                redirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {redirect.slug}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyRedirectUrl(redirect.slug)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 max-w-[200px]">
                        <span className="truncate text-sm text-muted-foreground">
                          {redirect.target_url}
                        </span>
                        <a
                          href={redirect.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary flex-shrink-0"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-mono font-medium text-primary">
                        {redirect.click_count.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={redirect.is_active}
                        onCheckedChange={() => handleToggleActive(redirect)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(redirect)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(redirect.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
