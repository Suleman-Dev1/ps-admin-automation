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
    <div className="relative rounded-3xl bg-white border border-slate-200/90 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Window Title Bar */}
      <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-[11px] font-mono text-slate-500 pl-2 hidden sm:inline">
            https://portal.apex-advisory.co.uk/onboarding/client-demo
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-200 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === "docs" 
                ? "bg-white text-blue-700 shadow-2xs font-bold" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            1. Document Vault
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("summary")}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === "summary" 
                ? "bg-white text-blue-700 shadow-2xs font-bold" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            2. AI Summary
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("booking")}
            className={`px-3 py-1 rounded-lg transition ${
              activeTab === "booking" 
                ? "bg-white text-blue-700 shadow-2xs font-bold" 
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            3. Live Booking
          </button>
        </div>
      </div>

      {/* Mockup Canvas Body */}
      <div className="p-6 sm:p-8 space-y-6 bg-white">
        {/* Client Header in Mockup */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              CS
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>CloudScale Technologies Ltd</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-bold">
                  Ltd (Active)
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Service: Statutory Year-End Accounts &bull; Turnover: £500k - £1m
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase font-mono font-bold">Verification Status</div>
              <div className="text-xs font-bold text-emerald-600">3 of 3 Verified (100%)</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-xs">
              ✓
            </div>
          </div>
        </div>

        {/* Tab 1: Document Vault View */}
        {activeTab === "docs" && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span>Required Verification Documents (Tokenized Upload)</span>
              <span className="text-emerald-600 font-mono font-bold">Ready for Accountant Review</span>
            </div>

            <div className="space-y-2.5">
              {/* Doc 1 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-800 truncate">Director Passport / Photo ID</div>
                    <div className="text-[11px] text-slate-400 font-mono">david_chen_passport.pdf &bull; 1.4 MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                    99.4% Match
                  </span>
                  <span className="text-[11px] text-slate-600 font-semibold hidden sm:inline">Approved</span>
                </div>
              </div>

              {/* Doc 2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-800 truncate">12-Month Commercial Bank Statements</div>
                    <div className="text-[11px] text-slate-400 font-mono">barclays_statements_2025.pdf &bull; 3.8 MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                    98.8% Match
                  </span>
                  <span className="text-[11px] text-slate-600 font-semibold hidden sm:inline">Approved</span>
                </div>
              </div>

              {/* Doc 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-bold text-slate-800 truncate">Previous Year Statutory Accounts</div>
                    <div className="text-[11px] text-slate-400 font-mono">cloudscale_accounts_2024.pdf &bull; 2.1 MB</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono text-[10px] font-bold">
                    99.1% Match
                  </span>
                  <span className="text-[11px] text-slate-600 font-semibold hidden sm:inline">Approved</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Pre-Meeting Briefing */}
        {activeTab === "summary" && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span className="flex items-center gap-1.5 text-blue-700 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>OpenAI Multimodal Pre-Meeting Extraction</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">Prepared for Assigned Senior Accountant</span>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Total Revenue Extracted</div>
                  <div className="text-sm font-black text-slate-900 mt-0.5">£742,850</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-500">Corporation Tax Est.</div>
                  <div className="text-sm font-black text-emerald-600 mt-0.5">£28,400</div>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <div className="text-[10px] text-slate-500">Identified Reliefs</div>
                  <div className="text-sm font-black text-amber-600 mt-0.5">R&amp;D Capital Allowances</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700 space-y-1">
                <div className="font-bold text-slate-900">Meeting Strategy Highlights:</div>
                <p className="text-slate-600 leading-relaxed">
                  Client has £45k in qualifying software development expenditure. Recommend full R&amp;D tax relief schedule to offset corporate tax liability.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Cal.com Meeting Booking */}
        {activeTab === "booking" && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span>Direct Calendar Integration (Cal.com)</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Gated Lock Lifted
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="space-y-1 text-center sm:text-left">
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>30-Minute Discovery &amp; Tax Strategy Call</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  With <strong>Sarah Jenkins, FCA (Managing Partner)</strong> &bull; Video call via Google Meet
                </p>
              </div>

              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs shrink-0 flex items-center gap-1.5 transition"
              >
                <span>Select 10:00 AM Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mockup Footer Bar with Badges */}
      <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <Lock className="w-3.5 h-3.5" /> 256-Bit Encrypted Vault
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-blue-700 font-semibold">
            <Zap className="w-3.5 h-3.5" /> Real-Time OCR Engine
          </span>
        </div>
        <div className="font-mono text-slate-400">
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
    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 space-y-8 shadow-xs">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
          <Zap className="w-3.5 h-3.5 text-blue-600" />
          <span>Interactive Onboarding Estimator</span>
        </div>
        <h3 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Your Custom Onboarding Plan
        </h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Select your business structure to preview your required documents, deliverables, and dedicated team.
        </p>
      </div>

      {/* Plan Selector Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setSelectedPlan("ltd")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            selectedPlan === "ltd"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Limited Company (Ltd)</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedPlan === "ltd" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-800"}`}>
            Popular
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedPlan("sole")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            selectedPlan === "sole"
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
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
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Corporate &amp; Scale-up</span>
        </button>
      </div>

      {/* Selected Plan Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch pt-2">
        {/* Left Column (5 Cols): Intake & Document Requirements */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                {current.turnover}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                {current.tag}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900">{current.title}</h4>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-blue-700 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Paperless Dynamic Onboarding</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="text-xs font-bold text-slate-800">Required Documents ({current.docs.length}):</div>
              <ul className="space-y-1.5">
                {current.docs.map((doc, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <Link
              href={current.link}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>Start Onboarding for {current.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Right Column (7 Cols): Included Deliverables */}
        <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Full Statutory Deliverables
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.deliverables.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200/90 flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-xs text-slate-800 font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 leading-relaxed">
              💡 <strong>Zero Chasing Guarantee:</strong> Our automated gap-detection engine flags any missing items immediately, guaranteeing that your strategy consultation is 100% focused on maximizing tax efficiency.
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-200">
            <span>Fixed monthly fee &bull; No surprise billings</span>
            <span className="text-emerald-700 font-bold">100% Digital &amp; Paperless</span>
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
            className="rounded-2xl bg-white border border-slate-200 shadow-2xs overflow-hidden transition-all duration-200"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-blue-700"
            >
              <span>{faq.q}</span>
              <span className="text-slate-400 shrink-0">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                {faq.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
