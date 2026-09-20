"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { 
  Building, 
  Lock, 
  Mail, 
  User, 
  Shield, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const { user, login, signup } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/admin";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "accountant" | "associate">("accountant");
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, redirectUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === "login") {
        const res = await login(email, password);
        if (res.success) {
          router.push(redirectUrl);
          router.refresh();
        } else {
          setError(res.error || "Invalid credentials.");
        }
      } else {
        const res = await signup({ name, email, password, role });
        if (res.success) {
          setSuccessMsg("Account created! Redirecting to workspace...");
          setTimeout(() => {
            router.push(redirectUrl);
            router.refresh();
          }, 800);
        } else {
          setError(res.error || "Registration failed.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoRole: string) => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await login(demoEmail, "password123");
      if (res.success) {
        router.push(demoRole === "admin" ? "/admin" : "/staff");
        router.refresh();
      } else {
        setError(res.error || "Quick login failed.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-4">
      {/* 2-Column Framed Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column (5 Cols): Firm Overview & Quick Demo Shortcuts */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-md border border-slate-800">
          <div className="space-y-6">
            {/* Firm Brand Header */}
            <div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg mb-4"
                style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
              >
                <Building className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                {theme.firm_name}
              </h2>
              <p className="text-xs text-blue-200/80 mt-1">
                Admin Automation & Client Intake Management System
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero-data-entry client onboarding with dynamic field validation.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>OpenAI GPT-4o multimodal OCR with confidence thresholding.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Gated Cal.com scheduling strictly unlocked on 100% compliance.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Automated staff briefings generated before discovery calls.</span>
              </div>
            </div>

            {/* 1-Click Quick Demo Login Shortcuts */}
            <div className="pt-4 border-t border-white/10 space-y-2.5">
              <div className="font-bold text-xs text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Instant Demo Credentials:</span>
              </div>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("sarah.jenkins@apex-accountants.co.uk", "admin")}
                  disabled={submitting}
                  className="w-full p-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-left flex items-center justify-between transition group disabled:opacity-50"
                >
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-blue-200 transition">
                      Admin Portal &bull; Sarah Jenkins, FCA
                    </div>
                    <div className="text-[11px] text-slate-400">Managing Partner (Full Config Rights)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("marcus.vance@apex-accountants.co.uk", "accountant")}
                  disabled={submitting}
                  className="w-full p-3 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl text-left flex items-center justify-between transition group disabled:opacity-50"
                >
                  <div>
                    <div className="font-bold text-xs text-white group-hover:text-blue-200 transition">
                      Staff CRM &bull; Marcus Vance
                    </div>
                    <div className="text-[11px] text-slate-400">Case Officer (Client Pipeline Review)</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </div>

          {/* Client Intake Redirection */}
          <div className="pt-6 mt-6 border-t border-white/10 text-center text-xs text-slate-400">
            <span>Are you a prospective client? </span>
            <Link href="/intake" className="text-blue-400 hover:text-blue-300 font-semibold underline ml-1">
              Open Client Intake Form &rarr;
            </Link>
          </div>
        </div>

        {/* Right Column (7 Cols): The Framed Authentication Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            {/* Header Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {mode === "login" ? "Staff & Admin Authentication" : "Register New Staff Member"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {mode === "login" ? "Enter your credentials to access the workspace." : "Create an authenticated profile for your firm role."}
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-lg text-xs font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md transition ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setError(null);
                  }}
                  className={`px-3 py-1.5 rounded-md transition ${
                    mode === "signup"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Feedback Banners */}
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Main Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="e.g. Eleanor Vance"
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                      Staff Role *
                    </label>
                    <div className="relative">
                      <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                      >
                        <option value="accountant">Staff Accountant / Case Officer</option>
                        <option value="admin">Managing Partner / Administrator</option>
                        <option value="associate">Junior Associate / Intake Clerk</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@firm.com"
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {mode === "login" ? "Use password123 or any 4+ character password for demo access." : "Minimum 4 characters required."}
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-lg font-bold text-white text-sm shadow flex items-center justify-center gap-2 transition hover:opacity-95 disabled:opacity-50"
                style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{mode === "login" ? "Sign In to Workspace" : "Complete Registration"}</span>
              </button>
            </form>
          </div>

          {/* Footer note */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center text-xs text-slate-400">
            <span>Enterprise Session Guard active &bull; Statutory disclaimer enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center space-y-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading authentication portal...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

