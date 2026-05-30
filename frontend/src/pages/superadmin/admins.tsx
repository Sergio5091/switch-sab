import { useState } from "react";
import { useApp, Utilisateur } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Trash2, Shield, Phone, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  nom: z.string().min(2, "Nom requis"),
  prenom: z.string().min(2, "Prénom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Téléphone requis"),
  salleId: z.string().min(1, "Salle requise"),
});
type FormValues = z.infer<typeof schema>;

export default function SuperAdminAdmins() {
  const { utilisateurs, addUtilisateur, updateUtilisateur, deleteUtilisateur, salles } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Utilisateur | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const admins = utilisateurs.filter(u => u.role === "ADMIN");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nom: "", prenom: "", email: "", phone: "", salleId: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ nom: "", prenom: "", email: "", phone: "", salleId: "" });
    setOpen(true);
  }

  function openEdit(u: Utilisateur) {
    setEditing(u);
    form.reset({ nom: u.nom, prenom: u.prenom, email: u.email, phone: u.phone, salleId: String(u.salleId) });
    setOpen(true);
  }

  function onSubmit(values: FormValues) {
    if (editing) {
      updateUtilisateur(editing.id, { ...values, salleId: Number(values.salleId) });
      toast({ title: "Admin mis à jour" });
    } else {
      addUtilisateur({ ...values, salleId: Number(values.salleId), role: "ADMIN", pseudo: values.email.split("@")[0], actif: true, password: "admin123" });
      toast({ title: "Admin créé", description: "Mot de passe par défaut : admin123" });
    }
    setOpen(false);
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Comptes Admin</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{admins.length} admin(s) enregistré(s)</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5" data-testid="button-add-admin">
            <Plus size={16} /> Nouvel admin
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {admins.map(admin => {
              const salle = salles.find(s => s.id === admin.salleId);
              return (
                <div key={admin.id} className="flex items-center gap-4 px-5 py-4" data-testid={`row-admin-${admin.id}`}>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield size={18} className="text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{admin.prenom} {admin.nom}</div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{admin.email}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone size={10} /> {admin.phone}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {salle && (
                      <Badge className="bg-muted text-muted-foreground border-border text-xs gap-1">
                        <Building2 size={10} /> {salle.nom}
                      </Badge>
                    )}
                    <Badge className={admin.actif ? "bg-green-500/10 text-green-400 border-green-500/20 text-xs" : "bg-muted text-muted-foreground text-xs"}>
                      {admin.actif ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(admin)} data-testid={`button-edit-admin-${admin.id}`}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(admin.id)} data-testid={`button-delete-admin-${admin.id}`}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier l'admin" : "Nouvel admin"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {["prenom", "nom"].map(name => (
                    <FormField key={name} control={form.control} name={name as keyof FormValues}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{name === "prenom" ? "Prénom" : "Nom"}</FormLabel>
                          <FormControl><Input {...field} data-testid={`input-${name}`} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                {["email", "phone"].map(name => (
                  <FormField key={name} control={form.control} name={name as keyof FormValues}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{name === "phone" ? "Téléphone" : "Email"}</FormLabel>
                        <FormControl><Input {...field} data-testid={`input-${name}`} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <FormField control={form.control} name="salleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salle</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-salle"><SelectValue placeholder="Choisir une salle" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {salles.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.nom}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" data-testid="button-submit-admin">{editing ? "Mettre à jour" : "Créer"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Supprimer cet admin ?</DialogTitle></DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button variant="destructive" onClick={() => { if (deleteId) { deleteUtilisateur(deleteId); toast({ title: "Admin supprimé" }); } setDeleteId(null); }}>Supprimer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
