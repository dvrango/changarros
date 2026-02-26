import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account
const serviceAccountPath = join(__dirname, 'service-account.json');
if (!existsSync(serviceAccountPath)) {
  console.error('Error: service-account.json not found in scripts directory.');
  process.exit(1);
}
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Load .env.local to get email
let platformAdminEmail = process.env.NEXT_PLATFORM_ADMIN_EMAIL;

// Try to get email from args first
const emailArg = process.argv[2];
if (emailArg) {
  platformAdminEmail = emailArg;
}

if (!platformAdminEmail) {
  // Fallback to .env.local parsing if not provided
  try {
    const envPath = join(__dirname, '..', '.env.local');
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const l = line.trim();
        if (l.startsWith('NEXT_PLATFORM_ADMIN_EMAIL=')) {
          platformAdminEmail = l.split('=')[1].trim();
          if (
            (platformAdminEmail.startsWith('"') &&
              platformAdminEmail.endsWith('"')) ||
            (platformAdminEmail.startsWith("'") &&
              platformAdminEmail.endsWith("'"))
          ) {
            platformAdminEmail = platformAdminEmail.slice(1, -1);
          }
          break;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading .env.local', e);
  }
}

if (!platformAdminEmail) {
  console.error(
    'Error: No email provided. Usage: npx tsx apps/admin/scripts/get-claims.ts <email>',
  );
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

async function getClaims() {
  try {
    console.log(`🔍 Looking up user: ${platformAdminEmail}`);
    const auth = getAuth();
    const userRecord = await auth.getUserByEmail(platformAdminEmail as string);

    console.log(`\nUser Found:`);
    console.log(`- UID: ${userRecord.uid}`);
    console.log(`- Email: ${userRecord.email}`);
    console.log(`- Display Name: ${userRecord.displayName || 'N/A'}`);

    console.log(`\n🔐 Custom Claims:`);
    if (
      userRecord.customClaims &&
      Object.keys(userRecord.customClaims).length > 0
    ) {
      console.log(JSON.stringify(userRecord.customClaims, null, 2));
    } else {
      console.log('(No custom claims found)');
    }
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
  }
}

getClaims();
