"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
  Box,
  Users,
  FolderKanban,
  Plus,
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  Clock, 
} from "lucide-react";


const easeOutQuart: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: easeOutQuart },
  }),
};

export default function DashboardOverviewPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    designs: 0,
    clients: 0,
    projects: 0,
    activeProjects: 0,
  });
  const [recentDesigns, setRecentDesigns] = useState<Design[]>([]);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;

      try {
        const { count: designsCount } = await supabase
          .from("designs")
          .select("*", { count: "exact", head: true })
          .eq("designer_id", user.id);

        const { count: clientsCount } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true })
          .eq("designer_id", user.id);

        const { count: projectsCount } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("designer_id", user.id);

        const { count: activeProjectsCount } = await supabase
          .from("projects")
          .select("*", { count: "exact", head: true })
          .eq("designer_id", user.id)
          .eq("status", "in_progress");

        const { data: designs } = await supabase
          .from("designs")
          .select("*")
          .eq("designer_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(4);

        const { data: projects } = await supabase
          .from("projects")
          .select("*")
          .eq("designer_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(4);

        setStats({
          designs: designsCount || 0,
          clients: clientsCount || 0,
          projects: projectsCount || 0,
          activeProjects: activeProjectsCount || 0,
        });

        setRecentDesigns(designs || []);
        setRecentProjects(projects || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#b0664c] mx-auto mb-3" />
          <p className="text-slate-400 text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return " Ayubowan";
    if (h < 18) return " Ayubowan";
    return " Ayubowan"; 
  })();

  const statCards = [
    { label: "Designs", value: stats.designs, icon: Box, href: "/dashboard/designs",  },
    { label: "Clients", value: stats.clients, icon: Users, href: "/dashboard/clients",  },
    { label: "Projects", value: stats.projects, icon: FolderKanban, href: "/dashboard/projects",  },
    { label: "Active", value: stats.activeProjects, icon: TrendingUp, href: "/dashboard/projects",  },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="font-display-cartoon text-3xl font-medium  text-slate-900 sm:text-4xl">
            {greeting}, {user?.full_name || user?.name} 
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Here&apos;s an overview of your design portfolio.
          </p>
        </div> 
        <Link
          href="/planner"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b0664c] text-white text-sm font-bold border-[3px] border-slate-900 shadow-[0_4px_0_rgba(17,24,39,0.95)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgba(17,24,39,0.95)] active:translate-y-[4px] active:shadow-[0_0_0_rgba(17,24,39,0.95)] transition-all"
        >
          <Plus className="h-4 w-4" />
          New Design
        </Link>
      </motion.div>


      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial="hidden" animate="visible" custom={i} variants={fadeUp}>
            <Link
              href={stat.href}
              className="group block p-5 rounded-[24px] border-[3px] border-slate-900 bg-white shadow-[0_4px_0_rgba(17,24,39,0.95)] hover:translate-y-[2px] hover:shadow-[0_2px_0_rgba(17,24,39,0.95)] transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3"> 
                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-[#b0664c] transition-colors" />
              </div>
              <p className="font-display-cartoon text-3xl text-slate-900">{stat.value}</p>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 mt-1">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>


      <div className="grid gap-5 lg:grid-cols-2"> 
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="cartoon-frame rounded-[24px] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Recent Designs</h2>
              <Link
                href="/dashboard/designs"
                className="text-xs font-bold text-[#b0664c] hover:underline flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentDesigns.length === 0 ? (
                <div className="text-center py-12 px-5"> 
                  <p className="text-sm text-slate-400 mb-4 font-medium">No designs yet</p>
                  <Link
                    href="/planner"
                    className="cartoon-button inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#b0664c] text-white text-xs font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Design
                  </Link>
                </div>
              ) : (
                recentDesigns.map((design) => (
                  <Link
                    key={design.id}
                    href={`/designs/${design.id}`}
                    className="group flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7e7e1]/50 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-xl border-2 border-slate-900 bg-[#f7e7e1] flex items-center justify-center flex-shrink-0">
                      <Box className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate group-hover:text-[#b0664c] transition-colors">
                        {design.title}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(design.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#b0664c] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="cartoon-frame rounded-[24px] bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b-2 border-slate-100">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-slate-700">Recent Projects</h2>
              <Link
                href="/dashboard/projects"
                className="text-xs font-bold text-[#b0664c] hover:underline flex items-center gap-1 transition-colors"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentProjects.length === 0 ? (
                <div className="text-center py-12 px-5">
                  <p className="text-sm text-slate-400 mb-4 font-medium">No projects yet</p>
                  <Link
                    href="/dashboard/projects"
                    className="cartoon-button inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#b0664c] text-white text-xs font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Project
                  </Link>
                </div>
              ) : (
                recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href="/dashboard/projects"
                    className="group flex items-center gap-4 px-5 py-3.5 hover:bg-[#f7e7e1]/50 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-xl border-2 border-slate-900 bg-[#f7e7e1] flex items-center justify-center flex-shrink-0">
                      <FolderKanban className="h-4 w-4 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-700 truncate group-hover:text-[#b0664c] transition-colors">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold border border-slate-900 ${
                            project.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : project.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-[#b0664c] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
