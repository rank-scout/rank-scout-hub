import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Download, Copy, Mail, Search, Loader2 } from "lucide-react";
import { useState } from "react";

async function fetchSubscribers() {
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export default function AdminLeads() {
  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ["subscribers"],
    queryFn: fetchSubscribers,
  });

  const [searchTerm, setSearchTerm] = useState("");

  const filteredSubscribers = subscribers.filter(
    (sub) =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.source_page || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  function copyEmails() {
    const text = filteredSubscribers.map((s) => s.email).join("\n");
    navigator.clipboard.writeText(text);
    toast({ title: `${filteredSubscribers.length} E-Mails kopiert` });
  }

  function exportCSV() {
    const csv =
      "Email,Quelle,Datum,Aktiv\n" +
      filteredSubscribers
        .map(
          (s) =>
            `"${s.email}","${s.source_page || "Direkt"}","${s.created_at}","${
              s.is_active ? "Ja" : "Nein"
            }"`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast({ title: "CSV heruntergeladen" });
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Leads
          </h2>
          <p className="text-muted-foreground">
            {subscribers.length} Newsletter-Abonnenten
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copyEmails} className="gap-2">
            <Copy className="w-4 h-4" />
            Kopieren
          </Button>
          <Button onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            CSV Export
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Nach E-Mail oder Quelle suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {subscribers.length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktiv
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {subscribers.filter((s) => s.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diese Woche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {
                subscribers.filter((s) => {
                  const created = new Date(s.created_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return created > weekAgo;
                }).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Alle Leads ({filteredSubscribers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm
                ? "Keine Leads gefunden"
                : "Noch keine Newsletter-Abonnenten"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-Mail</TableHead>
                    <TableHead>Quelle</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscribers.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {sub.source_page || "Direkt"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(sub.created_at).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            sub.is_active
                              ? "bg-green-500/10 text-green-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {sub.is_active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
