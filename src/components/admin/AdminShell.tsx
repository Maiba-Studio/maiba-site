"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { LayoutDashboard, BookOpen, Globe, Settings, LogOut, type LucideIcon } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/entries", label: "Field Notes", icon: BookOpen },
  { href: "/admin/site", label: "Site Content", icon: Globe, adminOnly: true },
  { href: "/admin/accounts", label: "Accounts", icon: Settings, adminOnly: true },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setRole(data.role);
          setUsername(data.username || "");
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  return (
    <div className="min-h-screen bg-midnight flex">
      <aside className="w-56 border-r border-malamaya-border/30 flex flex-col flex-shrink-0">
        <div className="px-5 py-6 border-b border-malamaya-border/20">
          <a href="/" className="block hover:opacity-80 transition-opacity">
            <img src="/logo-light.svg" alt="Maiba Studio" className="h-7 w-auto" />
          </a>
          <p className="text-[10px] tracking-[0.2em] uppercase text-malamaya mt-2">
            Studio Admin
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
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
                <item.icon className="w-4 h-4" strokeWidth={1.5} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-malamaya-border/20 space-y-2">
          {username && (
            <p className="px-3 text-[10px] tracking-widest uppercase text-malamaya-border truncate">
              {username}
              {role === "moderator" && (
                <span className="ml-1 text-malamaya-border/60">· mod</span>
              )}
            </p>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 text-sm text-malamaya hover:text-maiba-red transition-colors w-full"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
