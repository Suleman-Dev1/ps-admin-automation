import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
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
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider initialTheme={initialTheme}>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="bg-brand-surface border-t border-brand-border py-6 text-center text-xs text-brand-textSecondary">
            <p>
              &copy; {new Date().getFullYear()} {initialTheme.firm_name} — Professional Services Admin Automation Platform
            </p>
            <p className="mt-1 text-slate-400">
              Administrative Automation Only — Regulated Professional Advice Strictly Excluded
            </p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
