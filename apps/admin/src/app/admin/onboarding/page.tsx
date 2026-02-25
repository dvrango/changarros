"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useTenant } from "@/lib/tenant";
import { db } from "@/lib/firebase";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const { user } = useAuth();
  const { isPlatformAdmin } = useTenant();
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Gate: sólo super admin puede crear negocios
  useEffect(() => {
    if (user && !isPlatformAdmin) {
      router.push("/admin/products");
    }
  }, [user, isPlatformAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !isPlatformAdmin) return;
    setSubmitting(true);

    try {
      const tenantRef = await addDoc(collection(db, "tenants"), {
        name: businessName,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
        whatsappPhone: phone,
        ownerId: user.uid,
        createdAt: Date.now(),
        primaryColor: "#000000",
      });

      await setDoc(doc(db, `tenants/${tenantRef.id}/memberships/${user.uid}`), {
        uid: user.uid,
        tenantId: tenantRef.id,
        role: "owner",
        joinedAt: Date.now(),
      });

      router.push("/admin");
    } catch (error) {
      console.error("Error creating tenant:", error);
      alert("Error al crear el negocio. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Nuevo Negocio
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Configura un nuevo changarro en la plataforma.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="businessName"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre del Negocio
              </label>
              <input
                id="businessName"
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value);
                  if (!slug) {
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }
                }}
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700"
              >
                URL del negocio (Slug)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  bazar-aura.com/
                </span>
                <input
                  id="slug"
                  type="text"
                  required
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                WhatsApp (con código de país)
              </label>
              <p className="text-xs text-gray-500 mb-1">
                Ej: 5215512345678
              </p>
              <input
                id="phone"
                type="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="521..."
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {submitting ? "Creando..." : "Crear Negocio"}
          </button>
        </form>
      </div>
    </div>
  );
}
