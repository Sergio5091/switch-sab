import { useState } from "react";
import { useApp, Salle } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Building2, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  nom: z.string().min(2, "Nom requis"),
  pays: z.string().min(2, "Pays requis"),
  ville: z.string().min(2, "Ville requise"),
  quartier: z.string().min(2, "Quartier requis"),
  telephone: z.string().min(8, "Téléphone requis"),
});
type FormValues = z.infer<typeof schema>;

export default function SuperAdminSalles() {
  const { salles, addSalle, updateSalle, deleteSalle, licences } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Salle | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nom: "", pays: "Bénin", ville: "", quartier: "", telephone: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ nom: "", pays: "Bénin", ville: "", quartier: "", telephone: "" });
    setOpen(true);
  }

  function openEdit(s: Salle) {
    setEditing(s);
    form.reset({ nom: s.nom, pays: s.pays, ville: s.ville, quartier: s.quartier, telephone: s.telephone });
    setOpen(true);
  }

  function onSubmit(values: FormValues) {
    if (editing) {
      updateSalle(editing.id, { ...values, licenceExpiry: editing.licenceExpiry, adminId: editing.adminId });
      toast({ title: "Salle mise à jour" });
    } else {
      addSalle({ ...values, licenceExpiry: "", adminId: 0 });
      toast({ title: "Salle créée" });
    }
    setOpen(false);
  }

  function confirmDelete() {
    if (deleteId) { deleteSalle(deleteId); toast({ title: "Salle supprimée" }); }
    setDeleteId(null);
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Salles</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{salles.length} salle(s) enregistrée(s)</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5" data-testid="button-add-salle">
            <Plus size={16} /> Nouvelle salle
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {salles.map(salle => {
              const lic = licences.find(l => l.salleId === salle.id);
              return (
                <div key={salle.id} className="flex items-center gap-4 px-5 py-4" data-testid={`row-salle-${salle.id}`}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{salle.nom}</div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={10} /> {salle.quartier}, {salle.ville}, {salle.pays}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={10} /> {salle.telephone}
                      </span>
                    </div>
                  </div>
                  {lic && (
                    <Badge className={lic.joursRestants <= 7 ? "bg-destructive/10 text-destructive border-destructive/20 text-xs" : lic.joursRestants <= 30 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs" : "bg-green-500/10 text-green-400 border-green-500/20 text-xs"}>
                      {lic.joursRestants}j restants
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(salle)} data-testid={`button-edit-salle-${salle.id}`}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(salle.id)} data-testid={`button-delete-salle-${salle.id}`}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier la salle" : "Nouvelle salle"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                {["nom", "pays", "ville", "quartier", "telephone"].map(name => (
                  <FormField key={name} control={form.control} name={name as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{name === "telephone" ? "Téléphone" : name.charAt(0).toUpperCase() + name.slice(1)}</FormLabel>
                        <FormControl><Input {...field} data-testid={`input-${name}`} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <DialogFooter>
                  <Button type="submit" data-testid="button-submit-salle">{editing ? "Mettre à jour" : "Créer"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Supprimer la salle ?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Cette action est irréversible.</p>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button variant="destructive" onClick={confirmDelete} data-testid="button-confirm-delete">Supprimer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
