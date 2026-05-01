"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { LayoutDashboard, CreditCard, LogOut, Sparkles, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetch("/api/subscription")
      .then(res => res.json())
      .then(data => setIsPro(data.plan === "PRO"))
      .catch(() => {});
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans bg-[#09090b] text-[#fafafa]">
      {/* ─── MOBILE HEADER ─── */}
      <div className="md:hidden flex items-center justify-between h-[64px] px-6 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black tracking-tight">ResuAI</span>
            {isPro && (
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                PRO
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ─── SIDEBAR / MOBILE MENU ─── */}
      <aside
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } md:flex flex-col w-full md:w-[280px] fixed md:sticky top-[64px] md:top-0 h-[calc(100vh-64px)] md:h-screen bg-[#09090b] border-r-0 md:border-r border-white/10 z-20 overflow-y-auto`}
      >
        {/* Logo (Desktop Only) */}
        <div className="hidden md:flex p-8 pb-6 items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight">ResuAI</span>
            {isPro && (
              <span className="w-fit mt-0.5 px-1.5 py-0.5 rounded-md bg-indigo-500/20 border border-indigo-500/30 text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                PRO Member
              </span>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-6 md:p-3 md:px-4 flex flex-col gap-1.5">
          <NavLink href="/analysis-lab" icon={<LayoutDashboard size={20} />} onClick={() => setMobileMenuOpen(false)}>
            Analysis Lab
          </NavLink>
          <NavLink href="/analysis-lab/billing" icon={<CreditCard size={20} />} onClick={() => setMobileMenuOpen(false)}>
            Billing & Plans
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div className="p-6 md:p-4 border-t border-white/10 mt-auto">
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = "/";
            }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-zinc-400 font-bold text-sm transition-all hover:bg-red-500/10 hover:text-red-400 active:scale-95"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 p-4 md:p-12 min-h-screen relative overflow-hidden">
        {/* Glow effect matching landing page */}
        <div className="absolute -top-[150px] left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(99,102,241,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
        
        <div className="animate-fade-in max-w-[1100px] mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}

/* Sidebar nav-link sub-component */
function NavLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-400 decoration-transparent transition-colors hover:bg-white/5 hover:text-zinc-50"
    >
      <span className="text-inherit opacity-80">{icon}</span>
      {children}
    </Link>
  );
}