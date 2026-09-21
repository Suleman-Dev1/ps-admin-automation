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
  PhoneCall,
  Laptop
} from "lucide-react";
import { db } from "@/lib/db";

export default async function HomePage() {
  const theme = await db.getThemeSettings();
  const businessTypes = await db.getBusinessTypes();
  const services = await db.getServices();
  const clients = await db.getClients();

  return (
    <div className="space-y-16 py-2">
      {/* 1. Hero Section for New Prospective Customers */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-xl">
        {/* Subtle background glow */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: theme.primary_color || "#3b82f6" }}
        />

        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 text-blue-200 border border-white/15 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Modern Accounting &amp; Business Advisory</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Stress-Free Accounting &amp; Tax Compliance for{" "}
            <span 
              className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-sky-200 to-amber-200"
            >
              Growing Businesses
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Say goodbye to endless email chains, lost receipts, and delayed filings. {theme.firm_name} pairs certified accountancy specialists with modern digital onboarding so you can focus on growing your business.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/intake"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-extrabold text-white shadow-lg transition hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: theme.primary_color || "#1e3a8a" }}
            >
              <FileText className="w-4 h-4" />
              <span>Start Client Onboarding (2 Mins)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition rounded-xl"
            >
              <LogIn className="w-4 h-4 text-blue-300" />
              <span>Sign In / Register Portal</span>
            </Link>
          </div>

          {/* Quick reassurance bullets */}
          <div className="pt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>No initial login or password needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Instant AI document verification</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Direct calendar booking on completion</span>
            </div>
          </div>
        </div>

        {/* Live Trust Metrics Strip */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10">
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-white">500+</div>
            <div className="text-xs text-slate-400 font-medium">Businesses Advised</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-white">&lt; 2 Mins</div>
            <div className="text-xs text-slate-400 font-medium">Frictionless Intake</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-emerald-400">100%</div>
            <div className="text-xs text-slate-400 font-medium">Paperless &amp; Digital</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-black text-amber-400">5.0 ★</div>
            <div className="text-xs text-slate-400 font-medium">Verified Client Rating</div>
          </div>
        </div>
      </section>

      {/* 2. How It Works (Effortless 3-Step Client Journey) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>How Onboarding Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Three Simple Steps to Get Started
          </h2>
          <p className="text-sm text-slate-600">
            We’ve eliminated traditional accounting delays. You can complete your intake from any phone or computer in minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-black text-base flex items-center justify-center mb-5">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Tell Us What You Need
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete our fast, 2-minute dynamic questionnaire. Select your business structure (Limited Company, Sole Trader, Partnership) and required services. No complex accounting jargon.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-blue-700">
              <Clock className="w-3.5 h-3.5" />
              <span>Takes less than 2 minutes</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition relative">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-black text-base flex items-center justify-center mb-5">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Upload Verification Files
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive your private tokenized link. Snap a photo or drop in your documents (photo ID, bank statements, past accounts). Our smart OCR verifies them immediately with instant status feedback.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-purple-700">
              <Lock className="w-3.5 h-3.5" />
              <span>Encrypted tokenized vault</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black text-base flex items-center justify-center mb-5">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Meet Your Dedicated Advisor
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              As soon as your checklist is complete, choose your preferred slot directly on our live calendar. Because your files are already verified, our meeting focuses 100% on high-value advice and saving you tax.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] font-semibold text-emerald-700">
              <Calendar className="w-3.5 h-3.5" />
              <span>Instant calendar confirmation</span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center pt-2">
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-sm transition hover:opacity-90"
            style={{ backgroundColor: theme.primary_color || "#1e3a8a" }}
          >
            <span>Start Your Enquiry Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. Core Services Showcase */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Briefcase className="w-3.5 h-3.5 text-amber-600" />
            <span>Comprehensive Solutions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tailored Accounting &amp; Advisory Services
          </h2>
          <p className="text-sm text-slate-600">
            From sole traders to fast-growing corporate enterprises, we handle your statutory compliance and financial management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Limited Company Accounts */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: theme.primary_color || "#1e3a8a" }}
              >
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Limited Company Accounts
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full statutory year-end accounts, Corporation Tax (CT600) filings, Companies House confirmation statements, and Director dividend tax planning.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Statutory accounts &amp; CT600</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Director dividend planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Companies House compliance</span>
                </li>
              </ul>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                href="/intake?service=srv_year_end"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>Select Limited Company</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Sole Trader & Self-Assessment */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: theme.secondary_color || "#0284c7" }}
              >
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Sole Trader &amp; Self-Assessment
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                HMRC Self-Assessment tax returns, Making Tax Digital (MTD) compliance, business expense maximization, and personal income tax planning.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>HMRC Self-Assessment filing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Allowable expense deductions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Making Tax Digital ready</span>
                </li>
              </ul>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                href="/intake?service=srv_self_assessment"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>Select Sole Trader</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: VAT & Cloud Bookkeeping */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: theme.accent_color || "#f59e0b" }}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                VAT &amp; Cloud Bookkeeping
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quarterly MTD VAT return submissions, real-time Xero/QuickBooks automated bookkeeping, receipt matching, and monthly profit-and-loss reporting.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>MTD Quarterly VAT returns</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Xero &amp; QuickBooks sync</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Real-time financial visibility</span>
                </li>
              </ul>
            </div>
            <div className="pt-5 mt-4 border-t border-slate-100">
              <Link
                href="/intake?service=srv_vat"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5"
              >
                <span>Select VAT &amp; Bookkeeping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Why Clients Choose Apex (Key Advantages) */}
      <section className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-10 space-y-8">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>The {theme.firm_name} Advantage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Hundreds of UK Businesses Trust Us
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            We combined experienced accountancy standards with seamless modern software.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              ⚡
            </div>
            <h4 className="text-sm font-bold text-slate-900">Zero Paperwork</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              No printing, scanning, or posting files. Complete everything in your mobile or desktop browser.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              🔍
            </div>
            <h4 className="text-sm font-bold text-slate-900">Real-Time Clarity</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              You always know exactly what files are approved, missing, or pending review with live checklists.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              🔒
            </div>
            <h4 className="text-sm font-bold text-slate-900">Bank-Grade Security</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Private tokenized magic links and end-to-end encryption keep your financial records secure.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              👥
            </div>
            <h4 className="text-sm font-bold text-slate-900">Dedicated Advisor</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Work with a dedicated certified accountant who understands your business sector and goals.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Client Testimonials / Social Proof */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>Client Reviews</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            What Business Owners Say
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Review 1 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;Switching to {theme.firm_name} was the best decision we made for our company. We completed the intake form over lunch, uploaded our documents on mobile, and had our strategy call scheduled for the next morning. Absolutely brilliant.&rdquo;
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="font-bold text-xs text-slate-900">David Chen</div>
              <div className="text-[11px] text-slate-500">Managing Director, CloudScale Labs Ltd</div>
            </div>
          </div>

          {/* Review 2 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;As a sole trader transitioning to a limited company, I was dreading the paperwork. The onboarding checklist told me exactly what was needed and verified each file immediately. Zero headache.&rdquo;
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="font-bold text-xs text-slate-900">Sophie Walker</div>
              <div className="text-[11px] text-slate-500">Founder, Walker Design Studio</div>
            </div>
          </div>

          {/* Review 3 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;The fastest onboarding I’ve ever seen. No chasing emails back and forth. The system flagged one missing page from my bank statements right away so we sorted it before our call. Our discovery session was 100% focused on tax strategy.&rdquo;
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="font-bold text-xs text-slate-900">Marcus Vance</div>
              <div className="text-[11px] text-slate-500">Director, Northstar Logistics Group</div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. High-Converting Bottom Call to Action Card */}
      <section className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-lg border border-blue-900/50">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Ready to Modernize Your Business Accounts?
          </h2>
          <p className="text-xs sm:text-sm text-blue-200/90 leading-relaxed">
            Join hundreds of ambitious business owners who trust {theme.firm_name}. Complete your onboarding in 2 minutes or access your secure portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/intake"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-slate-950 bg-white hover:bg-slate-100 shadow-sm transition hover:scale-105"
          >
            <FileText className="w-4 h-4 text-blue-700" />
            <span>Start Your Client Onboarding</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition"
          >
            <LogIn className="w-4 h-4 text-blue-300" />
            <span>Sign In to Portal</span>
          </Link>
        </div>
      </section>

      {/* 7. Staff & Admin Quick Access Bar (Discreet for internal reviewers) */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <Settings className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong>Firm Staff &amp; Reviewers:</strong> Access the internal pipeline CRM or manage theme and vertical settings.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/staff"
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition text-xs shadow-2xs"
          >
            Staff CRM
          </Link>
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold transition text-xs shadow-2xs"
          >
            Admin Panel
          </Link>
        </div>
      </section>

      {/* 8. Mandatory Statutory Non-Advice Disclaimer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        <p>
          Statutory Compliance Notice: {theme.firm_name} administrative onboarding and document automation portal. Regulated professional advice is provided exclusively by certified practitioners following formal engagement and verified documentation.
        </p>
      </div>
    </div>
  );
}
