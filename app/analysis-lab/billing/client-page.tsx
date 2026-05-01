"use client";

import { useEffect, useState } from "react";
import { CreditCard, Zap, CheckCircle2, Crown, Loader2, Shield } from "lucide-react";

interface SubInfo {
  plan: string;
  credits: number;
  stripeSubId: string | null;
}

export default function Billing() {
  const [sub, setSub] = useState<SubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch("/api/subscription")
      .then((r) => r.json())
      .then(setSub)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const subscribe = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe", { method: "POST" });
      const data = await res.json();
      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      setUpgrading(false);
    }
  };

  const isPro = sub?.plan === "PRO";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-zinc-400 gap-4">
        <Loader2 size={40} className="animate-spin text-indigo-500" />
        <p className="font-medium">Retrieving subscription details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* ─── HEADER ─── */}
      <header className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          Billing & Plans
        </h1>
        <p className="text-zinc-400 text-base md:text-lg">
          Manage your subscription and credits.
        </p>
      </header>

      {/* ─── ACTIVE PLAN BANNER ─── */}
      <section className={`relative overflow-hidden rounded-[2rem] p-8 md:p-10 border transition-all duration-500 animate-fade-in [animation-delay:100ms] ${
        isPro 
        ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-500/20 text-white" 
        : "bg-white/[0.03] border-white/10 text-zinc-100"
      }`}>
        {/* Decorative Background Glow */}
        {isPro && (
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -mr-32 -mt-32" />
        )}
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${
              isPro ? "bg-white/20" : "bg-white/5 border border-white/10"
            }`}>
              {isPro ? <Crown size={32} /> : <Shield size={32} className="text-zinc-500" />}
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${
                isPro ? "text-indigo-200" : "text-zinc-500"
              }`}>
                Current Plan
              </p>
              <h2 className="text-3xl font-black">{isPro ? "Pro Member" : "Free Tier"}</h2>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-1">
            {isPro ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10">
                <CheckCircle2 size={18} className="text-indigo-200" />
                <span className="text-sm font-bold">Unlimited analyses active</span>
              </div>
            ) : (
              <div className="flex flex-col md:items-end">
                <span className="text-4xl font-black text-white">{sub?.credits ?? 0}</span>
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Analyses Remaining</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── PLANS GRID ─── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl animate-fade-in [animation-delay:200ms]">
        {/* Free Plan */}
        <div className={`group relative rounded-[2.5rem] p-8 md:p-10 flex flex-col transition-all duration-300 ${
          !isPro 
          ? "bg-white/[0.04] border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/10" 
          : "bg-white/[0.02] border border-white/10 grayscale opacity-60"
        }`}>
          {!isPro && (
            <div className="absolute top-6 right-6 px-4 py-1.5 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
              Active
            </div>
          )}
          
          <div className="mb-10">
            <h3 className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-4">Starter</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">$0</span>
              <span className="text-zinc-500 font-bold">/month</span>
            </div>
          </div>

          <ul className="flex-1 flex flex-col gap-5 mb-10">
            {[
              "3 resume analyses",
              "Basic AI feedback",
              "Score matching",
              "Standard processing"
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium text-zinc-300">
                <div className="w-5 h-5 bg-emerald-500/10 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                </div>
                {item}
              </li>
            ))}
          </ul>

          <button
            disabled
            className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${
              !isPro 
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
              : "bg-white/5 text-zinc-600 border border-white/5"
            }`}
          >
            {!isPro ? "Current Plan" : "Included"}
          </button>
        </div>

        {/* Pro Plan */}
        <div className={`group relative rounded-[2.5rem] p-8 md:p-10 flex flex-col transition-all duration-500 ${
          isPro 
          ? "bg-white/[0.04] border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/10" 
          : "bg-indigo-600 border border-indigo-400 shadow-2xl shadow-indigo-500/20 hover:scale-[1.02]"
        }`}>
          {isPro ? (
            <div className="absolute top-6 right-6 px-4 py-1.5 bg-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
              Active
            </div>
          ) : (
            <div className="absolute top-6 right-6 px-4 py-1.5 bg-white text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
              <Crown size={12} />
              Recommended
            </div>
          )}

          <div className="mb-10">
            <h3 className={`text-xs font-black uppercase tracking-widest mb-4 ${
              isPro ? "text-indigo-400" : "text-indigo-200"
            }`}>Professional</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-white">$9.99</span>
              <span className={`${isPro ? "text-zinc-500" : "text-indigo-200"} font-bold`}>/month</span>
            </div>
          </div>

          <ul className="flex-1 flex flex-col gap-5 mb-10">
            {[
              "Unlimited analyses",
              "Advanced AI insights",
              "Missing keyword detection",
              "ATS optimization tips",
              "Priority processing"
            ].map((item, i) => (
              <li key={i} className={`flex items-center gap-3 text-sm font-medium ${
                isPro ? "text-zinc-300" : "text-white"
              }`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                  isPro ? "bg-indigo-500/10" : "bg-white/20"
                }`}>
                  <Zap size={12} className={isPro ? "text-indigo-400" : "text-white"} />
                </div>
                {item}
              </li>
            ))}
          </ul>

          {isPro ? (
            <button
              disabled
              className="w-full py-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl text-sm font-black uppercase tracking-widest"
            >
              Current Plan
            </button>
          ) : (
            <button
              onClick={subscribe}
              disabled={upgrading}
              className="group/btn relative w-full py-5 bg-white text-indigo-600 rounded-2xl text-base font-black tracking-tight overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-black/20"
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {upgrading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    Upgrade Now
                  </>
                )}
              </div>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
