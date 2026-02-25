'use client';

import { useState, useEffect } from 'react';
import { useTenant } from '@/lib/tenant';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { Product } from '@/types';
import ProductForm from '@/components/ProductForm';
import { Plus, Search, Edit2, Trash2, Tag, Image as ImageIcon, X } from 'lucide-react';
import Image from 'next/image';

export default function ProductsPage() {
    const { currentTenant } = useTenant();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);

    const fetchProducts = async () => {
        if (!currentTenant) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, `tenants/${currentTenant.id}/products`),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentTenant]);

    const handleCreate = async (data: Partial<Product>) => {
        if (!currentTenant) return;
        await addDoc(collection(db, `tenants/${currentTenant.id}/products`), {
            ...data,
            active: data.active ?? true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        setIsModalOpen(false);
        fetchProducts();
    };

    const handleUpdate = async (data: Partial<Product>) => {
        if (!currentTenant || !editingProduct) return;
        await updateDoc(doc(db, `tenants/${currentTenant.id}/products/${editingProduct.id}`), {
            ...data,
            updatedAt: Date.now(),
        });
        setIsModalOpen(false);
        setEditingProduct(undefined);
        fetchProducts();
    };

    const handleDelete = async (id: string) => {
        if (!currentTenant || !confirm('¿Estás seguro de eliminar este producto?')) return;
        await deleteDoc(doc(db, `tenants/${currentTenant.id}/products/${id}`));
        fetchProducts();
    };

    const openCreateModal = () => {
        setEditingProduct(undefined);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!currentTenant) return <div>Cargando...</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
                <button
                    onClick={openCreateModal}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm text-sm font-medium"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Producto
                </button>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Cargando productos...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <Tag className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                    <p className="mt-1 text-sm text-gray-500">Comienza agregando tu primer producto al catálogo.</p>
                    <button
                        onClick={openCreateModal}
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Nuevo Producto
                    </button>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md divide-y divide-gray-200">
                    <ul role="list" className="divide-y divide-gray-200">
                        {filteredProducts.map((product) => (
                            <li key={product.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center min-w-0 flex-1">
                                        <div className="flex-shrink-0 h-16 w-16 relative rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                                            {product.images && product.images[0] ? (
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full text-gray-400">
                                                    <ImageIcon className="w-6 h-6" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                            <div>
                                                <p className="text-sm font-medium text-blue-600 truncate">{product.name}</p>
                                                <p className="mt-1 flex items-center text-sm text-gray-500">
                                                    <span className="truncate">{product.description || "Sin descripción"}</span>
                                                </p>
                                            </div>
                                            <div className="hidden md:block">
                                                <div className="text-sm text-gray-900 font-semibold">
                                                    ${product.price.toFixed(2)}
                                                </div>
                                                <div className="mt-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {product.active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex items-center flex-shrink-0 space-x-2">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-2 text-gray-400 hover:text-blue-600"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product.id)}
                                            className="p-2 text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ProductForm
                                initialData={editingProduct}
                                tenantId={currentTenant.id}
                                onSubmit={editingProduct ? handleUpdate : handleCreate}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
