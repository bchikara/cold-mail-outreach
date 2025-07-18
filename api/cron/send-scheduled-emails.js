import { collection, query, where, getDocs, writeBatch, doc, collectionGroup } from 'firebase/firestore';
import { db, appId } from '../../lib/firebaseAdminConfig';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_EMAIL, pass: GMAIL_APP_PASSWORD },
    });

    try {
        const now = new Date();
        const scheduledEmailsQuery = query(collectionGroup(db, 'scheduledEmails'), where('sendAt', '<=', now));
        
        const querySnapshot = await getDocs(scheduledEmailsQuery);
        if (querySnapshot.empty) {
            return res.status(200).json({ message: 'No emails to send.' });
        }

        const batch = writeBatch(db);
        let emailsSent = 0;

        for (const scheduledDoc of querySnapshot.docs) {
            const emailData = scheduledDoc.data();
            const mailOptions = {
                from: `"${emailData.fromName}" <${GMAIL_EMAIL}>`,
                to: emailData.to,
                subject: emailData.subject,
                html: emailData.html,
                attachments: emailData.attachments || [],
            };

            await transporter.sendMail(mailOptions);

            const userHistoryRef = doc(collection(db, `artifacts/${appId}/users/${emailData.userId}/history`));
            const { status, ...historyData } = emailData;
            batch.set(userHistoryRef, {
                ...historyData,
                status: 'Initial Outreach (Scheduled)',
                sentAt: new Date(), 
            });

            batch.delete(scheduledDoc.ref);
            
            emailsSent++;
        }

        await batch.commit();
        res.status(200).json({ success: true, message: `Successfully sent and moved ${emailsSent} emails.` });

    } catch (error) {
        console.error('Cron job error:', error);
        res.status(500).json({ error: 'An error occurred during the cron job.' });
    }
}
