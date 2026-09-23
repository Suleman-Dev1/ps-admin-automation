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
      <body className="min-h-screen flex flex-col lg:flex-row bg-[#080B11] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 bg-[#080B11] min-h-screen relative overflow-x-hidden">
              {/* Subtle ambient glowing orbs in the background */}
              <div className="fixed top-0 left-1/3 w-[500px] h-[300px] bg-blue-600/10 blur-[140px] pointer-events-none rounded-full" />
              <div className="fixed top-48 right-10 w-[400px] h-[300px] bg-indigo-600/10 blur-[130px] pointer-events-none rounded-full" />

              {/* Expansive Main Content Area without cramped nested box */}
              <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
                {children}
              </main>

              {/* High-End Enterprise Dark Footer */}
              <footer className="border-t border-slate-800/80 bg-[#080B11]/90 backdrop-blur-md py-8 text-center text-xs text-slate-500 relative z-10">
                <div className="max-w-7xl mx-auto px-4 space-y-2">
                  <p className="text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} {initialTheme.firm_name} — Professional Services Admin Automation Platform
                  </p>
                  <p className="text-slate-500 text-[11px] max-w-2xl mx-auto leading-relaxed">
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
