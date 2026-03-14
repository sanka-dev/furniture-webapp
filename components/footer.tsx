"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <footer className={cn(isHome ? "bg-[#f7e7e1] px-6 pb-10" : "bg-black text-white")}>
      <div
        className={cn(
          "mx-auto max-w-6xl",
          isHome
            ? "cartoon-frame rounded-[34px] bg-white px-6 py-10 text-slate-900 sm:px-8"
            : "px-6 py-12"
        )}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link
              href="/"
              className={cn(
                "flex items-center gap-2 text-lg font-bold",
                isHome && "font-display-cartoon text-slate-900"
              )}
            >
              
              Caza
            </Link>
            <p
              className={cn(
                "mt-3 max-w-sm text-sm",
                isHome ? "text-slate-700" : "text-white/50"
              )}
            >
              Helping designers and customers visualize furniture in any room. Create 2D layouts and lively 3D previews without the guesswork.
            </p>
          </div>

          <div>
            <h3
              className={cn(
                "mb-3 text-sm font-semibold",
                isHome ? "text-slate-700" : "text-white/80"
              )}
            >
              Product
            </h3>
            <ul className={cn("space-y-2 text-sm", isHome ? "text-slate-700" : "text-white/50")}>
              <li>
                <Link href="/planner" className="transition-opacity hover:opacity-80">
                  Room Planner
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="transition-opacity hover:opacity-80">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className={cn(
                "mb-3 text-sm font-semibold",
                isHome ? "text-slate-700" : "text-white/80"
              )}
            >
              Account
            </h3>
            <ul className={cn("space-y-2 text-sm", isHome ? "text-slate-700" : "text-white/50")}>
              <li>
                <Link href="/login" className="transition-opacity hover:opacity-80">
                  Log in
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-opacity hover:opacity-80">
                  Sign up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className={cn(
            "mt-10 pt-6 text-center text-xs",
            isHome ? "border-t border-slate-900/15 text-slate-600" : "border-t border-white/10 text-white/40"
          )}
        > 
          &copy; {new Date().getFullYear()} Caza. All Right Reserved. 
        </div>
      </div>
    </footer>
  );
}
