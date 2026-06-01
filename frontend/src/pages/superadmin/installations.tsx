import { useState } from "react";
import { useApp, Installation } from "@/contexts/AppContext";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Pencil, Cpu, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const schema = z.object({
  machineId: z.string().min(2, "Machine ID requis"),
  raspberrySerial: z.string().min(2, "Serial requis"),
  salleId: z.string().min(1, "Salle requise"),
  statut: z.enum(["ACTIVE", "INACTIVE"]),
});
type FormValues = z.infer<typeof schema>;

const statusLabels: Record<string, { label: string; variant: string }> = {
  ACTIVE: { label: "Active", variant: "bg-green-500/10 text-green-400 border-green-500/20" },
  INACTIVE: { label: "Inactive", variant: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
};

export default function SuperAdminInstallations() {
  const { installations, salles, addInstallation, updateInstallation } = useApp();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Installation | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { machineId: "", raspberrySerial: "", salleId: "", statut: "INACTIVE" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ machineId: "", raspberrySerial: "", salleId: "", statut: "INACTIVE" });
    setOpen(true);
  }

  function openEdit(installation: Installation) {
    setEditing(installation);
    form.reset({
      machineId: installation.machineId,
      raspberrySerial: installation.raspberrySerial,
      salleId: String(installation.salleId),
      statut: installation.statut,
    });
    setOpen(true);
  }

  async function onSubmit(values: FormValues) {
    if (editing) {
      await updateInstallation(editing.id, {
        machineId: values.machineId,
        raspberrySerial: values.raspberrySerial,
        statut: values.statut,
      });
      toast({ title: "Installation mise à jour" });
    } else {
      await addInstallation({
        machineId: values.machineId,
        raspberrySerial: values.raspberrySerial,
        salleId: Number(values.salleId),
        statut: values.statut,
      });
      toast({ title: "Installation créée" });
    }
    setOpen(false);
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Installations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Gérer les équipements et leurs statuts</p>
          </div>
          <Button onClick={openCreate} className="gap-1.5" data-testid="button-add-installation">
            <Plus size={16} /> Nouvelle installation
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {installations.map((installation) => {
              const salle = salles.find((s) => s.id === installation.salleId);
              const status = statusLabels[installation.statut] ?? { label: installation.statut, variant: "bg-muted text-muted-foreground" };
              return (
                <div key={installation.id} className="flex items-center gap-4 px-5 py-4" data-testid={`row-installation-${installation.id}`}>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Cpu size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{installation.machineId}</div>
                    <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span>{installation.raspberrySerial}</span>
                      <span>{salle?.nom ?? `Salle #${installation.salleId}`}</span>
                    </div>
                  </div>
                  <Badge className={status.variant + " text-xs"}>{status.label}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(installation)} data-testid={`button-edit-installation-${installation.id}`}>
                    <Pencil size={14} />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Modifier l'installation" : "Nouvelle installation"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField control={form.control} name="machineId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine ID</FormLabel>
                    <FormControl><Input {...field} data-testid="input-machine-id" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="raspberrySerial" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Raspberry</FormLabel>
                    <FormControl><Input {...field} data-testid="input-serial" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="salleId" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-salle"><SelectValue placeholder="Choisir une salle" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {salles.map((salle) => (
                          <SelectItem key={salle.id} value={String(salle.id)}>{salle.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="statut" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-statut"><SelectValue placeholder="Choisir un statut" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, meta]) => (
                          <SelectItem key={value} value={value}>{meta.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <DialogFooter>
                  <Button type="submit" data-testid="button-submit-installation">{editing ? "Mettre à jour" : "Créer"}</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
