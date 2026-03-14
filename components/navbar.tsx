"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  PenTool,
  LogOut,
  User,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isHome = pathname === "/";
  const isDesignPage = pathname === "/designs" || pathname?.startsWith("/designs/");
  const isCartoonNav = isHome || isDesignPage;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase(); 

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <header
      className={cn(
        "fixed top-4 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2rem)]",
        isHome ? "max-w-6xl" : "max-w-4xl"
      )}
    >
      <nav
        className={cn(
          "flex items-center justify-between transition-all duration-300",
          isCartoonNav
            ? [
                "cartoon-frame rounded-[28px] px-4 py-3 md:px-5",
                scrolled
                  ? isDesignPage
                    ? "bg-[#ffeede]/94 backdrop-blur-xl"
                    : "bg-[#f7e7e1]/92 backdrop-blur-xl"
                  : isDesignPage
                    ? "bg-[#fff6ee]/94 backdrop-blur-md"
                    : "bg-white/90 backdrop-blur-md",
              ]
            : [
                "rounded-full px-4 py-2.5",
                scrolled
                  ? "bg-white/10 shadow-lg shadow-black/5 backdrop-blur-xl border border-black/5"
                  : "bg-white/60 backdrop-blur-lg border border-black/5",
              ]
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2 text-xl font-semibold tracking-tight",
            isCartoonNav && "font-display-cartoon text-slate-900"
          )}
        > 
          <span>Caza</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    isCartoonNav
                      ? "cartoon-button rounded-full px-4 text-sm font-semibold text-slate-900"
                      : "rounded-full text-sm",
                    isCartoonNav
                      ? isActive
                        ? "bg-[#b0664c] text-white hover:bg-[#b0664c]"
                        : "bg-white/70 hover:bg-white/70"
                      : isActive
                        ? "bg-black text-white hover:bg-black/90"
                        : "hover:bg-black/5"
                  )}
                >
                  <link.icon className="mr-1.5 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "h-9 w-9 p-0 inline-flex items-center justify-center transition-colors cursor-pointer",
                  isCartoonNav
                    ? "cartoon-frame rounded-2xl bg-white/80 hover:bg-white"
                    : "rounded-full hover:bg-black/5"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      isCartoonNav ? "bg-[#b0664c] text-white" : "bg-black text-white"
                    )}
                  >
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    isCartoonNav
                      ? "cartoon-button rounded-full bg-white/75 px-4 font-semibold text-slate-900 hover:bg-white"
                      : "rounded-full"
                  )}
                > 
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  className={cn(
                    isCartoonNav
                      ? "cartoon-button rounded-full bg-[#b0664c] px-4 font-semibold text-white hover:bg-[#b0664c]"
                      : "rounded-full bg-black text-white hover:bg-black/90"
                  )}
                >
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          <button
              className={cn(
                "md:hidden h-9 w-9 p-0 inline-flex items-center justify-center transition-colors",
                isCartoonNav
                  ? "cartoon-frame rounded-2xl bg-white/80 hover:bg-white"
                  : "rounded-full hover:bg-black/5"
              )}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "mt-2 p-4 shadow-lg md:hidden",
              isCartoonNav
                ? "cartoon-frame rounded-[28px] bg-[#f7e7e1]/96 backdrop-blur-xl"
                : "rounded-2xl bg-white/90 backdrop-blur-xl border border-black/5"
            )}
          >
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = isLinkActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isCartoonNav
                          ? "cartoon-button rounded-2xl px-4 font-semibold text-slate-900"
                          : "rounded-xl",
                        isCartoonNav
                          ? isActive
                            ? "bg-[#b0664c] text-white hover:bg-[#b0664c]"
                            : "bg-white hover:bg-white"
                          : isActive
                            ? "bg-[#b0664c] text-white hover:bg-[#b0664c]"
                            : "hover:bg-black/5"
                      )}
                    >
                      <link.icon className="mr-2 h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              {!isAuthenticated && (
                <>
                  <div className="my-2 h-px bg-black/10" />
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start",
                        isCartoonNav
                          ? "cartoon-button rounded-2xl bg-white px-4 font-semibold text-slate-900 hover:bg-white"
                          : "rounded-xl"
                      )}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Log in
                    </Button>
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Button
                      className={cn(
                        "w-full",
                        isCartoonNav
                          ? "cartoon-button rounded-2xl bg-[#b0664c] font-semibold text-white hover:bg-[#b0664c]"
                          : "rounded-xl bg-black text-white hover:bg-black/90"
                      )}
                    >
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
