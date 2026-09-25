"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Map,
  CheckSquare,
  CalendarClock,
  TrendingUp,
  Car,
  Wrench,
  Home,
  Settings,
} from "lucide-react";
import clsx from "clsx";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Mapa", href: "/map", icon: Map },
  { name: "Tracker", href: "/tracker", icon: CheckSquare },
  { name: "Planner", href: "/planner", icon: CalendarClock },
  { name: "Economy", href: "/economy", icon: TrendingUp },
  { name: "Garage", href: "/garage", icon: Car },
  { name: "Tools", href: "/tools", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950 lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 font-bold text-white">
          G6
        </div>
        <div>
          <p className="text-sm font-semibold text-white">GTA 6 Companion</p>
          <p className="text-xs text-slate-400">Leonida Tools</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sky-500/15 text-sky-300"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800/60 hover:text-slate-200"
        >
          <Settings className="h-5 w-5" />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
