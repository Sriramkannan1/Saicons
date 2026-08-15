import { useState, useEffect, type ReactNode } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { getAdminToken } from "@/lib/admin-api";
import { useNavigate } from "@tanstack/react-router";
import { Toaster } from "sonner";

export function AdminLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (!getAdminToken()) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  // Prevent hydration mismatch or flash of content before checking token
  if (!mounted || !getAdminToken()) return null;

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden font-sans">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      <div className="flex flex-1 flex-col md:pl-64">
        <AdminHeader setMobileOpen={setMobileOpen} />
        
        <main className="flex-1 overflow-y-auto outline-none">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
