import { useApp } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Building2, Key, Users, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function getDaysRemaining(fin: string | Date | undefined): number {
  if (!fin) return 0;
  const expiryDate = new Date(fin);
  const now = new Date();
  if (expiryDate < now) return 0;
  return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function LicenceBadge({ days }: { days: number }) {
   if (!days || days <= 7) return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">{days ?? 0}j <AlertTriangle size={10} className="inline ml-0.5" /></Badge>;
   if (days <= 30) return <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs">{days}j</Badge>;
   return <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">{days}j</Badge>;
  }

export default function SuperAdminDashboard() {
  const { salles, utilisateurs } = useApp();

  const admins = utilisateurs.filter(u => u.role === "ADMIN");

  // Extraire et calculer les licences depuis les salles
  const allLicences = salles.flatMap((s: any) => s.licences || []).filter((l: any) => l.actif !== false);
  const expiredCount = allLicences.filter((l: any) => getDaysRemaining(l.fin) <= 0).length;
  const warnCount = allLicences.filter((l: any) => {
    const days = getDaysRemaining(l.fin);
    return days > 0 && days <= 30;
  }).length;
  const okCount = allLicences.filter((l: any) => getDaysRemaining(l.fin) > 30).length;

  const formatDate = (dateStr: string | Date | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Dashboard Super Admin</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Vue globale de toutes les salles</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Salles", value: salles.length, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
            { label: "Admins", value: admins.length, icon: Users, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
            { label: "Licences OK", value: okCount, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Alertes licence", value: warnCount + expiredCount, icon: AlertTriangle, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
          ].map(stat => (
            <div key={stat.label} className={cn("rounded-xl border p-4", stat.bg)}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                <stat.icon size={16} className={stat.color} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Salles table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Salles & Licences</h2>
          </div>
          <div className="divide-y divide-border">
            {salles.map(salle => {
              const lic = (salle as any).licences?.find((l: any) => l.actif);
              const adminUser = (salle as any).users?.find((u: any) => u.role === "ADMIN");
              return (
                <div key={salle.id} className="flex items-center gap-4 px-5 py-4" data-testid={`row-salle-${salle.id}`}>
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Building2 size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-foreground text-sm">{salle.nom}</div>
                    <div className="text-xs text-muted-foreground">{salle.ville}, {salle.pays} — {adminUser?.prenom} {adminUser?.nom}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {lic ? (
                      <>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock size={11} />
                          <span>Expire {formatDate(lic.fin)}</span>
                        </div>
                        <LicenceBadge days={getDaysRemaining(lic.fin)} />
                      </>
                    ) : (
                      <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Aucune licence</Badge>
                    )}
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
