"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Box,
  Users,
  FolderKanban,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Designs", href: "/dashboard/designs", icon: Box },
  { name: "Clients", href: "/dashboard/clients", icon: Users },
  { name: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      await checkAuth();
      setLoading(false);
    };
    checkAuthentication();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7e7e1]">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-[#b0664c] mx-auto mb-4" />
          <p className="text-slate-500 text-sm font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) return null;

  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="min-h-screen bg-[#f7e7e1] text-slate-900">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-white border-r-[3px] border-slate-900 transform transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >

        <div className="h-16 flex items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="font-display-cartoon text-xl font-semibold   text-slate-900 group-hover:text-[#b0664c] transition-colors">
              Caza 
            </span>
          </Link>
          <button
            className="lg:hidden h-8 w-8 rounded-xl border-2 border-slate-900 flex items-center justify-center text-slate-600 hover:bg-[#f7e7e1] transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 px-3 mb-2">
            Menu
          </p>
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-150",
                  isActive
                    ? "bg-[#b0664c] text-white border-2 border-slate-900 shadow-[0_3px_0_rgba(17,24,39,0.95)]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-[#f7e7e1]"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className={cn("h-[18px] w-[18px]", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>


        <div className="p-3 border-t-2 border-slate-200">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 w-full px-3 py-2.5 rounded-2xl hover:bg-[#f7e7e1] transition-colors outline-none">
              <Avatar className="h-8 w-8 border-2 border-slate-900">
                <AvatarImage src={user.avatar_url} alt={user.name} />
                <AvatarFallback className="bg-[#f7e7e1] text-slate-700 text-xs font-bold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-[13px] font-bold truncate text-slate-700">
                  {user.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="top">
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/dashboard/settings'}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>


      <div className="lg:pl-[260px] min-h-screen"> 
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-white/80 backdrop-blur-xl border-b-2 border-slate-200 flex items-center px-4 gap-3">
          <button
            className="h-9 w-9 rounded-xl border-2 border-slate-900 flex items-center justify-center text-slate-600 hover:bg-[#f7e7e1] transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg border-2 border-slate-900 bg-[#b0664c] flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">FV</span>
            </div>
            <span className="font-display-cartoon text-lg text-slate-900"> Caza </span> 
          </div>
        </header>


        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
