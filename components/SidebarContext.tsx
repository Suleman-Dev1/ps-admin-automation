"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

interface SidebarContextType {
  isOpen: boolean;
  mobileOpen: boolean;
  toggleSidebar: () => void;
  toggleMobile: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  closeMobile: () => void;
  isWorkspaceRoute: boolean;
}

const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  mobileOpen: false,
  toggleSidebar: () => {},
  toggleMobile: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
  closeMobile: () => {},
  isWorkspaceRoute: false,
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const { user } = useAuth();

  // Determine if this is an admin, staff, or authentication route
  const isWorkspaceRoute = 
    pathname === "/login" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/staff");

  // Determine initial state:
  // - On landing page ("/") or public client routes: sidebar is hidden (false)
  // - On login/admin/staff workspace routes: sidebar is shown (true)
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("ps_sidebar_desktop_open");
      if (stored !== null && isWorkspaceRoute) {
        return stored === "true";
      }
    }
    return isWorkspaceRoute;
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Automatically adjust when switching between landing and workspace routes
  useEffect(() => {
    if (!isWorkspaceRoute) {
      // On landing page or client pages, hide sidebar by default
      setIsOpen(false);
    } else {
      // On login/admin/staff routes, check stored preference or default to open
      const stored = localStorage.getItem("ps_sidebar_desktop_open");
      if (stored !== null) {
        setIsOpen(stored === "true");
      } else {
        setIsOpen(true);
      }
    }
    setMobileOpen(false);
  }, [pathname, isWorkspaceRoute]);

  const toggleSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("ps_sidebar_desktop_open", String(next));
      }
      return next;
    });
  };

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const openSidebar = () => {
    setIsOpen(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("ps_sidebar_desktop_open", "true");
    }
  };
  const closeSidebar = () => {
    setIsOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("ps_sidebar_desktop_open", "false");
    }
  };
  const closeMobile = () => setMobileOpen(false);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        mobileOpen,
        toggleSidebar,
        toggleMobile,
        openSidebar,
        closeSidebar,
        closeMobile,
        isWorkspaceRoute,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
