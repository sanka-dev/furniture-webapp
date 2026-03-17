"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { supabase } from "@/lib/supabase/client";
import type { Project, Client, Design } from "@/lib/supabase/client";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  FolderKanban,
  Calendar,
  DollarSign,
  Pencil,
  Trash2,
  Search,
  User,
  Box,
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

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-500",
  in_progress: "bg-blue-100 text-blue-700",
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-500 line-through",
  on_hold: "bg-slate-50 text-slate-400",
};

export default function ProjectsPage() {
  const { user } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    notes: "",
    status: "draft" as Project["status"],
    budget: "",
    start_date: "",
    end_date: "",
    client_id: "",
    design_id: "",
  });

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      const { data: projectsData } = await supabase.from("projects").select("*").eq("designer_id", user.id).order("created_at", { ascending: false });
      const { data: clientsData } = await supabase.from("clients").select("*").eq("designer_id", user.id);
      const { data: designsData } = await supabase.from("designs").select("*").eq("designer_id", user.id);
      setProjects(projectsData || []);
      setClients(clientsData || []);
      setDesigns(designsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const projectData = {
        designer_id: user.id,
        name: formData.name,
        notes: formData.notes,
        status: formData.status,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        client_id: formData.client_id || null,
        design_id: formData.design_id || null,
      };
      if (editingProject) {
        await supabase.from("projects").update(projectData).eq("id", editingProject.id);
      } else {
        await supabase.from("projects").insert(projectData);
      }
      setFormData({ name: "", notes: "", status: "draft", budget: "", start_date: "", end_date: "", client_id: "", design_id: "" });
      setEditingProject(null);
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({ name: project.name, notes: project.notes || "", status: project.status, budget: project.budget?.toString() || "", start_date: project.start_date || "", end_date: project.end_date || "", client_id: project.client_id || "", design_id: project.design_id || "" });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProjectId) return;
    try {
      await supabase.from("projects").delete().eq("id", deletingProjectId);
      setDeletingProjectId(null);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const getClientName = (id: string | null) => id ? clients.find((c) => c.id === id)?.name : null;
  const getDesignTitle = (id: string | null) => id ? designs.find((d) => d.id === id)?.title : null;

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#b0664c] mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display-cartoon text-3xl text-slate-900">Projects </h1>
          <p className="text-slate-500 text-sm mt-1">Manage your design projects</p>
        </div>
        <Dialog 
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingProject(null);
              setFormData({ name: "", notes: "", status: "draft", budget: "", start_date: "", end_date: "", client_id: "", design_id: "" });
            }
          }}
        >
          <DialogTrigger className="cartoon-button flex items-center gap-2 rounded-full bg-[#b0664c] px-5 py-2.5 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            New Project
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingProject ? "Edit Project" : "Create New Project"}</DialogTitle>
                <DialogDescription>{editingProject ? "Update project details" : "Add a new project to track"}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Description</Label>
                  <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as Project["status"] })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget</Label>
                    <Input id="budget" type="number" step="0.01" value={formData.budget} onChange={(e) => setFormData({ ...formData, budget: e.target.value })} placeholder="0.00" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input id="end_date" type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v || "" })}>
                    <SelectTrigger><SelectValue placeholder="Select a client (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {clients.length === 0 && (
                    <p className="text-xs text-slate-400"><Link href="/dashboard/clients" className="underline font-bold text-[#b0664c] hover:text-[#8e533e]">Add clients</Link> to link them to projects</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="design">Design</Label>
                  <Select value={formData.design_id} onValueChange={(v) => setFormData({ ...formData, design_id: v || "" })}>
                    <SelectTrigger><SelectValue placeholder="Select a design (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {designs.map((d) => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingProject ? "Update" : "Create"} Project</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>


      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-2xl border-[3px] border-slate-900 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-[0_3px_0_rgba(17,24,39,0.95)] font-medium"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v || "all")}>
          <SelectTrigger className="w-full sm:w-[170px] h-11 rounded-2xl border-[3px] border-slate-900 bg-white text-sm font-medium shadow-[0_3px_0_rgba(17,24,39,0.95)]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending_approval">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>


      {filteredProjects.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
          <h2 className="font-display-cartoon text-2xl text-slate-700">{searchQuery || statusFilter !== "all" ? "No projects found" : "No projects yet"}</h2>
          <p className="text-slate-400 text-sm mt-2 mb-6">{searchQuery || statusFilter !== "all" ? "Try adjusting your filters" : "Create your first project to get started"}</p>
          {!searchQuery && statusFilter === "all" && (
            <button onClick={() => setDialogOpen(true)} className="cartoon-button inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b0664c] text-white text-sm font-bold">
              <Plus className="h-4 w-4" />
              Create First Project
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project, i) => (
            <motion.div key={project.id} initial="hidden" animate="visible" custom={i} variants={fadeUp}>
              <div className="cartoon-frame rounded-[24px] bg-white p-5 h-full flex flex-col hover:translate-y-[-2px] transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-700 truncate">{project.name}</h3>
                    <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold mt-1.5 border border-slate-900 ${statusStyles[project.status] || statusStyles.draft}`}>
                      {project.status.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => handleEdit(project)} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#b0664c] hover:bg-[#f7e7e1] transition-all">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { setDeletingProjectId(project.id); setDeleteDialogOpen(true); }} className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {project.notes && <p className="text-[12px] text-slate-400 line-clamp-2 mb-3">{project.notes}</p>}
                <div className="space-y-1.5 mt-auto text-[12px]">
                  {getClientName(project.client_id || null) && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{getClientName(project.client_id || null)}</span>
                    </div>
                  )}
                  {getDesignTitle(project.design_id || null) && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Box className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{getDesignTitle(project.design_id || null)}</span>
                    </div>
                  )}
                  {project.budget && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      <span>${project.budget.toLocaleString()}</span>
                    </div>
                  )}
                  {project.start_date && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>
                        {new Date(project.start_date).toLocaleDateString()}
                        {project.end_date && ` – ${new Date(project.end_date).toLocaleDateString()}`}
                      </span>
                    </div>
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
            <DialogTitle>Delete Project?</DialogTitle>
            <DialogDescription>This will permanently delete this project. This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingProjectId(null); }}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
