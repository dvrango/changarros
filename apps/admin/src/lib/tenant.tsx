'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  collectionGroup,
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';
import { Tenant, Membership } from '@/types';

interface TenantContextType {
  currentTenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  switchTenant: (tenantId: string) => void;
  refreshTenants: () => Promise<void>;
  memberships: Membership[];
  currentMembership: Membership | null;
  isPlatformAdmin: boolean;
}

const TenantContext = createContext<TenantContextType>({
  currentTenant: null,
  tenants: [],
  loading: true,
  switchTenant: () => {},
  refreshTenants: async () => {},
  memberships: [],
  currentMembership: null,
  isPlatformAdmin: false,
});

export const useTenant = () => useContext(TenantContext);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(
    null,
  );
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      user.getIdTokenResult().then((result) => {
        setIsPlatformAdmin(result.claims['platformAdmin'] === true);
      });
    } else {
      setIsPlatformAdmin(false);
    }
  }, [user]);

  const fetchTenants = async () => {
    if (!user) {
      setTenants([]);
      setCurrentTenant(null);
      setMemberships([]);
      setCurrentMembership(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const distinctTenants = new Map<string, Tenant>();
      const membershipByTenant = new Map<string, Membership>();

      try {
        const membershipsRef = collectionGroup(db, 'memberships');
        const membershipsQuery = query(
          membershipsRef,
          where('uid', '==', user.uid),
        );
        const membershipsSnap = await getDocs(membershipsQuery);

        for (const membershipDoc of membershipsSnap.docs) {
          const data = membershipDoc.data() as Membership;
          const tenantIdFromPath = membershipDoc.ref.parent.parent?.id || '';
          const tenantId = data.tenantId || tenantIdFromPath;
          if (!tenantId) {
            continue;
          }

          const tenantRef = doc(db, 'tenants', tenantId);
          const tenantSnap = await getDoc(tenantRef);
          if (!tenantSnap.exists()) {
            continue;
          }

          const tenantData = tenantSnap.data() as Omit<Tenant, 'id'>;
          const tenant: Tenant = { id: tenantSnap.id, ...tenantData };
          distinctTenants.set(tenant.id, tenant);

          membershipByTenant.set(tenant.id, {
            ...data,
            tenantId,
          });
        }
      } catch (error) {
        console.error('Error fetching memberships:', error);
      }

      if (isPlatformAdmin) {
        const allTenantsSnap = await getDocs(collection(db, 'tenants'));
        for (const tenantDoc of allTenantsSnap.docs) {
          const tenantData = tenantDoc.data() as Omit<Tenant, 'id'>;
          const tenant: Tenant = { id: tenantDoc.id, ...tenantData };
          distinctTenants.set(tenant.id, tenant);

          if (!membershipByTenant.has(tenant.id)) {
            const syntheticMembership: Membership = {
              uid: user.uid,
              tenantId: tenant.id,
              role: 'owner',
              joinedAt: Date.now(),
            };
            membershipByTenant.set(tenant.id, syntheticMembership);
          }
        }
      } else if (distinctTenants.size === 0) {
        const ownerQuery = query(
          collection(db, 'tenants'),
          where('ownerId', '==', user.uid),
        );
        const ownerSnap = await getDocs(ownerQuery);

        for (const tenantDoc of ownerSnap.docs) {
          const tenantData = tenantDoc.data() as Omit<Tenant, 'id'>;
          const tenant: Tenant = { id: tenantDoc.id, ...tenantData };
          distinctTenants.set(tenant.id, tenant);

          if (!membershipByTenant.has(tenant.id)) {
            const syntheticMembership: Membership = {
              uid: user.uid,
              tenantId: tenant.id,
              role: 'owner',
              joinedAt: Date.now(),
            };
            membershipByTenant.set(tenant.id, syntheticMembership);
          }
        }
      }

      const tenantsList = Array.from(distinctTenants.values());
      const membershipsList: Membership[] = tenantsList
        .map((tenant) => membershipByTenant.get(tenant.id))
        .filter((m): m is Membership => !!m);

      setTenants(tenantsList);
      setMemberships(membershipsList);

      const storedTenantId =
        typeof window !== 'undefined'
          ? localStorage.getItem('lastTenantId')
          : null;
      let selectedTenant: Tenant | null = null;

      if (storedTenantId && distinctTenants.has(storedTenantId)) {
        selectedTenant = distinctTenants.get(storedTenantId)!;
      } else if (tenantsList.length > 0) {
        selectedTenant = tenantsList[0];
      } else {
        selectedTenant = null;
      }

      setCurrentTenant(selectedTenant);
      if (selectedTenant) {
        setCurrentMembership(membershipByTenant.get(selectedTenant.id) ?? null);
      } else {
        setCurrentMembership(null);
      }
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
      setMemberships([]);
      setCurrentTenant(null);
      setCurrentMembership(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [user]);

  const switchTenant = (tenantId: string) => {
    const tenant = tenants.find((t) => t.id === tenantId);
    if (tenant) {
      setCurrentTenant(tenant);
      const membership =
        memberships.find((m) => m.tenantId === tenant.id) ?? null;
      setCurrentMembership(membership);
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastTenantId', tenantId);
      }
    }
  };

  return (
    <TenantContext.Provider
      value={{
        currentTenant,
        tenants,
        loading,
        switchTenant,
        refreshTenants: fetchTenants,
        memberships,
        currentMembership,
        isPlatformAdmin,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}
