import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, CheckCircle2, AlertTriangle, Copy, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function genLicenceOutput(codeRequest: string): string {
  if (!codeRequest) return "";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seed = codeRequest.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const gen = (n: number) => Array.from({ length: n }, (_, i) => chars[(seed * (i + 7) * 31) % chars.length]).join("");
  return `LIC-${gen(4)}-${gen(4)}-${gen(4)}-${gen(4)}`;
}

export default function SuperAdminLicences() {
  const { salles, licences, genererLicence } = useApp();
  const { toast } = useToast();
  const [selectedSalle, setSelectedSalle] = useState("");
  const [codeRequest, setCodeRequest] = useState("");
  const [generatedLic, setGeneratedLic] = useState("");

  function handleGenerate() {
    if (!selectedSalle || !codeRequest.trim()) {
      toast({ title: "Remplir tous les champs", variant: "destructive" });
      return;
    }
    const lic = genLicenceOutput(codeRequest);
    setGeneratedLic(lic);
  }

  function handleActivate() {
    if (!selectedSalle || !generatedLic) return;
    genererLicence(Number(selectedSalle), codeRequest);
    toast({ title: "Licence activée", description: `Salle ID ${selectedSalle}` });
    setCodeRequest("");
    setGeneratedLic("");
    setSelectedSalle("");
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedLic);
    toast({ title: "Code copié" });
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestion des licences</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Générer et activer les licences par salle</p>
        </div>

        {/* Generator */}
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Key size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Générateur de licence</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Salle</Label>
              <Select value={selectedSalle} onValueChange={setSelectedSalle}>
                <SelectTrigger data-testid="select-salle-licence">
                  <SelectValue placeholder="Choisir une salle" />
                </SelectTrigger>
                <SelectContent>
                  {salles.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nom}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Code de demande (fourni par l'admin)</Label>
              <Input
                value={codeRequest}
                onChange={e => setCodeRequest(e.target.value)}
                placeholder="Ex: REQ-20240115-CTNU"
                data-testid="input-code-request"
              />
            </div>
          </div>

          <Button onClick={handleGenerate} className="gap-1.5" data-testid="button-generate-licence">
            <Key size={15} /> Générer la licence
          </Button>

          {generatedLic && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <p className="text-xs text-muted-foreground">Licence générée — à transmettre à l'admin :</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-primary" data-testid="text-generated-licence">
                  {generatedLic}
                </code>
                <Button variant="outline" size="sm" onClick={copyCode} data-testid="button-copy-licence">
                  <Copy size={14} />
                </Button>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5" onClick={handleActivate} data-testid="button-activate-licence">
                <CheckCircle2 size={14} /> Activer cette licence
              </Button>
            </div>
          )}
        </div>

        {/* Licences list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Licences actives</h2>
          </div>
          <div className="divide-y divide-border">
            {licences.map(lic => {
              const salle = salles.find(s => s.id === lic.salleId);
              const urgent = lic.joursRestants <= 7;
              const warn = lic.joursRestants <= 30 && !urgent;
              return (
                <div key={lic.id} className="flex items-center gap-4 px-5 py-4" data-testid={`row-licence-${lic.id}`}>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    urgent ? "bg-destructive/10 border border-destructive/20" : warn ? "bg-yellow-500/10 border border-yellow-500/20" : "bg-green-500/10 border border-green-500/20"
                  )}>
                    {urgent ? <AlertTriangle size={16} className="text-destructive" /> : <Key size={16} className={warn ? "text-yellow-400" : "text-green-400"} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2 size={13} className="text-muted-foreground" />
                      <span className="font-semibold text-sm text-foreground">{salle?.nom ?? `Salle #${lic.salleId}`}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{lic.codeGenere}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className={urgent ? "bg-destructive/10 text-destructive border-destructive/20 text-xs" : warn ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs" : "bg-green-500/10 text-green-400 border-green-500/20 text-xs"}>
                      {lic.joursRestants}j restants
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Expire le {lic.dateExpiry}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
