"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "◆" },
  { href: "/admin/entries", label: "Field Notes", icon: "◇" },
  { href: "/admin/site", label: "Site Content", icon: "○" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-malamaya-border/30 flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-malamaya-border/20">
          <a href="/" className="font-display text-lg text-foreground hover:text-maiba-red transition-colors">
            Maiba
          </a>
          <p className="text-[10px] tracking-[0.2em] uppercase text-malamaya mt-1">
            Studio Admin
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors ${
                  active
                    ? "bg-maiba-red/10 text-maiba-red"
                    : "text-malamaya hover:text-foreground hover:bg-white/[0.02]"
                }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-malamaya-border/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-malamaya hover:text-maiba-red transition-colors w-full"
          >
            <span className="text-xs">✕</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
