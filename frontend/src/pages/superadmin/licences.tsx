import { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, CheckCircle2, AlertTriangle, Copy, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SuperAdminLicences() {
   const { salles, genererLicence } = useApp();
   const { toast } = useToast();
   const [selectedSalle, setSelectedSalle] = useState("");
   const [generatedLic, setGeneratedLic] = useState("");

   // Extraire les licences depuis les salles
   const allLicences = salles.flatMap((s: any) => s.licences || []).filter((l: any) => {
     // Un licence est valide si actif est true ou undefined (pour rétrocompatibilité)
     return l.actif !== false;
   });

   function getDaysRemaining(fin: string | Date | undefined): number {
     if (!fin) return 0;
     const expiryDate = new Date(fin);
     const now = new Date();
     if (expiryDate < now) return 0;
     return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
   }

   function formatDate(dateStr: string | Date | undefined) {
     if (!dateStr) return "N/A";
     return new Date(dateStr).toLocaleDateString("fr-FR");
   }

async function handleGenerate() {
      if (!selectedSalle) {
        toast({ title: "Choisir une salle", variant: "destructive" });
        return;
      }
      try {
        const licence = await genererLicence(Number(selectedSalle));
        setGeneratedLic(licence.code);
        toast({ title: "Licence générée", description: licence.code });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Erreur inconnue";
        toast({ title: "Erreur génération", description: errorMsg, variant: "destructive" });
      }
    }

function handleActivate() {
      // La licence est déjà activée lors de la génération
      if (!selectedSalle) return;
      toast({ title: "Licence activée", description: `Salle ID ${selectedSalle}` });
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

          <div className="grid grid-cols-1 gap-4">
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
               <div className="text-xs text-green-400 font-medium">✓ Licence activée automatiquement</div>
             </div>
           )}
        </div>

        {/* Licences list */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Licences actives</h2>
          </div>
          <div className="divide-y divide-border">
            {allLicences.map((lic: any) => {
              const salle = salles.find(s => s.id === lic.salleId);
              const daysRemaining = getDaysRemaining(lic.fin);
              const urgent = daysRemaining <= 7;
              const warn = daysRemaining <= 30 && !urgent;
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
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{lic.code}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge className={urgent ? "bg-destructive/10 text-destructive border-destructive/20 text-xs" : warn ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs" : "bg-green-500/10 text-green-400 border-green-500/20 text-xs"}>
                      {daysRemaining}j restants
                    </Badge>
                    <div className="text-[11px] text-muted-foreground mt-0.5">Expire le {formatDate(lic.fin)}</div>
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
