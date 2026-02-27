export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    createdAt: number;
}

export interface SocialLinks {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
}

export interface Tenant {
    id: string; // slug
    name: string;
    slug: string;
    whatsappPhone: string; // e.g., "5215512345678"
    logo?: string; // Storage URL
    primaryColor?: string; // e.g., "#000000"
    address?: string;
    mapsUrl?: string; // Google Maps link
    socialLinks?: SocialLinks;
    ownerId: string;
    createdAt: number;
}

export type MembershipRole = 'owner' | 'admin' | 'staff';

export interface Membership {
    uid: string;
    tenantId: string;
    role: MembershipRole;
    joinedAt: number;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    active: boolean;
    createdAt: number;
    updatedAt: number;
}

export type LeadStatus = 'new' | 'contacted' | 'closed';

export interface LeadItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
}

export interface Lead {
    id: string;
    customerName?: string; // from WhatsApp if available, often null initially
    total: number;
    status: LeadStatus;
    items: LeadItem[];
    notes?: string;
    createdAt: number;
    updatedAt: number;
}
