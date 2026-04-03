"use client";

import { useRouter, usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { LayoutDashboard, BookOpen, Globe, Settings, LogOut, Menu, X, type LucideIcon } from "lucide-react";

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
  const [mobileOpen, setMobileOpen] = useState(false);

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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || role === "admin"
  );

  const sidebarContent = (
    <>
      <div className="px-5 py-6 border-b border-malamaya-border/20 flex items-center justify-between">
        <div>
          <a href="/" className="block hover:opacity-80 transition-opacity">
            <img src="/logo-light.svg" alt="Maiba Studio" className="h-7 w-auto" />
          </a>
          <p className="text-[10px] tracking-[0.2em] uppercase text-malamaya mt-2">
            Studio Admin
          </p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-malamaya hover:text-foreground p-1"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" strokeWidth={1.5} />
        </button>
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
    </>
  );

  return (
    <div className="min-h-screen bg-midnight">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-malamaya-border/20">
        <a href="/" className="hover:opacity-80 transition-opacity">
          <img src="/logo-light.svg" alt="Maiba Studio" className="h-6 w-auto" />
        </a>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-malamaya hover:text-foreground p-1"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-midnight border-r border-malamaya-border/30 flex flex-col z-10">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-56 border-r border-malamaya-border/30 flex-col flex-shrink-0 sticky top-0 h-screen">
          {sidebarContent}
        </aside>

        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
