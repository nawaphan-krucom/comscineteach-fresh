const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
// Lazy-load storage bucket to avoid errors when storageBucket isn't configured during local loads
function getStorageBucket() {
  try {
    return admin.storage().bucket();
  } catch (e) {
    console.warn('Storage bucket not configured or unavailable:', e.message);
    return null;
  }
}

async function buildExportRecords() {
  const usersSnap = await db.collection('users').get();
  const users = {};
  usersSnap.forEach(d => { users[d.id] = d.data(); });

  const progSnap = await db.collection('progress').get();
  const records = [];
  progSnap.forEach(d => {
    const prog = d.data();
    const studentId = d.id;
    const user = users[studentId] || null;
    const studentName = prog.studentName || (user && (user.name || user.username)) || '';
    records.push({ studentId, studentName, user, progress: prog });
  });
  return records;
}

function timeStampSafe() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

async function writeJsonToBucket(records) {
  const ts = timeStampSafe();
  const filePath = `exports/exports_${ts}.json`;
  const bucket = getStorageBucket();
  if (!bucket) throw new Error('No storage bucket configured');
  const file = bucket.file(filePath);
  await file.save(JSON.stringify(records), { contentType: 'application/json' });
  return filePath;
}

exports.scheduledExport = functions.pubsub
  .schedule('every 24 hours')
  .timeZone('Asia/Bangkok')
  .onRun(async (context) => {
    console.log('scheduledExport triggered');
    const records = await buildExportRecords();
    const path = await writeJsonToBucket(records);
    console.log('Exported', records.length, 'records to', path);
    return null;
  });

// HTTP trigger for on-demand export (protected by caller's Firebase permissions if needed)
exports.exportNow = functions.https.onRequest(async (req, res) => {
  try {
    console.log('exportNow called');
    const records = await buildExportRecords();
    const path = await writeJsonToBucket(records);
    res.json({ ok: true, path, count: records.length });
  } catch (err) {
    console.error('exportNow error', err);
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// HTTP/CORS-capable function to allow teachers/admins to reset a user's password.
// Secure improvements:
// - Strict origin whitelist via env ALLOWED_ORIGINS
// - Audit log to `admin_audit/password_resets`
// - Basic rate-limit per caller (env RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_SECONDS)
// - Supports callable-style wrapper and plain JSON POST
exports.resetUserPassword = functions.https.onRequest(async (req, res) => {
  // READ CONFIG
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
  const rateLimitWindow = parseInt(process.env.RATE_LIMIT_WINDOW_SECONDS || '3600', 10); // default 1 hour
  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '10', 10); // default 10 resets per window

  const originHeader = req.get('Origin') || req.get('origin');
  if (originHeader) {
    if (!allowedOrigins.length || (allowedOrigins.length && !allowedOrigins.includes(originHeader))) {
      res.status(403).json({ error: 'origin-not-allowed', message: 'Origin not allowed' });
      return;
    }
    // safe to set
    res.set('Access-Control-Allow-Origin', originHeader);
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  } else {
    // No origin header (server-to-server or tools) — do not set CORS header but allow
    res.set('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Determine payload (support callable wrapper or direct JSON)
  const payload = req.body && req.body.data ? req.body.data : req.body || {};
  const { userId, newPassword } = payload || {};

  // Read id token from Authorization header
  const authHeader = req.get('Authorization') || req.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthenticated', message: 'Missing Authorization Bearer token' });
    return;
  }
  const idToken = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const callerUid = decoded.uid;
    const callerRole = decoded && decoded.role ? decoded.role : 'student';
    if (callerRole !== 'teacher' && callerRole !== 'admin') {
      res.status(403).json({ error: 'permission-denied', message: 'Only teachers or admins can reset passwords.' });
      return;
    }

    if (!userId || !newPassword) {
      res.status(400).json({ error: 'invalid-argument', message: 'Missing userId or newPassword' });
      return;
    }

    // Rate-limiting (basic fixed-window per caller)
    const rlDocRef = db.collection('rate_limits').doc(`password_reset_${callerUid}`);
    const now = Date.now();
    await db.runTransaction(async tx => {
      const snap = await tx.get(rlDocRef);
      let state = { count: 0, windowStart: now };
      if (snap.exists) {
        state = snap.data();
      }
      // reset window if expired
      if (!state.windowStart || (now - state.windowStart) > rateLimitWindow * 1000) {
        state.count = 0;
        state.windowStart = now;
      }
      if ((state.count || 0) + 1 > rateLimitMax) {
        throw { code: 'rate-exceeded', message: 'Rate limit exceeded' };
      }
      state.count = (state.count || 0) + 1;
      tx.set(rlDocRef, state, { merge: true });
    });

    await admin.auth().updateUser(userId, { password: newPassword });

    // Audit log
    try {
      await db.collection('admin_audit').add({
        type: 'password_reset',
        targetUid: userId,
        changedByUid: callerUid,
        changedByRole: callerRole,
        origin: originHeader || null,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.warn('Could not write audit record', e);
    }

    // Optionally record a timestamp in Firestore for auditing on user doc
    try {
      await db.collection('users').doc(userId).update({ passwordResetAt: admin.firestore.FieldValue.serverTimestamp() });
    } catch (e) {
      // non-fatal if user doc isn't present
      console.warn('Could not write passwordResetAt to users doc', e);
    }

    // Return in callable format if caller used callable wrapper
    if (req.body && req.body.data) {
      res.json({ result: { ok: true } });
    } else {
      res.json({ ok: true });
    }
  } catch (err) {
    console.error('resetUserPassword error', err);
    if (err && err.code === 'rate-exceeded') {
      res.status(429).json({ error: 'rate-exceeded', message: err.message });
    } else if (err && err.code === 'auth/argument-error') {
      res.status(400).json({ error: 'invalid-argument', message: err.message });
    } else {
      res.status(500).json({ error: 'internal', message: String(err) });
    }
  }
});

// New: HTTP function to generate a password-reset link and send via SendGrid/Mailgun (if configured)
exports.sendPasswordResetEmail = functions.https.onRequest(async (req, res) => {
  // Accept POST with JSON { email: '...' }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method-not-allowed' });
    return;
  }

  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    res.status(400).json({ error: 'invalid-argument', message: 'Missing email' });
    return;
  }

  // Allow unauthenticated calls only in emulator or when explicitly enabled
  const allowUnauth = process.env.ALLOW_UNAUTH_SEND_RESET_EMAIL === 'true' || process.env.FUNCTIONS_EMULATOR === 'true';
  const authHeader = req.get('Authorization') || req.get('authorization') || '';
  if (!allowUnauth && !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'unauthenticated', message: 'Missing Authorization' });
    return;
  }

  try {
    // Try to generate link; if user not found, swallow error and return generic success
    let link = null;
    try {
      link = await admin.auth().generatePasswordResetLink(email);
    } catch (genErr) {
      const code = genErr && genErr.code;
      const msg = genErr && genErr.message ? String(genErr.message) : '';
      // Accept different error shapes from emulator/provider and treat as "user not found"
      if (code === 'auth/user-not-found' || /no user record/i.test(msg) || /user-not-found/i.test(msg)) {
        console.info('generatePasswordResetLink: user not found for', email, ' (swallowing error to avoid enumeration).');
        // Respond success with no link to avoid enumeration
        res.json({ ok: true });
        return;
      }
      throw genErr;
    }

    // Attempt to send via SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
          to: email,
          from: process.env.SENDGRID_FROM || 'noreply@sappha.ac.th',
          subject: process.env.SENDGRID_SUBJECT || 'ลิงก์รีเซ็ตรหัสผ่าน',
          text: `ใช้ลิงก์นี้เพื่อตั้งรหัสผ่านใหม่: ${link}`,
          html: `<p>ใช้ลิงก์นี้เพื่อตั้งรหัสผ่านใหม่:</p><p><a href="${link}">${link}</a></p>`
        };
        await sgMail.send(msg);
        res.json({ ok: true });
        return;
      } catch (sgErr) {
        console.error('SendGrid send failed', sgErr);
        // fallthrough to log link
      }
    }

    // If no provider configured or sending failed, on emulator expose the link in response for testing
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
      res.json({ ok: true, debugLink: link });
      return;
    }

    // Production fallback: do not return link — only log it
    console.warn('Password reset link generated but no email provider configured. Link for', email, link);
    res.json({ ok: true });
  } catch (err) {
    console.error('sendPasswordResetEmail error', err);
    res.status(500).json({ error: 'internal', message: String(err) });
  }
});

// Maintain a lightweight status/summary document for quick client subscriptions.
const STATUS_DOC = db.doc('status/summary');

// Increment/decrement user count on user docs create/delete (read-modify-write to avoid FieldValue issues in emulator)
exports.usersOnCreate = functions.firestore.document('users/{userId}').onCreate(async (snap, ctx) => {
  await db.runTransaction(async (tx) => {
    const s = await tx.get(STATUS_DOC);
    const cur = s.exists && typeof s.data().users === 'number' ? s.data().users : 0;
    const next = cur + 1;
    tx.set(STATUS_DOC, { users: next, updatedAt: admin.firestore.Timestamp.now() }, { merge: true });
  });
});

exports.usersOnDelete = functions.firestore.document('users/{userId}').onDelete(async (snap, ctx) => {
  await db.runTransaction(async (tx) => {
    const s = await tx.get(STATUS_DOC);
    const cur = s.exists && typeof s.data().users === 'number' ? s.data().users : 0;
    const next = Math.max(0, cur - 1);
    tx.set(STATUS_DOC, { users: next, updatedAt: admin.firestore.Timestamp.now() }, { merge: true });
  });
});

// Update progress doc counts and latestSubmissionIso
exports.progressOnWrite = functions.firestore.document('progress/{studentId}').onWrite(async (change, ctx) => {
  await db.runTransaction(async (tx) => {
    const summarySnap = await tx.get(STATUS_DOC);
    const curProgress = summarySnap.exists && typeof summarySnap.data().progressDocs === 'number' ? summarySnap.data().progressDocs : 0;
    let newProgress = curProgress;
    if (!change.before.exists && change.after.exists) newProgress = curProgress + 1;
    else if (change.before.exists && !change.after.exists) newProgress = Math.max(0, curProgress - 1);

    // compute candidate latest ISO
    let candidateIso = null;
    if (change.after.exists) {
      const afterData = change.after.data() || {};
      const maybeTs = afterData.submittedAt || afterData.lastSubmittedAt || afterData.updatedAt || afterData.modifiedAt;
      if (maybeTs) {
        try {
          if (maybeTs.toDate) candidateIso = maybeTs.toDate().toISOString();
          else candidateIso = new Date(maybeTs).toISOString();
        } catch (e) {
          candidateIso = String(maybeTs);
        }
      } else {
        candidateIso = new Date().toISOString();
      }
    }

    const currentLatest = summarySnap.exists ? summarySnap.data().latestSubmissionIso : null;
    const toWrite = { progressDocs: newProgress, updatedAt: admin.firestore.Timestamp.now() };
    if (candidateIso && (!currentLatest || candidateIso > currentLatest)) toWrite.latestSubmissionIso = candidateIso;
    tx.set(STATUS_DOC, toWrite, { merge: true });
  });
});
