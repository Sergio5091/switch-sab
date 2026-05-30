import { useState } from "react";
import { useApp, Salle } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  switchType: z.enum(["WIFI", "USB"]),
  switchConfig: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function SuperAdminSalles() {
   const { salles, addSalle, updateSalle, deleteSalle } = useApp();
   const { toast } = useToast();
   const [open, setOpen] = useState(false);
   const [editing, setEditing] = useState<Salle | null>(null);
   const [deleteId, setDeleteId] = useState<number | null>(null);
   const [switchType, setSwitchType] = useState<"WIFI" | "USB">("WIFI");
   const [switchConfig, setSwitchConfig] = useState("");

   function getDaysRemaining(fin: string | Date | undefined): number {
     if (!fin) return 0;
     const expiryDate = new Date(fin);
     const now = new Date();
     if (expiryDate < now) return 0;
     return Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
   }

   const form = useForm<FormValues>({
     resolver: zodResolver(schema),
     defaultValues: { nom: "", pays: "Bénin", ville: "", quartier: "", telephone: "", switchType: "WIFI", switchConfig: "" },
   });

  function openCreate() {
    setEditing(null);
    setSwitchType("WIFI");
    setSwitchConfig("");
    form.reset({ nom: "", pays: "Bénin", ville: "", quartier: "", telephone: "", switchType: "WIFI", switchConfig: "" });
    setOpen(true);
  }

  function openEdit(s: Salle) {
    setEditing(s);
    setSwitchType((s.switchType as "WIFI" | "USB") || "WIFI");
    setSwitchConfig(s.switchConfig || "");
    form.reset({ 
      nom: s.nom, 
      pays: s.pays, 
      ville: s.ville, 
      quartier: s.quartier, 
      telephone: s.telephone,
      switchType: (s.switchType as "WIFI" | "USB") || "WIFI",
      switchConfig: s.switchConfig || "",
    });
    setOpen(true);
  }

  function onSubmit(values: FormValues) {
    if (editing) {
      updateSalle(editing.id, values);
      toast({ title: "Salle mise à jour" });
    } else {
      addSalle(values);
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
               const lic = (salle as any).licences?.find((l: any) => l.actif !== false);
               const daysRemaining = lic ? getDaysRemaining(lic.fin) : 0;
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
                  {lic ? (
                    <Badge className={daysRemaining <= 7 ? "bg-destructive/10 text-destructive border-destructive/20 text-xs" : daysRemaining <= 30 ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs" : "bg-green-500/10 text-green-400 border-green-500/20 text-xs"}>
                      {daysRemaining}j restants
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground text-xs">Aucune licence</Badge>
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
                
                {/* Switch Type Selection */}
                <FormField control={form.control} name="switchType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de Switch</FormLabel>
                      <Select value={field.value} onValueChange={(value) => {
                        field.onChange(value);
                        setSwitchType(value as "WIFI" | "USB");
                      }}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WIFI">WIFI</SelectItem>
                          <SelectItem value="USB">USB</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Conditional Switch Config Input */}
                {switchType === 'WIFI' && (
                  <FormField control={form.control} name="switchConfig"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse IP</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Adresse IP (ex: 192.168.1.100)"
                            data-testid="input-switchConfig-wifi"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {switchType === 'USB' && (
                  <FormField control={form.control} name="switchConfig"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Port COM</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Port COM (ex: COM3 ou /dev/ttyUSB0)"
                            data-testid="input-switchConfig-usb"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
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
