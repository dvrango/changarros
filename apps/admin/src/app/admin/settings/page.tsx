"use client";

import { useState, useEffect } from "react";
import { useTenant } from "@/lib/tenant";
import { db, storage } from "@/lib/firebase";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  setDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function SettingsPage() {
  const { currentTenant, refreshTenants, currentMembership, isPlatformAdmin } =
    useTenant();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamMessage, setTeamMessage] = useState("");
  const [team, setTeam] = useState<
    Array<{
      uid: string;
      email: string | null;
      displayName: string | null;
      role: string;
      joinedAt: number;
    }>
  >([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"staff" | "admin">("staff");

  // Local state for form
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [address, setAddress] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);

  useEffect(() => {
    if (currentTenant) {
      setName(currentTenant.name);
      setSlug(currentTenant.slug);
      setWhatsappPhone(currentTenant.whatsappPhone);
      setPrimaryColor(currentTenant.primaryColor || "#000000");
      setAddress(currentTenant.address || "");
      setMapsUrl(currentTenant.mapsUrl || "");
      setInstagram(currentTenant.socialLinks?.instagram || "");
      setFacebook(currentTenant.socialLinks?.facebook || "");
      setTiktok(currentTenant.socialLinks?.tiktok || "");
      setPreviewLogo(currentTenant.logo || null);
    }
  }, [currentTenant]);

  const canManageTeam =
    isPlatformAdmin ||
    currentMembership?.role === "owner" ||
    currentMembership?.role === "admin";

  useEffect(() => {
    const loadTeam = async () => {
      if (!currentTenant) {
        setTeam([]);
        return;
      }
      if (!canManageTeam) {
        setTeam([]);
        return;
      }
      setTeamLoading(true);
      setTeamMessage("");
      try {
        const membershipsRef = collection(
          db,
          "tenants",
          currentTenant.id,
          "memberships",
        );
        const membershipsSnap = await getDocs(membershipsRef);
        const items: Array<{
          uid: string;
          email: string | null;
          displayName: string | null;
          role: string;
          joinedAt: number;
        }> = [];
        for (const membershipDoc of membershipsSnap.docs) {
          const data = membershipDoc.data() as {
            uid: string;
            role: string;
            joinedAt: number;
            tenantId?: string;
          };
          const userRef = doc(db, "users", data.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists()
            ? (userSnap.data() as {
                email: string | null;
                displayName: string | null;
              })
            : { email: null, displayName: null };
          items.push({
            uid: data.uid,
            email: userData.email,
            displayName: userData.displayName,
            role: data.role,
            joinedAt: data.joinedAt,
          });
        }
        setTeam(items);
      } catch (error) {
        console.error(error);
        setTeamMessage("Error al cargar el equipo");
      } finally {
        setTeamLoading(false);
      }
    };
    loadTeam();
  }, [currentTenant, canManageTeam]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;

    setLoading(true);
    setMessage("");

    try {
      let logoUrl = currentTenant.logo;

      // Upload logo if changed
      if (logo) {
        const logoRef = ref(
          storage,
          `tenants/${currentTenant.id}/logo_${Date.now()}`,
        );
        await uploadBytes(logoRef, logo);
        logoUrl = await getDownloadURL(logoRef);
      }

      await updateDoc(doc(db, "tenants", currentTenant.id), {
        name,
        slug,
        whatsappPhone,
        primaryColor,
        address,
        mapsUrl: mapsUrl || null,
        socialLinks: {
          instagram: instagram || null,
          facebook: facebook || null,
          tiktok: tiktok || null,
        },
        logo: logoUrl || null,
      });

      await refreshTenants();
      setMessage("✅ Cambios guardados correctamente");
    } catch (error) {
      console.error(error);
      setMessage("❌ Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTenant) return;
    if (!inviteEmail.trim()) return;
    setTeamLoading(true);
    setTeamMessage("");
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", inviteEmail.trim()));
      const snap = await getDocs(q);
      if (snap.empty) {
        setTeamMessage("No existe un usuario con ese correo");
        setTeamLoading(false);
        return;
      }
      const userDoc = snap.docs[0];
      const uid = userDoc.id;
      const membershipRef = doc(
        db,
        "tenants",
        currentTenant.id,
        "memberships",
        uid,
      );
      await setDoc(membershipRef, {
        uid,
        tenantId: currentTenant.id,
        role: inviteRole,
        joinedAt: Date.now(),
      });
      setInviteEmail("");
      setInviteRole("staff");
      const membershipsRef = collection(
        db,
        "tenants",
        currentTenant.id,
        "memberships",
      );
      const membershipsSnap = await getDocs(membershipsRef);
      const items: Array<{
        uid: string;
        email: string | null;
        displayName: string | null;
        role: string;
        joinedAt: number;
      }> = [];
      for (const membershipDoc of membershipsSnap.docs) {
        const data = membershipDoc.data() as {
          uid: string;
          role: string;
          joinedAt: number;
          tenantId?: string;
        };
        const userRef = doc(db, "users", data.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists()
          ? (userSnap.data() as {
              email: string | null;
              displayName: string | null;
            })
          : { email: null, displayName: null };
        items.push({
          uid: data.uid,
          email: userData.email,
          displayName: userData.displayName,
          role: data.role,
          joinedAt: data.joinedAt,
        });
      }
      setTeam(items);
      setTeamMessage("Usuario añadido al equipo");
    } catch (error) {
      console.error(error);
      setTeamMessage("Error al añadir usuario");
    } finally {
      setTeamLoading(false);
    }
  };

  const handleRemoveMember = async (uid: string, role: string) => {
    if (!currentTenant) return;
    if (role === "owner") return;
    setTeamLoading(true);
    setTeamMessage("");
    try {
      const membershipRef = doc(
        db,
        "tenants",
        currentTenant.id,
        "memberships",
        uid,
      );
      await deleteDoc(membershipRef);
      setTeam((prev) => prev.filter((m) => m.uid !== uid));
      setTeamMessage("Usuario eliminado del equipo");
    } catch (error) {
      console.error(error);
      setTeamMessage("Error al eliminar usuario");
    } finally {
      setTeamLoading(false);
    }
  };

  const storefrontUrl = `${process.env.NEXT_PUBLIC_STOREFRONT_URL}/${slug}`;

  if (!currentTenant) return <div>Cargando...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Configuración del Negocio
        </h1>
        <a
          href={storefrontUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
        >
          Ver mi tienda &rarr;
        </a>
      </div>

      {message && (
        <div
          className={`p-4 mb-6 rounded-md ${message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
        >
          {message}
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-8 divide-y divide-gray-200"
      >
        <div className="space-y-6 sm:space-y-5">
          {/* General Info */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre del negocio
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700"
              >
                URL Slug
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  {process.env.NEXT_PUBLIC_STOREFRONT_URL?.replace(
                    /^https?:\/\//,
                    "",
                  )}
                  /
                </span>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={slug}
                  onChange={(e) =>
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                  }
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 p-2 border"
                />
              </div>
              <button
                type="button"
                className="mt-2 text-xs text-blue-600 hover:text-blue-500"
                onClick={() => {
                  navigator.clipboard.writeText(storefrontUrl);
                  alert("Link copiado!");
                }}
              >
                Copiar link completo
              </button>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700"
              >
                WhatsApp del Negocio
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="whatsapp"
                  id="whatsapp"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Número completo con código de país, sin espacios ni guiones.
              </p>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Dirección (Opcional)
              </label>
              <div className="mt-1">
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="mapsUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Link de Google Maps (Opcional)
              </label>
              <div className="mt-1">
                <input
                  type="url"
                  id="mapsUrl"
                  name="mapsUrl"
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Pega el link de tu ubicación en Google Maps. Si se configura, se usará en lugar de buscar la dirección de texto.
              </p>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="pt-8 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 border-t border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 sm:col-span-6">
              Redes Sociales
            </h3>

            <div className="sm:col-span-4">
              <label
                htmlFor="instagram"
                className="block text-sm font-medium text-gray-700"
              >
                Instagram
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  instagram.com/
                </span>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                  placeholder="mi_tienda"
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="facebook"
                className="block text-sm font-medium text-gray-700"
              >
                Facebook
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  facebook.com/
                </span>
                <input
                  type="text"
                  id="facebook"
                  name="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="mi.tienda"
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 p-2 border"
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label
                htmlFor="tiktok"
                className="block text-sm font-medium text-gray-700"
              >
                TikTok
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  tiktok.com/@
                </span>
                <input
                  type="text"
                  id="tiktok"
                  name="tiktok"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value.replace(/^@/, ""))}
                  placeholder="mi_tienda"
                  className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 p-2 border"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="pt-8 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 border-t border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900 sm:col-span-6">
              Marca
            </h3>

            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Logo
              </label>
              <div className="mt-1 flex items-center space-x-5">
                <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                  {previewLogo ? (
                    <img
                      src={previewLogo}
                      alt="Logo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg
                      className="h-full w-full text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="color"
                className="block text-sm font-medium text-gray-700"
              >
                Color Principal
              </label>
              <div className="mt-1 flex items-center space-x-3">
                <input
                  type="color"
                  name="color"
                  id="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-10 p-0 border-0 rounded-md overflow-hidden"
                />
                <span className="text-sm text-gray-500">{primaryColor}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 mt-8 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </form>
      <div className="mt-10 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Equipo</h2>
        {!canManageTeam && (
          <p className="text-sm text-gray-500">
            Solo el dueño o admin del negocio puede gestionar el equipo.
          </p>
        )}
        {canManageTeam && (
          <div className="space-y-6">
            {teamMessage && (
              <div
                className={`p-3 rounded-md text-sm ${teamMessage.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}
              >
                {teamMessage}
              </div>
            )}
            <form
              onSubmit={handleInvite}
              className="flex flex-col sm:flex-row gap-3 items-start sm:items-end"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">
                  Correo de la usuaria
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rol
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) =>
                    setInviteRole(e.target.value as "staff" | "admin")
                  }
                  className="mt-1 block rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={teamLoading}
                className="sm:ml-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {teamLoading ? "Guardando..." : "Añadir al equipo"}
              </button>
            </form>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">
                      Nombre
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">
                      Correo
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">
                      Rol
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {team.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        No hay miembros en el equipo todavía.
                      </td>
                    </tr>
                  )}
                  {team.map((member) => (
                    <tr key={member.uid}>
                      <td className="px-4 py-2 text-gray-900">
                        {member.displayName || "Sin nombre"}
                      </td>
                      <td className="px-4 py-2 text-gray-700">
                        {member.email || "Sin correo"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {member.role !== "owner" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveMember(member.uid, member.role)
                            }
                            className="text-xs text-red-600 hover:text-red-800"
                            disabled={teamLoading}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
