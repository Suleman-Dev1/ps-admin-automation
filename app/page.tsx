import Link from "next/link";
import { 
  Building, 
  FileText, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Lock, 
  Star, 
  Zap, 
  Calendar, 
  LogIn, 
  Briefcase, 
  TrendingUp, 
  Check, 
  Settings,
  HelpCircle,
  XCircle,
  Award,
  Layers,
  BarChart3
} from "lucide-react";
import { db } from "@/lib/db";
import { 
  HeroProductMockup, 
  InteractiveServiceEstimator, 
  FAQAccordion 
} from "@/components/HomeClientWidgets";

export default async function HomePage() {
  const theme = await db.getThemeSettings();
  const businessTypes = await db.getBusinessTypes();
  const services = await db.getServices();
  const clients = await db.getClients();

  return (
    <div className="space-y-24 py-4">
      {/* 1. Master FinTech Hero Section */}
      <section className="space-y-12">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono uppercase tracking-wider text-[11px]">
              {theme.firm_name} &bull; ICAEW &amp; ACCA Qualified Standards
            </span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08]">
            Financial Clarity &amp; Tax Strategy,{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Engineered for Ambitious Businesses.
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
            Ditch outdated spreadsheets, delayed email replies, and manual document chasing. We pair chartered accountants with intelligent digital onboarding to deliver seamless statutory compliance, proactive tax optimization, and real-time control.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              href="/intake"
              className="inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-extrabold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              <FileText className="w-4 h-4" />
              <span>Start Client Onboarding (2 Mins)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-2xl text-sm font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 transition-all duration-200 hover:text-white"
            >
              <LogIn className="w-4 h-4 text-blue-400" />
              <span>Sign In to Portal</span>
            </Link>
          </div>

          {/* Reassurance pills */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>No password required to enquire</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant AI document OCR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bank-grade 256-bit encryption</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Product Mockup */}
        <div className="max-w-5xl mx-auto">
          <HeroProductMockup />
        </div>

        {/* Live Trust Metrics Strip */}
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
          <div className="text-center sm:text-left space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">500+</div>
            <div className="text-xs text-slate-400 font-medium">UK Businesses Advised</div>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-white">£45M+</div>
            <div className="text-xs text-slate-400 font-medium">Client Revenue Managed</div>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">&lt; 2 Mins</div>
            <div className="text-xs text-slate-400 font-medium">Average Intake Turnaround</div>
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">4.9 / 5.0 ★</div>
            <div className="text-xs text-slate-400 font-medium">Verified Client Trust Score</div>
          </div>
        </div>
      </section>

      {/* 2. Core Bento-Grid Services */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Comprehensive Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailored Accounting &amp; Advisory Solutions
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From emerging startups to established corporate enterprises, we handle your statutory compliance and financial planning.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Spotlight Bento 1: Limited Company (Spans 7 cols) */}
          <div className="md:col-span-7 bg-gradient-to-br from-slate-900/90 to-[#0e1726]/90 border border-slate-800 rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition-all duration-300 shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Building className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
                  Avg. Tax Saved: +£14,200/yr
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Limited Companies &amp; Corporate Advisory
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                  Full statutory year-end financial statements, Corporation Tax (CT600) filings, Director dividend distribution planning, Companies House annual compliance, and R&amp;D tax relief review.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Statutory Accounts &amp; CT600</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Director Dividend Strategy</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Companies House Filings</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Capital Allowances &amp; R&amp;D</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/intake?service=srv_year_end&type=bt_ltd"
                className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition"
              >
                <span>Start Limited Company Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento 2: Sole Trader & Self-Assessment (Spans 5 cols) */}
          <div className="md:col-span-5 bg-gradient-to-br from-slate-900/90 to-[#0e1726]/90 border border-slate-800 rounded-3xl p-7 sm:p-8 flex flex-col justify-between space-y-6 hover:border-blue-500/40 transition-all duration-300 shadow-lg">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md">
                <Users className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">
                  Sole Trader &amp; Self-Assessment
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  HMRC Self-Assessment filings, Making Tax Digital (MTD) compliance, business expense maximization, and personal income tax scheduling.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HMRC Self-Assessment Submission</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Allowable Expense Optimization</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Payments on Account Planning</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Link
                href="/intake?service=srv_self_assessment&type=bt_sole_trader"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
              >
                <span>Select Sole Trader Onboarding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Bento 3: VAT & Cloud Bookkeeping (Spans 4 cols) */}
          <div className="md:col-span-4 bg-gradient-to-br from-slate-900/90 to-[#0e1726]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all duration-300 shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">VAT &amp; Cloud Bookkeeping</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Quarterly MTD VAT returns, Xero and QuickBooks automated reconciliations, and cash flow reporting.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800">
              <Link
                href="/intake?service=srv_vat"
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
              >
                <span>Learn More &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Bento 4: Director Payroll (Spans 4 cols) */}
          <div className="md:col-span-4 bg-gradient-to-br from-slate-900/90 to-[#0e1726]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all duration-300 shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Payroll &amp; Workplace Pensions</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monthly PAYE RTI submissions, automated employee payslips, pension auto-enrolment, and P60/P11D forms.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800">
              <Link
                href="/intake?service=srv_payroll"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
              >
                <span>Learn More &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Bento 5: Company Formations & Law (Spans 4 cols) */}
          <div className="md:col-span-4 bg-gradient-to-br from-slate-900/90 to-[#0e1726]/90 border border-slate-800 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 hover:border-blue-500/40 transition-all duration-300 shadow-lg">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Corporate Formations &amp; Legal</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Instant Companies House incorporations, PSC register compliance, share restructuring, and shareholder agreements.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800">
              <Link
                href="/intake?service=srv_conveyancing"
                className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
              >
                <span>Learn More &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Traditional Accounting vs. Apex Advisory Comparison Matrix */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>The Apex Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Why High-Growth Businesses Choose Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Compare the friction of traditional accounting firms with the seamless Apex digital experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
          {/* Traditional Firms */}
          <div className="rounded-3xl bg-slate-900/40 border border-red-900/30 p-7 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-300">Traditional Accounting Firms</h3>
                <p className="text-xs text-slate-500 mt-0.5">Outdated manual workflows</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center font-bold">
                ✕
              </span>
            </div>

            <div className="space-y-4 text-xs text-slate-400">
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>2 to 3 weeks waiting time just to get onboarded and set up.</span>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Physical PDF forms to print, sign by hand, scan, and email.</span>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Endless chasing emails back and forth for missing paperwork.</span>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>First strategy call wasted collecting files rather than giving tax advice.</span>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>Surprise hourly billing and unexpected administrative fees.</span>
              </div>
            </div>
          </div>

          {/* Apex Advisory */}
          <div className="rounded-3xl bg-gradient-to-b from-blue-950/40 to-indigo-950/30 border border-blue-500/40 p-7 sm:p-8 space-y-6 shadow-[0_0_30px_rgba(37,99,235,0.15)] relative">
            <div className="flex items-center justify-between pb-4 border-b border-blue-900/50">
              <div>
                <h3 className="text-base font-black text-white">{theme.firm_name} Experience</h3>
                <p className="text-xs text-blue-300 mt-0.5">Modern, chartered, paperless</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </span>
            </div>

            <div className="space-y-4 text-xs text-slate-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>&lt; 2 minutes</strong> instant dynamic intake from any smartphone or laptop.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Tokenized Magic Link:</strong> Zero passwords to remember; 100% paperless vault.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Real-time AI Verification:</strong> Automatic classification and instant missing gap detection.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Guaranteed Productive Meetings:</strong> Direct Cal.com booking unlocks once documents are 100% verified.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Fixed, Transparent Fees:</strong> Clear monthly retainers with zero hidden charges.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Plan & Fee Estimator */}
      <section className="max-w-5xl mx-auto">
        <InteractiveServiceEstimator />
      </section>

      {/* 5. 3-Step Client Journey */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Frictionless Process</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Client Onboarding Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            We’ve eliminated traditional accounting delays with our automated 3-stage process.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Step 1 */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-7 space-y-4 hover:border-blue-500/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 font-black text-sm flex items-center justify-center">
              01
            </div>
            <h3 className="text-base font-bold text-white">Tell Us What You Need</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete our fast 2-minute dynamic questionnaire. Select your business structure (Ltd, Sole Trader, Corporate) and required services. Zero accounting jargon.
            </p>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-blue-400 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Takes less than 2 minutes</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-7 space-y-4 hover:border-blue-500/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 font-black text-sm flex items-center justify-center">
              02
            </div>
            <h3 className="text-base font-bold text-white">Upload Verification Files</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Receive your private tokenized magic link. Snap photos or drag-and-drop your IDs and bank statements. Our smart OCR engine verifies them on the spot.
            </p>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-purple-400 font-semibold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted tokenized vault</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-7 space-y-4 hover:border-blue-500/40 transition">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black text-sm flex items-center justify-center">
              03
            </div>
            <h3 className="text-base font-bold text-white">Meet Your Chartered Advisor</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              As soon as your checklist hits 100%, our live calendar unlocks automatically. Choose your slot for a 1-on-1 discovery and tax strategy consultation.
            </p>
            <div className="pt-3 border-t border-slate-800/80 text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Instant calendar confirmation</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Verified Client Reviews & Social Proof */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Verified Client Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Loved by UK Business Leaders
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Review 1 */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                &ldquo;Switching to {theme.firm_name} was the best operational decision we made this year. We completed the intake over lunch, uploaded our documents on mobile, and had our strategy call scheduled for the next morning. Absolutely brilliant.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <div className="font-bold text-xs text-white">David Chen</div>
              <div className="text-[11px] text-slate-400">Managing Director, CloudScale Labs Ltd</div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                &ldquo;As a sole trader moving to a limited company, I was dreading the paperwork. The onboarding checklist told me exactly what was needed and verified each file immediately. Zero headache.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <div className="font-bold text-xs text-white">Sophie Walker</div>
              <div className="text-[11px] text-slate-400">Founder, Walker Design Studio</div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed">
                &ldquo;The fastest onboarding I’ve ever seen. No chasing emails back and forth. The system flagged one missing page from my bank statements right away so we sorted it before our call. Our discovery session was 100% focused on tax strategy.&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800">
              <div className="font-bold text-xs text-white">Marcus Vance</div>
              <div className="text-[11px] text-slate-400">Director, Northstar Logistics Group</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Got Questions? We Have Answers.
          </h2>
        </div>

        <FAQAccordion />
      </section>

      {/* 8. Bottom Master Call-to-Action Card */}
      <section className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/30 p-8 sm:p-14 text-center space-y-6 shadow-[0_0_50px_rgba(37,99,235,0.25)]">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Ready to Modernize Your Accounting &amp; Compliance?
          </h2>
          <p className="text-xs sm:text-base text-blue-200/90 leading-relaxed font-normal">
            Join 500+ ambitious UK businesses who trust {theme.firm_name}. Complete your onboarding in under 2 minutes. No password required.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/intake"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-xs font-black text-slate-950 bg-white hover:bg-slate-100 shadow-xl transition-all duration-200 hover:scale-105"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Start Your Client Onboarding (2 Mins)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
          >
            <LogIn className="w-4 h-4 text-blue-300" />
            <span>Sign In to Portal</span>
          </Link>
        </div>
      </section>

      {/* 9. Staff & Reviewer Utility Ribbon (Discreet) */}
      <section className="max-w-5xl mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <Settings className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Firm Staff &amp; Reviewers:</strong> Access the live case CRM pipeline or manage vertical forms and themes.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/staff"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition text-xs shadow-xs"
          >
            Staff CRM
          </Link>
          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold transition text-xs shadow-xs"
          >
            Admin Panel
          </Link>
        </div>
      </section>

      {/* 10. Statutory Non-Advice Disclaimer */}
      <div className="text-center text-[11px] text-slate-500 max-w-3xl mx-auto py-2">
        <p>
          Statutory Compliance Notice: {theme.firm_name} administrative onboarding and document automation portal. Regulated professional advice is provided exclusively by certified practitioners following formal engagement and verified documentation.
        </p>
      </div>
    </div>
  );
}
