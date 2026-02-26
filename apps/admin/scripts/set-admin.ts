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

if (!platformAdminEmail) {
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
    'Error: NEXT_PLATFORM_ADMIN_EMAIL not found in environment or .env.local',
  );
  process.exit(1);
}

console.log(`Initializing Firebase Admin...`);
initializeApp({
  credential: cert(serviceAccount),
});

async function setAdminClaim() {
  try {
    console.log(`Looking up user by email: ${platformAdminEmail}`);
    const auth = getAuth();
    const userRecord = await auth.getUserByEmail(platformAdminEmail as string);

    console.log(`Found user ${userRecord.uid}. Setting platformAdmin claim...`);

    // Preserve existing claims and add platformAdmin
    const currentClaims = userRecord.customClaims || {};
    await auth.setCustomUserClaims(userRecord.uid, {
      ...currentClaims,
      platformAdmin: true,
    });

    console.log(
      `✅ Success! User ${platformAdminEmail} is now a platformAdmin.`,
    );
    console.log(`User UID: ${userRecord.uid}`);
    console.log(
      `Please sign out and sign in again in the application to refresh the token.`,
    );
  } catch (error) {
    console.error('❌ Error setting admin claim:', error);
  }
}

setAdminClaim();
