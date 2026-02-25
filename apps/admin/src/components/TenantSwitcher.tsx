"use client";

import { useTenant } from "@/lib/tenant";
import { useRouter } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function TenantSwitcher() {
  const { currentTenant, tenants, switchTenant, isPlatformAdmin } = useTenant();

  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!currentTenant) {
    // Si no hay tenant actual, sólo permitir crear nuevo si es super admin
    if (!isPlatformAdmin) {
      return (
        <div className="px-4 py-3 text-sm text-gray-600">
          No tienes negocios asignados.
        </div>
      );
    }
    return (
      <button
        onClick={() => router.push("/admin/onboarding")}
        className="flex items-center w-full px-4 py-3 text-sm font-medium text-blue-600 bg-white border border-dashed border-blue-300 rounded-md hover:bg-blue-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        Crear primer negocio
      </button>
    );
  }

  // Si no eres super admin, muestra sólo el nombre del tenant actual sin dropdown
  if (!isPlatformAdmin) {
    return (
      <div className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
        {currentTenant.name}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="flex-1 text-left truncate">{currentTenant.name}</div>
        <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-10 mt-1 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {(tenants.length > 1 ? tenants : [currentTenant]).map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => {
                  switchTenant(tenant.id);
                  setIsOpen(false);
                }}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  tenant.id === currentTenant.id
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tenant.name}
              </button>
            ))}
            {isPlatformAdmin && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    router.push("/admin/onboarding");
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Negocio
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
