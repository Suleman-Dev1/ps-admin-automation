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
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo / Brand Icon */}
        <div
          className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white shadow-lg mb-3"
          style={{ backgroundColor: "var(--brand-primary, #1e3a8a)" }}
        >
          <Building className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-brand-textPrimary">
          {theme.firm_name}
        </h2>
        <p className="text-xs text-brand-textSecondary mt-1">
          {mode === "login" ? "Staff & Admin Authentication Portal" : "Register a New Staff Team Member"}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-brand-surface border border-brand-border rounded-brand p-8 shadow-sm space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-bold text-center">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`py-2 rounded-md transition ${
                mode === "login"
                  ? "bg-white text-brand-textPrimary shadow-sm"
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
              className={`py-2 rounded-md transition ${
                mode === "signup"
                  ? "bg-white text-brand-textPrimary shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Quick Demo Login Shortcuts */}
          {mode === "login" && (
            <div className="space-y-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs">
              <div className="font-bold text-blue-950 flex items-center gap-1.5 mb-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>1-Click Quick Demo Access:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("sarah.jenkins@apex-accountants.co.uk", "admin")}
                  disabled={submitting}
                  className="px-2.5 py-2 bg-white border border-blue-300 rounded text-blue-900 font-semibold hover:bg-blue-100/50 transition text-left flex items-center justify-between shadow-xs disabled:opacity-50"
                >
                  <div>
                    <div className="font-bold text-[11px]">Admin Portal</div>
                    <div className="text-[10px] text-slate-500">Sarah Jenkins, FCA</div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-blue-600" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin("marcus.vance@apex-accountants.co.uk", "accountant")}
                  disabled={submitting}
                  className="px-2.5 py-2 bg-white border border-blue-300 rounded text-blue-900 font-semibold hover:bg-blue-100/50 transition text-left flex items-center justify-between shadow-xs disabled:opacity-50"
                >
                  <div>
                    <div className="font-bold text-[11px]">Staff CRM</div>
                    <div className="text-[10px] text-slate-500">Marcus Vance</div>
                  </div>
                  <ArrowRight className="w-3 h-3 text-blue-600" />
                </button>
              </div>
            </div>
          )}

          {/* Feedback Banners */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Main Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div>
                  <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
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
                      className="w-full pl-9 pr-3 py-2 text-sm rounded border border-brand-border bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
                    Staff Role *
                  </label>
                  <div className="relative">
                    <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded border border-brand-border bg-white"
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
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
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
                  className="w-full pl-9 pr-3 py-2 text-sm rounded border border-brand-border bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-brand-textPrimary mb-1">
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
                  className="w-full pl-9 pr-10 py-2 text-sm rounded border border-brand-border bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
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
              className="w-full py-3 rounded-brand font-bold text-white text-sm shadow flex items-center justify-center gap-2 transition disabled:opacity-50"
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

          {/* Footer note */}
          <div className="pt-2 text-center text-[11px] text-slate-400 border-t border-slate-100">
            <span>Public client intake does not require sign-in: </span>
            <Link href="/intake" className="text-blue-600 font-semibold underline">
              Open Client Intake Form
            </Link>
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

