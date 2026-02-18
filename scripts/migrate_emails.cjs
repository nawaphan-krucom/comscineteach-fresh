#!/usr/bin/env node
/**
 * scripts/migrate_emails.cjs
 *
 * Migrate user emails from @school.com -> @sappha.ac.th in Firestore (and optionally Firebase Auth).
 * Usage:
 *   # Dry-run (default): list candidate docs
 *   node scripts/migrate_emails.cjs
 *
 *   # Apply updates to Firestore (and optionally update Firebase Auth emails)
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json node scripts/migrate_emails.cjs --apply --update-auth
 *
 * Notes:
 * - If you want to run against the emulator, set FIRESTORE_EMULATOR_HOST (and optionally FIREBASE_AUTH_EMULATOR_HOST).
 * - This script will scan the `users` collection and update any `email` field ending with @school.com.
 */

const dryRun = !process.argv.includes('--apply');
const updateAuth = process.argv.includes('--update-auth');

async function main() {
  console.log(`migrate_emails: dryRun=${dryRun} updateAuth=${updateAuth}`);

  let admin;
  try {
    admin = require('firebase-admin');
  } catch (e) {
    console.error('Please install firebase-admin first: npm i firebase-admin');
    process.exit(1);
  }

  try {
    if (!admin.apps.length) {
      // Initialize using Application Default Credentials or emulator settings
      if (process.env.FIRESTORE_EMULATOR_HOST) {
        admin.initializeApp();
        console.log('Initialized firebase-admin using emulator settings (FIRESTORE_EMULATOR_HOST found)');
      } else {
        admin.initializeApp({ credential: admin.credential.applicationDefault() });
        console.log('Initialized firebase-admin using Application Default Credentials');
      }
    }
  } catch (err) {
    console.error('Failed to initialize firebase-admin:', err);
    process.exit(1);
  }

  const db = admin.firestore();

  console.log('Scanning users collection for @school.com addresses...');
  const snap = await db.collection('users').get();
  const candidates = [];

  snap.forEach(doc => {
    const data = doc.data() || {};
    const emailRaw = (data.email || data.username || '').toString();
    if (/@school\.com$/i.test(emailRaw)) {
      const newEmail = emailRaw.replace(/@school\.com$/i, '@sappha.ac.th');
      candidates.push({ id: doc.id, email: emailRaw, newEmail });
    }
  });

  console.log(`Found ${candidates.length} candidate(s).`);
  if (candidates.length === 0) process.exit(0);

  if (dryRun) {
    console.log('Dry-run mode: the following documents would be updated:');
    candidates.forEach(c => console.log(` - ${c.id}: ${c.email} -> ${c.newEmail}`));
    console.log('\nRun with --apply to perform updates. Use --update-auth to also update Firebase Auth users (requires admin credentials).');
    process.exit(0);
  }

  // Apply updates
  let success = 0;
  for (const c of candidates) {
    try {
      await db.collection('users').doc(c.id).update({ email: c.newEmail });
      console.log(`Updated Firestore user ${c.id}: ${c.email} -> ${c.newEmail}`);
      success++;

      if (updateAuth) {
        try {
          await admin.auth().updateUser(c.id, { email: c.newEmail });
          console.log(`  Updated Auth user ${c.id} email -> ${c.newEmail}`);
        } catch (authErr) {
          console.warn(`  Warning: failed to update Auth user ${c.id}:`, authErr.message || authErr);
        }
      }
    } catch (err) {
      console.error(`Failed to update ${c.id}:`, err.message || err);
    }
  }

  console.log(`Migration complete: ${success}/${candidates.length} updated in Firestore.`);
  if (updateAuth) console.log('Auth updates attempted where possible.');
}

main().catch(err => { console.error(err); process.exit(1); });
