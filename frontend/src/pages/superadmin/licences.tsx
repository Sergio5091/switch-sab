import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, CheckCircle2, AlertTriangle, Copy, Building2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { licenceService } from "@/services/apiService";


export default function SuperAdminLicences() {
  const { salles, licences, genererLicence } = useApp();
  const { toast } = useToast();
  const [selectedSalle, setSelectedSalle] = useState("");
  const [validDays, setValidDays] = useState("30");
  const [generatedLicenceId, setGeneratedLicenceId] = useState("");

  async function handleGenerate() {
    if (!selectedSalle || !validDays.trim()) {
      toast({ title: "Remplir tous les champs", variant: "destructive" });
      return;
    }
    const licDays = Number(validDays);
    if (Number.isNaN(licDays) || licDays <= 0) {
      toast({ title: "Durée invalide", variant: "destructive" });
      return;
    }
    setGeneratedLicenceId("");
    try {
      const lic = await genererLicence(Number(selectedSalle), licDays);
      setGeneratedLicenceId(lic.licenceId);
      toast({ title: "Licence générée", description: `Salle sélectionnée #${selectedSalle}` });
    } catch {
      toast({ title: "Échec de génération", variant: "destructive" });
    }
  }

  function copyCode() {
    if (!generatedLicenceId) return;
    navigator.clipboard.writeText(generatedLicenceId);
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
                  {salles.map((salle) => (
                    <SelectItem key={salle.id} value={String(salle.id)}>
                      {salle.machineId} — {salle.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Validité (jours)</Label>
              <Input
                value={validDays}
                onChange={(e) => setValidDays(e.target.value)}
                placeholder="30"
                data-testid="input-valid-days"
              />
            </div>
          </div>

          <Button onClick={handleGenerate} className="gap-1.5" data-testid="button-generate-licence">
            <Key size={15} /> Générer la licence
          </Button>

          {generatedLicenceId && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <p className="text-xs text-muted-foreground">Licence générée — à transmettre à l'admin :</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm font-mono text-primary" data-testid="text-generated-licence">
                  {generatedLicenceId}
                </code>
                <Button variant="outline" size="sm" onClick={copyCode} data-testid="button-copy-licence">
                  <Copy size={14} />
                </Button>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5" data-testid="button-activate-licence">
                <CheckCircle2 size={14} /> Licence activée
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
              const urgent = lic.daysRemaining <= 7;
              const warn = lic.daysRemaining <= 30 && !urgent;
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
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{lic.licenceId}</div>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-2">
                    <Badge className={urgent ? "bg-destructive/10 text-destructive border-destructive/20 text-xs" : warn ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs" : "bg-green-500/10 text-green-400 border-green-500/20 text-xs"}>
                      {lic.daysRemaining}j restants
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Expire le {new Date(lic.expiresAt).toLocaleDateString()}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={async () => {
                        try {
                          const data = await licenceService.export(lic.licenceId);
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const anchor = document.createElement('a');
                          anchor.href = url;
                          anchor.download = `${lic.licenceId}.json`;
                          anchor.click();
                          URL.revokeObjectURL(url);
                          toast({ title: 'Licence exportée' });
                        } catch {
                          toast({ title: 'Erreur d export', variant: 'destructive' });
                        }
                      }}
                      data-testid={`button-export-licence-${lic.id}`}
                    >
                      <Download size={14} /> Export
                    </Button>
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
