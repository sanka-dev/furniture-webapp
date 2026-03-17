"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { supabase } from "@/lib/supabase/client";
import type { Client } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Users,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function ClientsPage() {
  const { user } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  const fetchClients = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("designer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      if (editingClient) {
        const { error } = await supabase
          .from("clients")
          .update({ name: formData.name, email: formData.email, phone: formData.phone, address: formData.address, notes: formData.notes })
          .eq("id", editingClient.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clients").insert({
          designer_id: user.id, name: formData.name, email: formData.email, phone: formData.phone, address: formData.address, notes: formData.notes,
        });
        if (error) throw error;
      }
      setFormData({ name: "", email: "", phone: "", address: "", notes: "" });
      setEditingClient(null);
      setDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error saving client:", error);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({ name: client.name, email: client.email || "", phone: client.phone || "", address: client.address || "", notes: client.notes || "" });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingClientId) return;
    try {
      const { error } = await supabase.from("clients").delete().eq("id", deletingClientId);
      if (error) throw error;
      setDeletingClientId(null);
      setDeleteDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone?.includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#b0664c] mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display-cartoon text-3xl text-slate-900">Clients </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your client relationships</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setEditingClient(null); setFormData({ name: "", email: "", phone: "", address: "", notes: "" }); }
          }}
        >
          <DialogTrigger className="cartoon-button flex items-center gap-2 rounded-full bg-[#b0664c] px-5 py-2.5 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            Add Client
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
                <DialogDescription>{editingClient ? "Update client information" : "Add a new client to your portfolio"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingClient ? "Update" : "Add"} Client</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-10 pr-4 rounded-2xl border-[3px] border-slate-900 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-[0_3px_0_rgba(17,24,39,0.95)] font-medium"
        />
      </div>

      {filteredClients.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <h2 className="font-display-cartoon text-2xl text-slate-700">{searchQuery ? "No clients found" : "No clients yet"}</h2>
          <p className="text-slate-400 text-sm mt-2 mb-6">{searchQuery ? "Try adjusting your search" : "Add your first client to get started"}</p>
          {!searchQuery && (
            <button onClick={() => setDialogOpen(true)} className="cartoon-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b0664c] text-white text-sm font-bold">
              <Plus className="h-4 w-4" />
              Add First Client
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client, i) => (
            <motion.div key={client.id} initial="hidden" animate="visible" custom={i} variants={fadeUp}>
              <div className="cartoon-frame rounded-[24px] bg-white p-5 hover:translate-y-[-2px] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl border-2 border-slate-900 bg-[#f7e7e1] flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-slate-700">{client.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 truncate">{client.name}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(client)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#b0664c] hover:bg-[#f7e7e1] transition-all">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => { setDeletingClientId(client.id); setDeleteDialogOpen(true); }}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {client.email && (
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start gap-2 text-[12px] text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">{client.address}</span>
                    </div>
                  )}
                  {client.notes && (
                    <p className="text-[12px] text-slate-400 mt-2 pt-2 border-t border-slate-100 line-clamp-2">{client.notes}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Client?</DialogTitle>
            <DialogDescription>This will permanently delete this client and all associated data. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingClientId(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
