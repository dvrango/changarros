import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { Tenant, Product, Category } from '../types';

interface TenantData {
    tenant: Tenant | null;
    products: Product[];
    categories: Category[];
    loading: boolean;
    error: string | null;
}

export function useTenantData(): TenantData {
    const { tenantSlug } = useParams<{ tenantSlug: string }>();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!tenantSlug) {
            setError('No se especificó ninguna tienda.');
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Query tenant by slug field.
                // The admin uses addDoc() so documents have auto-generated IDs.
                // The slug is stored as a field, not as the document ID.
                const tenantQuery = query(
                    collection(db, 'tenants'),
                    where('slug', '==', tenantSlug)
                );
                const tenantSnap = await getDocs(tenantQuery);

                if (tenantSnap.empty) {
                    setError(`La tienda "${tenantSlug}" no existe.`);
                    setLoading(false);
                    return;
                }

                const tenantDoc = tenantSnap.docs[0];
                const tenantId = tenantDoc.id; // real Firestore doc ID
                const tenantData = { id: tenantId, ...tenantDoc.data() } as Tenant;
                setTenant(tenantData);

                // 2. Fetch active products using the real doc ID
                const productsRef = collection(db, `tenants/${tenantId}/products`);
                const q = query(
                    productsRef,
                    where('active', '==', true),
                    orderBy('createdAt', 'desc')
                );
                const productsSnap = await getDocs(q);
                const productsList = productsSnap.docs.map(d => ({
                    id: d.id,
                    ...d.data(),
                })) as Product[];

                setProducts(productsList);

                // 3. Derive categories from products
                const uniqueCategories = Array.from(
                    new Set(productsList.map(p => p.category).filter(Boolean))
                );
                const derivedCategories: Category[] = [
                    { id: 'all', label: 'Todo' },
                    ...uniqueCategories.map(id => ({
                        id,
                        label: id.charAt(0).toUpperCase() + id.slice(1),
                    })),
                ];
                setCategories(derivedCategories);
            } catch (err) {
                console.error('Error fetching tenant data:', err);
                setError('Error al cargar los datos de la tienda.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tenantSlug]);

    return { tenant, products, categories, loading, error };
}
