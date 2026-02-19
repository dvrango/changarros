import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccount = JSON.parse(readFileSync(join(__dirname, 'service-account.json'), 'utf8'));

// Cargar .env.local de apps/admin para variables como PLATFORM_ADMIN_EMAIL
function loadEnvLocal() {
    try {
        const envPath = join(__dirname, '..', '.env.local');
        if (!existsSync(envPath)) return;
        const content = readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
            const l = line.trim();
            if (!l || l.startsWith('#')) continue;
            const idx = l.indexOf('=');
            if (idx === -1) continue;
            const key = l.slice(0, idx).trim();
            let value = l.slice(idx + 1).trim();
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    } catch {
        // Silencioso: si no existe o falla, seguimos con process.env existente
    }
}
loadEnvLocal();

// Initialize
initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function seed() {
    const TENANT_ID = 'demo-shop';
    const USER_UID = 'YOUR_USER_UID_HERE'; // Replace with your UID after login
    const PLATFORM_ADMIN_EMAIL = process.env.PLATFORM_ADMIN_EMAIL || process.env.NEXT_PUBLIC_PLATFORM_ADMIN_EMAIL;

    console.log(`Seeding tenant: ${TENANT_ID} for user: ${USER_UID}...`);

    // 1. Create User (Simulated, usually Auth handles this)
    console.log('Ensuring user profile...');
    await db.collection('users').doc(USER_UID).set({
        uid: USER_UID,
        email: 'admin@demo.com',
        displayName: 'Demo Admin',
        createdAt: Date.now()
    }, { merge: true });

    // 1.1. Opcional: asignar custom claim de admin global a partir de email
    if (PLATFORM_ADMIN_EMAIL) {
        try {
            console.log(`Setting platformAdmin claim for: ${PLATFORM_ADMIN_EMAIL} (if exists) ...`);
            const auth = getAuth();
            const userRecord = await auth.getUserByEmail(PLATFORM_ADMIN_EMAIL);
            await auth.setCustomUserClaims(userRecord.uid, { platformAdmin: true });
            console.log(`Custom claim platformAdmin=true set for uid: ${userRecord.uid}`);
        } catch (e) {
            console.warn('No se pudo asignar claim platformAdmin:', e);
        }
    } else {
        console.log('PLATFORM_ADMIN_EMAIL no definido; se omite asignación de claim platformAdmin.');
    }

    // 2. Create Tenant
    console.log('Creating tenant...');
    const tenantRef = db.collection('tenants').doc(TENANT_ID);
    await tenantRef.set({
        name: 'Mi Changarrito Demo',
        slug: 'demo-shop',
        whatsappPhone: '525512345678',
        ownerId: USER_UID,
        primaryColor: '#e11d48', // heavy red
        createdAt: Date.now()
    });

    // 3. Create Membership
    console.log('Creating membership...');
    await tenantRef.collection('memberships').doc(USER_UID).set({
        uid: USER_UID,
        role: 'owner',
        joinedAt: Date.now()
    });

    // 4. Create Products
    console.log('Creating products...');
    const products = [
        {
            name: 'Coca Cola 600ml',
            price: 18.00,
            description: 'Refresco sabor cola, botella de plástico no retornable.',
            active: true,
            images: ['https://via.placeholder.com/300?text=Coca+Cola'],
        },
        {
            name: 'Papas Sabritas 45g',
            price: 22.50,
            description: 'Papas fritas con sal.',
            active: true,
            images: ['https://via.placeholder.com/300?text=Sabritas'],
        },
        {
            name: 'Gansito Marinela',
            price: 15.00,
            description: 'Pastelito con relleno cremoso y mermelada de fresa.',
            active: true,
            images: ['https://via.placeholder.com/300?text=Gansito'],
        }
    ];

    for (const p of products) {
        await tenantRef.collection('products').add({
            ...p,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }

    // 5. Create Dummy Leads
    console.log('Creating dummy leads...');
    const leads = [
        {
            total: 58.50,
            status: 'new',
            items: [
                { productId: '1', name: 'Coca Cola 600ml', quantity: 2, price: 18.00 },
                { productId: '2', name: 'Papas Sabritas 45g', quantity: 1, price: 22.50 }
            ],
            createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
            updatedAt: Date.now()
        },
        {
            total: 15.00,
            status: 'closed',
            items: [
                { productId: '3', name: 'Gansito Marinela', quantity: 1, price: 15.00 }
            ],
            notes: 'Entregado en la esquina.',
            createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
            updatedAt: Date.now()
        }
    ];

    for (const l of leads) {
        await tenantRef.collection('leads').add(l);
    }

    console.log('Done! ✅');
}

seed().catch(console.error);
