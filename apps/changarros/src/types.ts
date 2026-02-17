export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  images: string[]; // Changed from single imageUrl to array
  tags: string[];
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