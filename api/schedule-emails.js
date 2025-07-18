import { admin, db, appId } from './_lib/firebaseAdminConfig';
import cors from 'cors';

const corsHandler = cors({ origin: true });

export default async function handler(req, res) {
  await new Promise((resolve, reject) => {
    corsHandler(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { emails, userId } = req.body;

  if (!userId || !Array.isArray(emails) || emails.length === 0) {
    return res
      .status(400)
      .json({ error: 'Missing or invalid user ID or emails array.' });
  }

  try {
    const batch = db.batch();
    const scheduledEmailsCol = db
      .collection('artifacts')
      .doc(appId)
      .collection('users')
      .doc(userId)
      .collection('scheduledEmails');

    emails.forEach((email) => {
      const docRef = scheduledEmailsCol.doc();

      let sendAtTs;
      if (email.sendAt) {
        const sendAtDate = new Date(email.sendAt);
        if (isNaN(sendAtDate.getTime())) {
          throw new Error(`Invalid sendAt value: ${email.sendAt}`);
        }
        sendAtTs = admin.firestore.Timestamp.fromDate(sendAtDate);
      } else {
        sendAtTs = admin.firestore.Timestamp.now();
      }

      batch.set(docRef, {
        ...email,
        sendAt: sendAtTs,
        status: 'scheduled',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return res
      .status(200)
      .json({ success: true, message: `${emails.length} emails scheduled successfully.` });
  } catch (error) {
    console.error('Error scheduling emails:', error);
    return res.status(500).json({ error: 'Failed to schedule emails.' });
  }
}
