"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  CheckCircle2, 
  Clock, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  ShieldCheck, 
  Building, 
  FileText, 
  Check, 
  AlertCircle,
  Eye,
  FileCheck2,
  Zap,
  TrendingUp,
  DollarSign
} from "lucide-react";

export function HeroProductMockup() {
  const [activeTab, setActiveTab] = useState<"docs" | "summary" | "booking">("docs");

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 to-[#0c121e] border border-slate-700/70 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden">
      {/* Window Title Bar */}
      <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 pl-2 hidden sm:inline">
            https://portal.apex-advisory.co.uk/onboarding/client-demo
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === "docs" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            1. Document Vault
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === "summary" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            2. AI Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("booking")}
            className={`px-2.5 py-1 rounded-md transition ${
              activeTab === "booking" 
                ? "bg-blue-600 text-white shadow-xs" 
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            3. Live Booking
          </button>
        </div>
      </div>

      {/* Mockup Canvas Body */}
      <div className="p-5 sm:p-7 space-y-5">
        {/* Client Header in Mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              CS
            </div>
            <div>
              <div className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>CloudScale Technologies Ltd</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  Ltd (Active)
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Service: Statutory Year-End Accounts &bull; Turnover: £500k - £1m
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-mono">Verification Status</div>
              <div className="text-xs font-bold text-emerald-400">3 of 3 Verified (100%)</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
          </div>
        </div>

        {/* Tab 1: Document Vault View */}
        {activeTab === "docs" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span>Required Verification Documents (Tokenized Upload)</span>
              <span className="text-emerald-400 font-mono font-semibold">Ready for Review</span>
            </div>

            <div className="space-y-2">
              {/* Doc 1 */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-200 truncate">Director Passport / Photo ID</div>
                    <div className="text-[11px] text-slate-400 font-mono">david_chen_passport.pdf &bull; 1.4 MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                    99.4% Match
                  </span>
                  <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">Approved</span>
                </div>
              </div>

              {/* Doc 2 */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-200 truncate">12-Month Commercial Bank Statements</div>
                    <div className="text-[11px] text-slate-400 font-mono">barclays_statements_2025.pdf &bull; 3.8 MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                    98.8% Match
                  </span>
                  <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">Approved</span>
                </div>
              </div>

              {/* Doc 3 */}
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-200 truncate">Previous Year Statutory Accounts</div>
                    <div className="text-[11px] text-slate-400 font-mono">cloudscale_accounts_2024.pdf &bull; 2.1 MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold">
                    99.1% Match
                  </span>
                  <span className="text-[11px] text-slate-300 font-semibold hidden sm:inline">Approved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Pre-Meeting Briefing */}
        {activeTab === "summary" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>OpenAI Multimodal Pre-Meeting Extraction</span>
              </span>
              <span className="text-slate-500 font-mono text-[11px]">Prepared for Assigned Senior Accountant</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Total Revenue Extracted</div>
                  <div className="text-sm font-extrabold text-white mt-0.5">£742,850</div>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-400">Corporation Tax Est.</div>
                  <div className="text-sm font-extrabold text-emerald-400 mt-0.5">£28,400</div>
                </div>
                <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-400">Identified Reliefs</div>
                  <div className="text-sm font-extrabold text-amber-400 mt-0.5">R&amp;D Capital Allowances</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/50 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-slate-200">Meeting Strategy Highlights:</div>
                <p className="text-slate-400">
                  Client has £45k in qualifying software development expenditure. Recommend full R&amp;D tax relief schedule to offset corporate tax liability.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Cal.com Meeting Booking */}
        {activeTab === "booking" && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
              <span>Direct Calendar Integration (Cal.com)</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Gated Lock Lifted
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span>30-Minute Discovery &amp; Tax Strategy Call</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  With <strong>Sarah Jenkins, FCA (Managing Partner)</strong> &bull; Video call via Google Meet
                </p>
              </div>

              <button
                type="button"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shrink-0 flex items-center gap-1.5 hover:opacity-90"
              >
                <span>Select 10:00 AM Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mockup Footer Bar with Floating Badges */}
      <div className="px-5 py-3 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Lock className="w-3 h-3" /> 256-Bit Encrypted Vault
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 text-blue-400 font-semibold">
            <Zap className="w-3 h-3" /> Real-Time OCR Engine
          </span>
        </div>
        <div className="font-mono text-slate-500">
          Client Token: #APX-7749-SEC
        </div>
      </div>
    </div>
  );
}

export function InteractiveServiceEstimator() {
  const [selectedPlan, setSelectedPlan] = useState<"ltd" | "sole" | "corporate">("ltd");

  const plans = {
    ltd: {
      title: "Limited Company (Ltd)",
      turnover: "£100k - £1M Annual Turnover",
      time: "1 min 45 sec",
      docs: ["Photo ID / Passport", "12-Month Bank Statement", "Prior Year Accounts"],
      deliverables: [
        "Full Statutory Annual Accounts",
        "Corporation Tax Return (CT600)",
        "Director Dividend Planning",
        "Companies House Confirmation Statement",
        "Dedicated Chartered Accountant"
      ],
      link: "/intake?service=srv_year_end&type=bt_ltd",
      tag: "Most Popular",
    },
    sole: {
      title: "Sole Trader & Freelancer",
      turnover: "Self-Employed / Contractors",
      time: "1 min 15 sec",
      docs: ["Photo ID / Passport", "Invoices / Business Bank Summary"],
      deliverables: [
        "HMRC Self-Assessment Tax Return",
        "Allowable Business Expense Review",
        "Making Tax Digital (MTD) Compliance",
        "Payment on Account Projections",
        "Direct HMRC Liaison"
      ],
      link: "/intake?service=srv_self_assessment&type=bt_sole_trader",
      tag: "Frictionless",
    },
    corporate: {
      title: "Growing Corporate & Partnerships",
      turnover: "£1M+ Turnover / Multi-Director",
      time: "2 mins 30 sec",
      docs: ["Photo ID", "Bank Statements", "Prior Accounts", "VAT Certificate", "Payroll Summary"],
      deliverables: [
        "Consolidated Management Accounts",
        "Quarterly MTD VAT Returns",
        "PAYE Payroll & Workplace Pensions",
        "R&D Tax Relief Claims",
        "Quarterly Executive Board Briefings"
      ],
      link: "/intake?service=srv_year_end&type=bt_ltd",
      tag: "Comprehensive",
    }
  };

  const current = plans[selectedPlan];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-10 space-y-8 backdrop-blur-md">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span>Interactive Onboarding Estimator</span>
        </div>
        <h3 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
          Find Your Custom Onboarding Plan
        </h3>
        <p className="text-xs sm:text-sm text-slate-400">
          Select your business structure to preview your required documents, turnaround, and deliverables.
        </p>
      </div>

      {/* Plan Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedPlan("ltd")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            selectedPlan === "ltd"
              ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              : "bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/60"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Limited Company (Ltd)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-200">Popular</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan("sole")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            selectedPlan === "sole"
              ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              : "bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/60"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Sole Trader &amp; Contractor</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan("corporate")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            selectedPlan === "corporate"
              ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              : "bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/60"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Corporate &amp; Scale-up</span>
        </button>
      </div>

      {/* Selected Plan Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
        {/* Left Column (5 Cols): Intake & Document Requirements */}
        <div className="lg:col-span-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                {current.turnover}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                {current.tag}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-white">{current.title}</h4>
              <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>Estimated intake time: {current.time}</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="text-xs font-bold text-slate-300">Required Documents ({current.docs.length}):</div>
              <ul className="space-y-1.5">
                {current.docs.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <Link
              href={current.link}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Start Onboarding for {current.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column (7 Cols): Included Deliverables */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Full Statutory Deliverables
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.deliverables.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-200 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-blue-200/90 leading-relaxed">
              💡 <strong>Zero Chasing Policy:</strong> Our automated gap-detection system flags any missing pages immediately, guaranteeing that your strategy consultation is 100% focused on maximizing tax efficiency.
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Fixed monthly fee &bull; No surprise billings</span>
            <span className="text-emerald-400 font-bold">100% Paperless</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Do I need to create an account or password to submit an enquiry?",
      a: "No! We believe new-client onboarding should be completely frictionless. You can submit your company enquiry in 2 minutes without creating a password. You will instantly receive an encrypted, tokenized magic link to upload your documents securely."
    },
    {
      q: "How does the automated document verification work?",
      a: "When you upload your bank statements, photo ID, or previous year accounts, our OpenAI multimodal OCR engine analyzes the document structure and classifies key figures in real time. If any page is missing, you receive immediate feedback so nothing is left to chance."
    },
    {
      q: "Can you handle switching from my existing accountant?",
      a: "Yes, seamlessly. We handle the entire professional clearance process with your previous provider, requesting historical trial balances, prior CT600 filings, and PAYE records on your behalf with zero stress to you."
    },
    {
      q: "When can I book a discovery meeting with my accountant?",
      a: "As soon as your required verification checklist reaches 100%, our direct Cal.com scheduling gateway unlocks automatically. This ensures our meeting is 100% productive with zero time wasted asking for missing paperwork."
    },
    {
      q: "Are my documents and business data protected?",
      a: "Yes. All uploads are stored in an encrypted document vault utilizing bank-grade 256-bit AES encryption with private token access controls. We adhere strictly to UK GDPR and statutory retention guidelines."
    }
  ];

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-200 hover:text-white"
            >
              <span>{faq.q}</span>
              <span className="text-slate-400 shrink-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3 animate-in fade-in duration-200">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
