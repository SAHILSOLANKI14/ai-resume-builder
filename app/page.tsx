"use client";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Zap,
  Shield,
  Target,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa] font-sans selection:bg-indigo-500/30">
      {/* ─── NAVBAR ─── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-[#09090b]/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              ResuAI
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">How it Works</Link>
            
            {!isLoading && (
              session ? (
                <Link
                  href="/analysis-lab"
                  className="px-5 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                >
                  Launch Analysis Lab
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/analysis-lab" })}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95"
                >
                  Get Started Free
                </button>
              )
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-zinc-400"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-[#09090b] border-b border-white/10 p-4 flex flex-col gap-4 animate-fade-in">
            {!isLoading && (
              session ? (
                <Link
                  href="/analysis-lab"
                  className="w-full py-3 rounded-xl bg-white text-black font-bold text-center text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Launch Analysis Lab
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/analysis-lab" })}
                  className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-center text-sm"
                >
                  Get Started Free
                </button>
              )
            )}
          </div>
        )}
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-radial-gradient(ellipse,rgba(99,102,241,0.15)_0%,transparent_70%) pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Left Content */}
          <div className="flex flex-col gap-8 text-center lg:text-left items-center lg:items-start animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-sm font-semibold">
              <Zap size={14} />
              AI-Powered Resume Analysis
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight">
              Optimize your <span className="text-indigo-500">Resume</span> for the perfect <span className="text-indigo-500">Job</span>.
            </h1>

            <p className="text-lg md:text-xl text-zinc-400 max-w-xl leading-relaxed">
              Stop guessing if you&#39;re a fit. Our AI analyzes your resume against any job description and gives you actionable insights to land more interviews.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              {session ? (
                <Link
                  href="/analysis-lab"
                  className="group px-8 py-4 rounded-2xl bg-white text-black text-lg font-extrabold flex items-center gap-3 shadow-2xl shadow-white/10 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95"
                >
                  Go to Analysis Lab
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: "/analysis-lab" })}
                  className="group px-8 py-4 rounded-2xl bg-indigo-600 text-white text-lg font-extrabold flex items-center gap-3 shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95"
                >
                  Land Your Dream Job
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
              <div className="flex items-center gap-2 text-sm text-zinc-500 font-medium">
                <CheckCircle2 size={18} className="text-indigo-500" />
                No credit card required
              </div>
            </div>
          </div>

          {/* Right Image/Mockup */}
          <div className="relative animate-fade-in [animation-delay:200ms]">
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-indigo-500/10 bg-zinc-900/50 p-2 md:p-4 backdrop-blur-sm">
              <div className="rounded-2xl overflow-hidden border border-white/5">
                <Image
                  src="/hero.png"
                  alt="AI Resume Analysis Dashboard"
                  width={1200}
                  height={800}
                  className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity"
                  priority
                />
              </div>
            </div>
            {/* Ambient glows around the image */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-24 px-4 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Why ResuAI?</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Advanced AI models trained on thousands of successful hires give you the competitive edge you need to stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target size={30} className="text-indigo-400" />,
                title: "Precision Matching",
                desc: "Get an exact match score between your skills and the job requirements.",
              },
              {
                icon: <Shield size={30} className="text-purple-400" />,
                title: "ATS Optimization",
                desc: "Ensure your resume passes through Applicant Tracking Systems flawlessly.",
              },
              {
                icon: <Zap size={30} className="text-amber-400" />,
                title: "Instant Feedback",
                desc: "Receive actionable recommendations to improve your resume in seconds.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group p-8 md:p-10 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                <p className="text-zinc-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-24 px-4 bg-[#09090b] relative overflow-hidden">
        {/* Subtle background element */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">How it Works</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Three simple steps to unlock your career potential with advanced AI analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-16 left-[10%] right-[10%] h-px bg-white/5 border-t border-dashed border-white/10 z-0" />

            {[
              {
                step: "01",
                title: "Upload Resume",
                desc: "Simply drop your PDF resume or paste your text into the Analysis Lab.",
              },
              {
                step: "02",
                title: "Paste Job Link",
                desc: "Add the description of the job you're targeting for an exact comparison.",
              },
              {
                step: "03",
                title: "Get AI Insights",
                desc: "Receive a detailed report with scores, missing keywords, and advice.",
              },
            ].map((s, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group z-10">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black mb-8 shadow-xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                  {s.step}
                </div>
                <h3 className="text-2xl font-bold mb-4">{s.title}</h3>
                <p className="text-zinc-400 leading-relaxed max-w-[280px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-12 px-4 border-t border-white/5 text-center bg-[#09090b]">
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <Sparkles size={20} className="text-indigo-500" />
          <span className="font-black text-xl tracking-tight">ResuAI</span>
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-8 text-sm text-zinc-500">
          <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-zinc-600 text-sm">
          © 2026 ResuAI. All rights reserved. Built for high-performers.
        </p>
      </footer>
    </div>
  );
}