import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../../lib/firebaseConfig';
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
        return res.status(400).json({ error: 'Missing or invalid user ID or emails array.' });
    }

    try {
        const batch = writeBatch(db);
        const scheduledEmailsRef = collection(db, `artifacts/${appId}/users/${userId}/scheduledEmails`);

        emails.forEach(email => {
            const docRef = doc(scheduledEmailsRef);
            batch.set(docRef, {
                ...email,
                status: 'scheduled',
                createdAt: serverTimestamp(),
            });
        });

        await batch.commit();
        res.status(200).json({ success: true, message: `${emails.length} emails scheduled successfully.` });
    } catch (error) {
        console.error('Error scheduling emails:', error);
        res.status(500).json({ error: 'Failed to schedule emails.' });
    }
}
