import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, 'service-account.json'), 'utf8'),
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const auth = getAuth();

async function deleteCollection(
  collectionPath: string,
  batchSize: number = 50,
) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(
  db: FirebaseFirestore.Firestore,
  query: FirebaseFirestore.Query,
  resolve: (value?: unknown) => void,
) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  for (const doc of snapshot.docs) {
    // Delete subcollections first (recursive) if needed, but for now simple delete
    // For a deep clean, we should list subcollections.
    // However, Firestore doesn't easily list subcollections of a doc without knowing names.
    // Known subcollections: 'memberships', 'products', 'leads' in 'tenants'
    if (doc.ref.path.startsWith('tenants/')) {
      await deleteCollection(`${doc.ref.path}/memberships`);
      await deleteCollection(`${doc.ref.path}/products`);
      await deleteCollection(`${doc.ref.path}/leads`);
    }
    batch.delete(doc.ref);
  }
  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function main() {
  console.log('🗑️  Starting database reset...');

  console.log('Deleting tenants...');
  await deleteCollection('tenants');

  console.log('Deleting users (Firestore profiles)...');
  await deleteCollection('users');

  // Optional: Clear custom claims for all users?
  // Let's just clear claims for the main user to ensure a fresh start if needed,
  // but actually we want to KEEP the account, just reset data.
  // We will re-assign claims in the seed script.

  console.log('✅ Database cleared.');
}

main().catch(console.error);
