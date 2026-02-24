import { Product, Category } from './types';

export const WHATSAPP_NUMBER = '525512345678';

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    label: 'Todo',
    imageUrl: 'https://picsum.photos/seed/all/100/100',
  },
  {
    id: 'home',
    label: 'Hogar',
    imageUrl: 'https://picsum.photos/seed/home/100/100',
  },
  {
    id: 'ceramic',
    label: 'Cerámica',
    imageUrl: 'https://picsum.photos/seed/ceramic/100/100',
  },
  {
    id: 'textile',
    label: 'Textiles',
    imageUrl: 'https://picsum.photos/seed/textile/100/100',
  },
  {
    id: 'vintage',
    label: 'Vintage',
    imageUrl: 'https://picsum.photos/seed/vintage/100/100',
  },
  {
    id: 'plants',
    label: 'Botánica',
    imageUrl: 'https://picsum.photos/seed/plants/100/100',
  },
];

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Jarrón Wabi Sabi',
    price: 450,
    description:
      'Jarrón de cerámica hecho a mano con acabado rústico e imperfecto que celebra la belleza de lo natural. Perfecto para flores secas o ramas de eucalipto.',
    category: 'ceramic',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p1_1/600/800',
      'https://picsum.photos/seed/p1_2/600/600',
      'https://picsum.photos/seed/p1_3/600/800',
    ],
    tags: ['artesanal', 'decoración', 'minimalista'],
    dimensions: '25cm alto x 12cm diámetro',
    material: 'Cerámica de alta temperatura, esmalte mate',
    care: 'Lavar a mano con agua tibia. No usar abrasivos.',
  },
  {
    id: '2',
    name: 'Cobija de Lana Cruda',
    price: 1200,
    description:
      'Tejida en telar de cintura por artesanos locales. 100% lana virgen, suave y increíblemente cálida para las noches frías.',
    category: 'textile',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p2_1/600/800',
      'https://picsum.photos/seed/p2_2/600/800',
    ],
    tags: ['invierno', 'cama', 'artesanal'],
    dimensions: '180cm x 120cm',
    material: '100% Lana virgen',
    care: 'Lavado en seco únicamente.',
  },
  {
    id: '3',
    name: 'Espejo Vintage Dorado',
    price: 850,
    description:
      'Espejo de latón recuperado de los años 70. Una pieza única con historia que aporta luz y amplitud a cualquier rincón.',
    category: 'vintage',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p3_1/600/900',
      'https://picsum.photos/seed/p3_2/600/600',
    ],
    tags: ['único', 'retro', 'pared'],
    dimensions: '40cm diámetro',
    material: 'Latón envejecido y cristal',
    care: 'Limpiar con paño suave y limpiavidrios.',
  },
  {
    id: '4',
    name: 'Monstera Deliciosa',
    price: 350,
    description:
      'Planta de interior resistente y purificadora de aire. Sus hojas fenestradas son una obra de arte natural. Viene en maceta de barro básica.',
    category: 'plants',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p4_1/600/800',
      'https://picsum.photos/seed/p4_2/600/800',
      'https://picsum.photos/seed/p4_3/600/600',
    ],
    tags: ['vida', 'verde', 'interior'],
    dimensions: 'Altura aprox 50cm',
    material: 'Planta viva',
    care: 'Riego moderado cada 7 días. Luz indirecta brillante.',
  },
  {
    id: '5',
    name: 'Juego de Tazas Terra',
    price: 500,
    description:
      'Set de 4 tazas de café en tonos tierra. Esmalte mate apto para lavavajillas. El agarre es ergonómico y conservan bien el calor.',
    category: 'ceramic',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p5_1/600/600',
      'https://picsum.photos/seed/p5_2/600/600',
    ],
    tags: ['cocina', 'regalo', 'café'],
    dimensions: '300ml capacidad',
    material: 'Cerámica gres',
    care: 'Apto para lavavajillas y microondas.',
  },
  {
    id: '6',
    name: 'Cesta de Yute',
    price: 300,
    description:
      'Cesta organizadora tejida a mano con fibras naturales. Ideal para revistas, mantas o como macetero decorativo.',
    category: 'home',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p6_1/600/800',
      'https://picsum.photos/seed/p6_2/600/800',
    ],
    tags: ['organización', 'natural', 'sustentable'],
    dimensions: '35cm x 35cm',
    material: 'Fibra de Yute natural',
    care: 'Aspirar regularmente. Evitar humedad directa.',
  },
  {
    id: '7',
    name: 'Lámpara de Mesa Hongo',
    price: 1500,
    description:
      'Diseño icónico en vidrio soplado color ámbar. Luz cálida para ambientes relajados. Inspirada en el diseño italiano de los 60s.',
    category: 'vintage',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p7_1/600/600',
      'https://picsum.photos/seed/p7_2/600/800',
      'https://picsum.photos/seed/p7_3/600/600',
    ],
    tags: ['iluminación', 'diseño', 'ambiente'],
    dimensions: '30cm altura',
    material: 'Vidrio soplado',
    care: 'Usar foco LED E27 (no incluido).',
  },
  {
    id: '8',
    name: 'Mantel de Lino Lavado',
    price: 950,
    description:
      'Lino europeo pre-lavado para una textura suave y arrugada "effortless". Color arena natural que combina con todo.',
    category: 'textile',
    active: true,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
    images: [
      'https://picsum.photos/seed/p8_1/600/750',
      'https://picsum.photos/seed/p8_2/600/600',
    ],
    tags: ['mesa', 'comedor', 'elegante'],
    dimensions: '200cm x 150cm',
    material: '100% Lino',
    care: 'Lavado a máquina ciclo suave.',
  },
];
