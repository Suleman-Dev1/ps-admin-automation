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
      <body className="min-h-screen flex flex-col lg:flex-row bg-slate-100/75 text-slate-900 antialiased selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
                {/* Main Application Frame Container */}
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm p-5 sm:p-8 min-h-[calc(100vh-140px)]">
                  {children}
                </div>
              </main>
              <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
                <p>
                  &copy; {new Date().getFullYear()} {initialTheme.firm_name} — Professional Services Admin Automation Platform
                </p>
                <p className="mt-1 text-slate-400">
                  Administrative Automation Only — Regulated Professional Advice Strictly Excluded
                </p>
              </footer>
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
