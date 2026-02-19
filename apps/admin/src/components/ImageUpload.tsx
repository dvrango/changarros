'use client';

import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { Image as ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
    tenantId: string;
    images: string[];
    onChange: (images: string[]) => void;
}

export default function ImageUpload({ tenantId, images, onChange }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        setUploading(true);
        try {
            const newImages = [...images];

            for (let i = 0; i < e.target.files.length; i++) {
                const file = e.target.files[i];
                const fileRef = ref(storage, `tenants/${tenantId}/products/${Date.now()}_${file.name}`);
                await uploadBytes(fileRef, file);
                const url = await getDownloadURL(fileRef);
                newImages.push(url);
            }

            onChange(newImages);
        } catch (error) {
            console.error('Error uploading images:', error);
            alert('Error al subir imágenes');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = [...images];
        newImages.splice(index, 1);
        onChange(newImages);
    };

    return (
        <div>
            <div className="flex flex-wrap gap-4 mb-4">
                {images.map((url, index) => (
                    <div key={index} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-200 group">
                        <Image
                            src={url}
                            alt="Product"
                            fill
                            className="object-cover"
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    {uploading ? (
                        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    ) : (
                        <>
                            <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 text-center px-1">Subir Foto</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>
            <p className="text-xs text-gray-500">
                Recomendado: Imágenes cuadradas (1080x1080)
            </p>
        </div>
    );
}
