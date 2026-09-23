import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Sidebar } from "@/components/Sidebar";
import { db } from "@/lib/db";

export const metadata: Metadata = {
  title: "Professional Services Admin Automation",
  description: "End-to-end dynamic administrative onboarding and verification for professional services firms",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialTheme = await db.getThemeSettings();

  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans">
        <AuthProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] min-h-screen relative overflow-x-hidden">
              {/* Subtle ambient soft glow in light mode */}
              <div className="fixed top-0 left-1/4 w-[600px] h-[350px] bg-blue-100/50 blur-[130px] pointer-events-none rounded-full" />
              <div className="fixed top-64 right-10 w-[500px] h-[300px] bg-indigo-100/40 blur-[120px] pointer-events-none rounded-full" />

              {/* Expansive Main Content Area */}
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {children}
              </main>

              {/* High-End Enterprise Light Footer */}
              <footer className="border-t border-slate-200/90 bg-white/90 backdrop-blur-md py-8 text-center text-xs text-slate-500 relative z-10">
                <div className="max-w-7xl mx-auto px-4 space-y-2">
                  <p className="text-slate-700 font-semibold">
                    &copy; {new Date().getFullYear()} {initialTheme.firm_name} — Professional Services Admin Automation Platform
                  </p>
                  <p className="text-slate-400 text-[11px] max-w-2xl mx-auto leading-relaxed">
                    Administrative Automation Only — Regulated Professional Advice Strictly Excluded until verified engagement.
                  </p>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
