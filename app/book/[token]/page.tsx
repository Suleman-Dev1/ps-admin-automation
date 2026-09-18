"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Calendar, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  UploadCloud, 
  ArrowRight,
  Clock,
  ShieldCheck
} from "lucide-react";
import { ClientRecord } from "@/lib/types";
import { evaluateBookingEligibility, BookingEligibilityResult } from "@/lib/cal";

export default function BookingGatePage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientRecord | null>(null);
  const [eligibility, setEligibility] = useState<BookingEligibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClient() {
      try {
        setLoading(true);
        const res = await fetch(`/api/upload/${token}`);
        if (!res.ok) {
          throw new Error("Invalid or expired booking link.");
        }
        const data = await res.json();
        if (data.client) {
          setClient(data.client);
          const elig = evaluateBookingEligibility(data.client);
          setEligibility(elig);
        } else {
          setError("Client record not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load booking eligibility.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchClient();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-slate-900">Verifying Document Compliance...</h2>
          <p className="text-sm text-slate-500 mt-1">Checking checklist prerequisites before unlocking schedule.</p>
        </div>
      </div>
    );
  }

  if (error || !client || !eligibility) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Invalid Booking Session</h2>
          <p className="text-sm text-slate-600 mt-2">{error || "Unable to retrieve client details."}</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Gated Scheduling Workflow
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Schedule Onboarding Consultation
          </h1>
          <p className="text-sm text-slate-600 mt-2">
            Client: <span className="font-semibold text-slate-800">{client.company_name || client.contact?.name}</span> ({client.service_requested})
          </p>
        </div>

        {/* Gated Status Box */}
        {!eligibility.is_eligible ? (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
            <div className="bg-amber-500 px-6 py-4 flex items-center gap-3 text-white">
              <Lock className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="text-base font-bold">Booking Access Locked</h3>
                <p className="text-xs text-amber-100">Mandatory onboarding items are incomplete.</p>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-sm text-amber-900">
                <p className="font-semibold mb-1">Why is this locked?</p>
                <p className="text-amber-800 leading-relaxed">{eligibility.reason}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  Outstanding Items Required ({eligibility.missing_items.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eligibility.missing_items.map((item, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-2.5 p-3 rounded-lg border border-red-200 bg-red-50/50 text-red-900 text-xs font-medium"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="capitalize">{item.replace(/_/g, " ")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  Upload all missing files now to instantly unlock the calendar.
                </p>
                <Link
                  href={`/upload/${token}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                  <UploadCloud className="w-4 h-4" /> Go to Upload Portal <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-emerald-200 overflow-hidden">
            <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <h3 className="text-base font-bold">Checklist Complete — Booking Unlocked!</h3>
                  <p className="text-xs text-emerald-100">All required documents have been uploaded and verified.</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-emerald-500/80 px-2.5 py-1 rounded-full border border-emerald-400">
                Verified
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                <span>Select a convenient 30-minute discovery slot with our senior administrative team.</span>
              </div>

              {/* Cal.com Embedded Frame / Action Box */}
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-6 text-center space-y-4">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Direct Cal.com Scheduling</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Click the button below to launch the live scheduling interface pre-populated with your verified profile.
                </p>
                {eligibility.booking_url && (
                  <a
                    href={eligibility.booking_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition transform hover:-translate-y-0.5"
                  >
                    <Calendar className="w-4 h-4" /> Open Cal.com Meeting Booking
                  </a>
                )}
              </div>

              <div className="pt-2 text-center">
                <p className="text-xs text-slate-400">
                  Automated notifications and pre-meeting briefs have already been sent to assigned staff.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Compliance Footer Banner */}
        <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500">
            <strong>Statutory Administrative Notice:</strong> This system strictly automates client intake document collation and administrative scheduling. No tax, accounting, or legal advice is given or implied at any stage.
          </p>
        </div>

      </div>
    </div>
  );
}
