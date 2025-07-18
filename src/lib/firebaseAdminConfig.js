import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.REACT_APP_FIREBASE_SERVICE_ACCOUNT_KEY)),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

const db = admin.firestore();
const appId = 'cold-outreach-dashboard-pro';

export { db, appId };