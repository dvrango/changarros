import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'service-account.json'), 'utf8'),
);

// Cargar variables de entorno si es necesario, aunque aquí hardcodearemos lo esencial para "hacerlo bien"
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
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
}
loadEnvLocal();

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

async function seed() {
  console.log('🌱 Starting fresh seed...');

  const PLATFORM_ADMIN_EMAIL =
    process.env.NEXT_PLATFORM_ADMIN_EMAIL || 'dvrango@pm.me';
  console.log(`Target User Email: ${PLATFORM_ADMIN_EMAIL}`);

  let userRecord;
  try {
    userRecord = await auth.getUserByEmail(PLATFORM_ADMIN_EMAIL);
    console.log(`✅ User found: ${userRecord.uid}`);
  } catch (e) {
    console.error(
      `❌ User ${PLATFORM_ADMIN_EMAIL} not found in Auth. Please sign up first.`,
    );
    process.exit(1);
  }

  const USER_UID = userRecord.uid;
  const TENANT_ID = 'demo-shop';

  // 1. Set Platform Admin Claims
  console.log('👑 Setting platformAdmin claims...');
  await auth.setCustomUserClaims(USER_UID, {
    platformAdmin: true,
    // Also useful to mark them as owner of specific tenants in claims if we wanted,
    // but we rely on Firestore data for that usually.
  });

  // 2. Create User Profile
  console.log('👤 Creating user profile...');
  await db
    .collection('users')
    .doc(USER_UID)
    .set(
      {
        uid: USER_UID,
        email: PLATFORM_ADMIN_EMAIL,
        displayName: userRecord.displayName || 'Platform Admin',
        photoURL: userRecord.photoURL || null,
        createdAt: Date.now(),
        roles: ['platformAdmin'],
      },
      { merge: true },
    );

  // 3. Create Tenant
  console.log('Mw Creating tenant "Mi Changarrito Demo"...');
  await db.collection('tenants').doc(TENANT_ID).set({
    name: 'Mi Changarrito Demo',
    slug: TENANT_ID,
    ownerId: USER_UID,
    currency: 'MXN',
    createdAt: Date.now(),
    active: true,
  });

  // 4. Create Membership (CRITICAL for permissions)
  console.log('🎟 Creating membership...');
  await db
    .collection('tenants')
    .doc(TENANT_ID)
    .collection('memberships')
    .doc(USER_UID)
    .set({
      uid: USER_UID,
      role: 'owner',
      tenantId: TENANT_ID, // Redundant but useful for query ease
      joinedAt: Date.now(),
    });

  // 5. Create Sample Products
  console.log('📦 Creating sample products...');
  const productsRef = db
    .collection('tenants')
    .doc(TENANT_ID)
    .collection('products');

  const products = [
    { name: 'Coca Cola 600ml', price: 18, stock: 50, category: 'Bebidas' },
    { name: 'Sabritas Sal', price: 22, stock: 30, category: 'Botanas' },
    { name: 'Gansito', price: 15, stock: 40, category: 'Pan Dulce' },
    { name: 'Emperador Chocolate', price: 16, stock: 25, category: 'Galletas' },
  ];

  for (const p of products) {
    await productsRef.add({
      ...p,
      active: true,
      createdAt: Date.now(),
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('👉 Now run: npx firebase deploy --only firestore:rules');
}

seed().catch(console.error);
