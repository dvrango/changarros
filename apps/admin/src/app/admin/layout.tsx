"use client";

import { useAuth } from "@/lib/auth";
import { TenantProvider, useTenant } from "@/lib/tenant";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import TenantSwitcher from "@/components/TenantSwitcher";
import { Package, Settings, LogOut, Menu, X } from "lucide-react";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!tenantLoading && !currentTenant && !authLoading && user) {
      // User has no tenants or hasn't selected one
      // Fetching is done within TenantProvider. If tenants list is empty after fetch, redirect to onboarding.
      // But we can't easily know if list is empty here without accessing context fully.
      // Assuming TenantProvider handles initial selection. If it settles on null, it means no tenants.
      // We'll let the user manually go to onboarding if needed, or redirect:
      // A better check would be explicitly checking tenants.length in context.
    }
  }, [tenantLoading, currentTenant, authLoading, user]);

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando dashboard...
      </div>
    );
  }

  if (!user) return null; // Will redirect

  // Function to determine if link is active
  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white shadow-md flex-col fixed inset-y-0 z-30">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-gray-800 mb-4 px-1">
            Changarros Admin
          </h1>
          <TenantSwitcher />
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {currentTenant ? (
            <>
              <Link
                href="/admin/products"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive("/admin/products")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Package className="w-5 h-5 mr-3" />
                Productos
              </Link>

              <Link
                href="/admin/settings"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive("/admin/settings")
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Settings className="w-5 h-5 mr-3" />
                Configuración
              </Link>
            </>
          ) : (
            <div className="px-4 py-4 text-sm text-gray-500">
              Selecciona o crea un negocio para comenzar.
            </div>
          )}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold mr-3">
              {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName || "Usuario"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label="Abrir navegación"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-base font-semibold text-gray-800">
            Changarros Admin
          </h1>
          <div className="w-9" />
        </div>
      </header>

      {/* Mobile Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${mobileOpen ? "" : "pointer-events-none"}`}
      >
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[80%] bg-white shadow-xl transform transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
          aria-label="Navegación"
        >
          <div className="p-4 border-b flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800">Menú</h2>
              <div className="mt-2">
                <TenantSwitcher />
              </div>
            </div>
            <button
              className="p-2 rounded-md hover:bg-gray-100"
              aria-label="Cerrar menú"
              onClick={() => setMobileOpen(false)}
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {currentTenant ? (
              <>
                <Link
                  href="/admin/products"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive("/admin/products")
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Package className="w-5 h-5 mr-3" />
                  Productos
                </Link>
                <Link
                  href="/admin/settings"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive("/admin/settings")
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Configuración
                </Link>
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5 mr-3" />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <div className="px-4 py-4 text-sm text-gray-500">
                Selecciona o crea un negocio para comenzar.
              </div>
            )}
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-14 lg:pt-8">
        <div className="bg-white rounded-lg shadow min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TenantProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </TenantProvider>
  );
}
