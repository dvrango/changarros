# Roles y permisos en Changarros Admin

Este documento describe cómo funciona el modelo de **roles y permisos** en la app de administración (`apps/admin`), tanto a nivel de datos en Firestore como en la UI.

## Modelo de datos

### Perfil de usuario

- Colección: `users`
- Documento: `users/{uid}`
- Tipo en código: `UserProfile`  
  Archivo: `src/types/index.ts`
- Campos relevantes:
  - `uid: string`
  - `email: string | null`
  - `displayName: string | null`
  - `photoURL: string | null`
  - `createdAt: number`

> Importante: el perfil de usuario **no** guarda el rol; los roles son por negocio (tenant).

### Tenant (negocio)

- Colección: `tenants`
- Documento: `tenants/{tenantId}`
- Tipo en código: `Tenant`  
  Archivo: `src/types/index.ts`
- Campos relevantes:
  - `id: string` (en código se mapea desde el id del documento)
  - `name: string`
  - `slug: string`
  - `whatsappPhone: string`
  - `logo?: string`
  - `primaryColor?: string`
  - `address?: string`
  - `ownerId: string` (uid del dueño principal)
  - `createdAt: number`

### Membership (permisos por negocio)

Los permisos por negocio se modelan con la colección anidada `memberships` bajo cada tenant.

- Colección: `tenants/{tenantId}/memberships`
- Documento: `tenants/{tenantId}/memberships/{uid}`
- Tipos en código:
  - `MembershipRole = 'owner' | 'admin' | 'staff'`
  - `Membership`  
    Archivo: `src/types/index.ts`
- Campos del documento:
  - `uid: string` — UID del usuario.
  - `tenantId: string` — ID del tenant al que pertenece la membership.
  - `role: 'owner' | 'admin' | 'staff'`
  - `joinedAt: number` — timestamp (ej. `Date.now()`).

#### Semántica de roles

- `owner`
  - Dueño del negocio.
  - Tiene acceso completo a la configuración y al equipo del tenant.
  - Es el rol por defecto que se asigna al crear un tenant desde el onboarding.
- `admin`
  - Admin del negocio, casi equivalente a `owner` a nivel de app.
  - Puede gestionar el equipo (añadir / quitar staff) y ver todo el negocio.
- `staff`
  - Miembro de staff.
  - Tiene acceso al negocio seleccionado, pero no puede gestionar el equipo ni cambiar la configuración de roles.

## Admin global de plataforma

Existe un concepto de **admin global**, que ve todos los negocios de la plataforma, independientemente de las memberships.

- En la UI (frontend):
  - Variable de entorno: `NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL`
  - Lógica: Archivo `src/lib/tenant.tsx`
    - Si `email === NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL`, `isPlatformAdmin = true` en el contexto para efectos de navegación y UX.
    - En ese caso, el contexto carga **todos** los `tenants` y genera una `Membership` sintética con rol `'owner'` si no existe una real.
- En reglas de seguridad (Firestore Rules):
  - El “admin global” se reconoce mediante un **Custom Claim** en el token de Auth: `platformAdmin: true`.
  - Esto permite gestionar equipo/tenants aunque no exista membership explícita.
  - Asignación sugerida (administrador): `setCustomUserClaims(uid, { platformAdmin: true })`.

Resumen:

- Frontend: trata como admin global al correo definido en `NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL`.
- Reglas de seguridad: requieren `request.auth.token.platformAdmin === true`.
- Con ambos, ve todos los tenants y puede gestionar el equipo de cualquier negocio.

## Carga de tenants y memberships en el frontend

Toda la lógica central de carga de tenants y permisos vive en:

- Archivo: `src/lib/tenant.tsx`
- Hook y contexto:
  - `TenantProvider`
  - `useTenant()`

### Datos que expone `useTenant`

`useTenant()` devuelve, entre otros:

- `tenants: Tenant[]` — lista de negocios accesibles para el usuario actual.
- `currentTenant: Tenant | null` — negocio actualmente seleccionado.
- `memberships: Membership[]` — memberships del usuario (una por tenant accesible).
- `currentMembership: Membership | null` — membership del usuario para el tenant actualmente seleccionado.
- `isPlatformAdmin: boolean` — si el usuario es el admin global.
- `switchTenant(tenantId: string)` — cambia el negocio activo.
- `refreshTenants()` — vuelve a cargar tenants y memberships.

### Cómo se construye la lista de tenants

En `TenantProvider`:

1. Si no hay usuario autenticado:
   - `tenants = []`
   - `currentTenant = null`
   - `memberships = []`
   - `currentMembership = null`

2. Si hay usuario:
   1. **Memberships por usuario** (caso normal para staff/admin/owner):
      - Se hace un `collectionGroup` sobre `memberships`:
        - `collectionGroup(db, "memberships")`
        - Filtro: `where("uid", "==", user.uid)`
      - Para cada membership:
        - Se deduce `tenantId` del campo `tenantId` o del path del documento.
        - Se lee el tenant en `tenants/{tenantId}`.
        - Se añade ese tenant a `distinctTenants`.
        - Se guarda la membership correspondiente en un mapa `membershipByTenant`.

   2. **Admin global**:
      - Si `isPlatformAdmin` es `true`:
        - Se leen todos los documentos de `tenants`.
        - Se añaden a `distinctTenants`.
        - Si no hay membership para ese tenant en `membershipByTenant`, se genera una:
          - `role: 'owner'`
          - `uid: user.uid`
          - `tenantId: tenant.id`

   3. **Fallback por `ownerId`**:
      - Si no se encontraron tenants por membership y no es admin global:
        - Se hace `query(collection(db, "tenants"), where("ownerId", "==", user.uid))`.
        - Se añaden esos tenants a `distinctTenants`.
        - Si no hay membership explícita, se crea una sintética con:
          - `role: 'owner'`
          - `uid: user.uid`
          - `tenantId: tenant.id`

3. A partir de `distinctTenants` y `membershipByTenant` se calculan:
   - `tenantsList`: todos los tenants accesibles.
   - `membershipsList`: la lista de memberships para esos tenants.
   - `currentTenant`:
     - Primero se intenta con `localStorage.getItem("lastTenantId")`.
     - Si existe y es válido, se usa.
     - Si no, se toma el primer tenant de la lista, o `null` si no hay.
   - `currentMembership`:
     - Membership asociada a `currentTenant`, o `null`.

## Administración de usuarios en la UI

La gestión de usuarios por negocio se hace desde la pantalla de **Configuración del negocio**.

- Archivo: `src/app/admin/settings/page.tsx`

### Sección “Equipo”

Al final de la página de configuración hay una sección titulada **Equipo**.

#### Quién puede gestionar el equipo

- Variable derivada: `canManageTeam`
- Condición:
  - `canManageTeam = isPlatformAdmin || currentMembership?.role === 'owner' || currentMembership?.role === 'admin'`
- Si `canManageTeam` es `false`:
  - Se muestra un mensaje indicando que solo el dueño o admin puede gestionar el equipo.
  - No se muestra el formulario ni la tabla de gestión.

#### Listado de miembros del equipo

Si `canManageTeam` es `true`:

1. Se cargan las memberships del tenant actual:
   - `collection(db, "tenants", currentTenant.id, "memberships")`
   - `getDocs` para obtener todas las memberships.

2. Para cada membership:
   - Se usa `uid` para leer el perfil en `users/{uid}`.
   - Se combinan datos de membership (rol, joinedAt) con datos del usuario (email, displayName).

3. La información se muestra en una tabla:
   - Columnas:
     - Nombre
     - Correo
     - Rol (`owner`, `admin`, `staff`)
     - Acciones

4. Acciones disponibles:
   - Para miembros con rol distinto de `owner`:
     - Botón **Eliminar**:
       - Borra el documento `tenants/{tenantId}/memberships/{uid}`.
       - Quita al usuario de la tabla.
   - Para `owner`:
     - No se muestra botón de eliminación (protección básica).

#### Añadir usuario al equipo por correo

En la misma sección hay un formulario:

- Campos:
  - Correo de la usuaria (`inviteEmail`)
  - Rol (`inviteRole`): `staff` o `admin`

- Flujo al enviar:
  1. Buscar el usuario por correo:
     - `collection(db, "users")`
     - `query(..., where("email", "==", inviteEmail))`
     - Si no se encuentra, se muestra el mensaje: “No existe un usuario con ese correo”.

  2. Crear/actualizar membership:
     - Se toma el `uid` del primer doc encontrado.
     - Se escribe en `tenants/{tenantId}/memberships/{uid}`:
       - `uid`
       - `tenantId: currentTenant.id`
       - `role: inviteRole`
       - `joinedAt: Date.now()`

  3. Recargar la lista de miembros para reflejar el cambio en la tabla.

Resumen:

- Para que una usuaria pueda acceder a un negocio, debe:
  1. Tener cuenta creada (existe `users/{uid}`).
  2. Tener una `Membership` en `tenants/{tenantId}/memberships/{uid}` con un rol válido.
- Tú, desde la UI de Configuración → Equipo, puedes:
  - Añadir usuarias por correo.
  - Elegir su rol (`staff` o `admin`).
  - Eliminar usuarias (excepto `owner`).

## Casos de uso típicos

### 1. Admin global (tú) gestionando cualquier negocio

1. Tu correo coincide con `NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL`.
2. En el dashboard puedes seleccionar cualquier negocio desde el `TenantSwitcher`.
3. En `/admin/settings` de cada negocio:
   - Sección **Equipo** disponible siempre (porque `isPlatformAdmin` es `true`).
   - Puedes añadir staff/admin por correo para ese negocio.

### 2. Dueño del negocio invitando a staff

1. Usuario `owner` crea su negocio desde el onboarding.
2. Automáticamente se crea una membership `role: 'owner'` para ese tenant.
3. En `/admin/settings`:
   - `currentMembership.role` es `'owner'`.
   - Puede usar la sección **Equipo** para invitar:
     - Staff (rol `'staff'`).
     - Otros admins (rol `'admin'`).

### 3. Staff accediendo solo a su negocio

1. Staff se registra (tiene `users/{uid}`).
2. El `owner` o el admin global lo añade al equipo de un tenant con rol `'staff'`.
3. Al iniciar sesión:
   - El `TenantProvider` busca memberships con `uid == user.uid`.
   - Solo se cargan los tenants donde tiene membership.
   - En el `TenantSwitcher` solo verá esos negocios.
4. En `/admin/settings`:
   - `canManageTeam` será `false`.
   - No podrá gestionar el equipo ni invitar/eliminar usuarios.

## Notas y consideraciones

- El modelo de permisos es **por negocio**, no global por usuario:
  - Un mismo usuario puede ser `owner` de un tenant, `staff` de otro, y no tener acceso a otros.
- Admin global:
  - UX/frontend: por correo (`NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL`).
  - Seguridad: por Custom Claim (`platformAdmin: true`) en el token.
- Las memberships se consultan con `collectionGroup`, por lo que es necesario tener el índice correspondiente creado en Firestore.
