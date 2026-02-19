export interface Tenant {
  id: string; // slug
  name: string;
  slug: string;
  whatsappPhone: string; // e.g., "5215512345678"
  logo?: string;
  primaryColor?: string;
  address?: string;
  ownerId: string;
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;      // Firestore uses 'name', not 'title'
  price: number;
  description: string;
  category: string;
  images: string[];
  tags: string[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
  // Optional extra fields (may or may not exist in Firestore docs)
  dimensions?: string;
  material?: string;
  care?: string;
}

export interface Category {
  id: string;
  label: string;
  imageUrl?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}