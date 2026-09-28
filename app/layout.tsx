import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { SidebarProvider } from "@/components/SidebarContext";
import { AppLayoutShell } from "@/components/AppLayoutShell";
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
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-blue-600 selection:text-white font-sans">
        <AuthProvider>
          <ThemeProvider initialTheme={initialTheme}>
            <SidebarProvider>
              <AppLayoutShell>
                {children}
              </AppLayoutShell>
            </SidebarProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
