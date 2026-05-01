"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Briefcase,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Upload,
  X,
  Target,
} from "lucide-react";

interface Feedback {
  score?: number;
  fit_level?: string;
  strengths?: string[];
  weaknesses?: string[];
  missing_keywords?: string[];
  recommendations?: string[];
  summary?: string;
}

interface ResumeReport {
  id: string;
  content: string;
  score: number;
  feedback: Feedback;
  createdAt: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [resumes, setResumes] = useState<ResumeReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) setResumes(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resumeText && !pdfFile) {
      setError("Please paste your resume or upload a PDF.");
      return;
    }
    if (!jobText) {
      setError("Please enter the job description.");
      return;
    }

    setAnalyzing(true);
    try {
      let res: Response;

      if (pdfFile) {
        // Send as FormData for PDF
        const fd = new FormData();
        fd.append("resumeFile", pdfFile);
        fd.append("jobDescription", jobText);
        if (resumeText) fd.append("resume", resumeText);
        res = await fetch("/api/analyze", { method: "POST", body: fd });
      } else {
        // Send as JSON for text paste
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: resumeText, jobDescription: jobText }),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setError(errData.error || `Request failed (${res.status})`);
        return;
      }

      const data = await res.json();
      setResumes((prev) => [data, ...prev]);
      setResumeText("");
      setJobText("");
      setPdfFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are accepted.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File must be under 5 MB.");
        return;
      }
      setPdfFile(file);
      setError("");
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreBadgeStyle = (
    score: number
  ): { bg: string; text: string; border: string } => {
    if (score >= 80)
      return {
        bg: "rgba(16,185,129,0.1)",
        text: "#10b981",
        border: "1px solid rgba(16,185,129,0.25)",
      };
    if (score >= 60)
      return {
        bg: "rgba(245,158,11,0.1)",
        text: "#f59e0b",
        border: "1px solid rgba(245,158,11,0.25)",
      };
    return {
      bg: "rgba(244,63,94,0.1)",
      text: "#f43f5e",
      border: "1px solid rgba(244,63,94,0.25)",
    };
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    height: 180,
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.02)",
    fontFamily: "inherit",
    fontSize: 14,
    lineHeight: 1.6,
    resize: "none" as const,
    outline: "none",
    color: "#fafafa",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div className="flex flex-col gap-10 pb-20">
      {/* ─── HEADER ─── */}
      <header className="animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
          Welcome back, {session?.user?.name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-zinc-400 text-base md:text-lg">
          Upload a resume (PDF) or paste text, then add a job description to get AI feedback.
        </p>
      </header>

      {/* ─── ANALYSIS FORM ─── */}
      <section className="bg-white/[0.03] rounded-3xl border border-white/10 p-6 md:p-10 shadow-xl shadow-black/20 animate-fade-in [animation-delay:100ms]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <Sparkles size={22} className="text-indigo-400" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">New Analysis</h2>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 mb-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3 animate-shake">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleAnalyze} className="flex flex-col gap-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {/* Resume Column */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2 px-1">
                <FileText size={16} className="text-zinc-500" />
                Resume (PDF or Text)
              </label>

              {/* PDF Upload Area */}
              <div
                className={`group relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                  pdfFile 
                  ? "bg-emerald-500/5 border-emerald-500/40" 
                  : "bg-white/[0.02] border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/[0.04]"
                }`}
                onClick={() => !pdfFile && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {pdfFile ? (
                  <div className="w-full flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-bold text-emerald-400 truncate max-w-[200px]">
                          {pdfFile.name}
                        </span>
                        <span className="text-xs text-emerald-500/60 font-medium">
                          {(pdfFile.size / 1024).toFixed(0)} KB
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePdf(); }}
                      className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload size={24} className="text-zinc-400 group-hover:text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-zinc-300 mb-1">Click to upload PDF</p>
                    <p className="text-xs text-zinc-500 font-medium">Max 5 MB</p>
                  </>
                )}
              </div>

              {/* OR divider */}
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-600 px-2 py-2">
                <div className="h-px flex-1 bg-white/5" />
                OR
                <div className="h-px flex-1 bg-white/5" />
              </div>

              {/* Text paste */}
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-48 bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none"
              />
            </div>

            {/* Job description column */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-bold text-zinc-300 flex items-center gap-2 px-1">
                <Briefcase size={16} className="text-zinc-500" />
                Job Description
              </label>
              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Paste the job requirements here..."
                className="w-full h-full min-h-[300px] lg:min-h-0 bg-white/[0.02] border border-white/10 rounded-2xl p-5 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/40 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={analyzing || (!resumeText && !pdfFile) || !jobText}
            className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-lg font-black tracking-tight transition-all duration-300 ${
              analyzing || (!resumeText && !pdfFile) || !jobText
                ? "bg-white/5 text-zinc-600 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/20 hover:-translate-y-1 active:translate-y-0"
            }`}
          >
            {analyzing ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Analyzing Your Fit...
              </>
            ) : (
              <>
                <Sparkles size={24} />
                Analyze Alignment
              </>
            )}
          </button>
        </form>
      </section>

      {/* ─── REPORTS ─── */}
      <section className="flex flex-col gap-6">
        <div className="flex items-end justify-between px-2">
          <div>
            <h2 className="text-2xl font-black tracking-tight">Recent Reports</h2>
            <p className="text-sm text-zinc-500 font-medium">Tracking your career growth</p>
          </div>
          <span className="text-xs font-black bg-white/5 border border-white/10 px-3 py-1 rounded-full text-zinc-400">
            {resumes.length} TOTAL
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-3xl border border-white/5">
            <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
            <p className="text-zinc-400 font-medium">Retrieving your analysis history...</p>
          </div>
        ) : resumes.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {resumes.map((report) => {
              const score = report.score;
              const scoreColor = score >= 80 ? "emerald" : score >= 60 ? "amber" : "red";
              
              return (
                <div
                  key={report.id}
                  className="group bg-white/[0.02] hover:bg-white/[0.04] rounded-3xl border border-white/10 hover:border-indigo-500/30 p-6 md:p-8 transition-all duration-300 animate-fade-in"
                >
                  <div className="flex flex-col gap-8">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={`relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center border-2 border-${scoreColor}-500/20 bg-${scoreColor}-500/5`}>
                          <span className={`text-2xl md:text-3xl font-black text-${scoreColor}-400`}>
                            {score}%
                          </span>
                          {/* Inner glow */}
                          <div className={`absolute inset-0 rounded-2xl shadow-inner shadow-${scoreColor}-500/10`} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black mb-1">AI Analysis Result</h3>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider">
                              <FileText size={12} />
                              {new Date(report.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <div className="w-1 h-1 rounded-full bg-zinc-700" />
                            <span className={`text-xs font-black text-${scoreColor}-400 uppercase tracking-wider`}>
                              {score >= 80 ? "High Match" : score >= 60 ? "Moderate Match" : "Low Match"}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {report.feedback?.score && (
                        <div className="hidden lg:flex items-center gap-2">
                           {/* Add quick metrics if needed */}
                        </div>
                      )}
                    </div>

                    {/* Summary Card */}
                    {report.feedback?.summary && (
                      <div className={`relative overflow-hidden p-5 md:p-6 rounded-2xl bg-${scoreColor}-500/[0.03] border-l-4 border-${scoreColor}-500/40`}>
                        <p className="text-zinc-300 text-sm md:text-base leading-relaxed italic">
                          "{report.feedback.summary}"
                        </p>
                      </div>
                    )}

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Strengths */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase tracking-wider">
                          <CheckCircle2 size={18} />
                          Key Strengths
                        </div>
                        <ul className="space-y-3">
                          {report.feedback?.strengths?.map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 shrink-0" />
                              {s}
                            </li>
                          )) || <li className="text-zinc-500 text-sm italic">No data</li>}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
                          <AlertCircle size={18} />
                          Areas for Improvement
                        </div>
                        <ul className="space-y-3">
                          {report.feedback?.weaknesses?.map((w, i) => (
                            <li key={i} className="flex gap-3 text-sm text-zinc-300 leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-500/40 mt-1.5 shrink-0" />
                              {w}
                            </li>
                          )) || <li className="text-zinc-500 text-sm italic">No data</li>}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8 border-t border-white/5">
                      {/* Keywords */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-indigo-400 font-black text-sm uppercase tracking-wider">
                          <Target size={18} />
                          Missing Keywords
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {report.feedback?.missing_keywords?.length ? (
                            report.feedback.missing_keywords.map((kw, i) => (
                              <span key={i} className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs font-bold text-indigo-300">
                                {kw}
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500 text-sm italic">Excellent! No major keywords missing.</span>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-purple-400 font-black text-sm uppercase tracking-wider">
                          <Sparkles size={18} />
                          Actionable Advice
                        </div>
                        <ul className="space-y-3">
                          {report.feedback?.recommendations?.map((rec, i) => (
                            <li key={i} className="group/item flex gap-3 text-sm text-zinc-300 leading-relaxed">
                              <ChevronRight size={14} className="text-purple-500/60 mt-1 group-hover/item:translate-x-0.5 transition-transform shrink-0" />
                              {rec}
                            </li>
                          )) || <li className="text-zinc-500 text-sm italic">No recommendations available</li>}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 bg-white/[0.01] rounded-[2rem] border border-dashed border-white/10 text-center px-6">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6">
              <FileText size={36} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No reports yet</h3>
            <p className="text-zinc-500 max-w-sm">
              Your analysis history will appear here. Start by analyzing your first resume against a job!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}