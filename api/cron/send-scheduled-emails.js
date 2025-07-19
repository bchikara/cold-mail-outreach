import { admin, db, appId } from '../_lib/firebaseAdminConfig';
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
    const nowTs = admin.firestore.Timestamp.now();
    console.log('[CRON] nowTs:', nowTs.toDate().toISOString());

    const sanitySnap = await db.collectionGroup('scheduledEmails').limit(1).get();
    console.log('[CRON] sanity groupQuery size:', sanitySnap.size);

    const scheduledEmailsQuery = db
      .collectionGroup('scheduledEmails')
      .where('sendAt', '<=', nowTs)
      .orderBy('sendAt', 'asc') 
      .orderBy(admin.firestore.FieldPath.documentId(), 'desc');


    console.log('[CRON] executing scheduledEmailsQuery...');
    const querySnapshot = await scheduledEmailsQuery.get();
    console.log('[CRON] matched docs:', querySnapshot.size);

    if (querySnapshot.empty) {
      return res.status(200).json({ message: 'No emails to send.' });
    }

    const batch = db.batch();
    let emailsSent = 0;

    for (const scheduledDoc of querySnapshot.docs) {
      const emailData = scheduledDoc.data();
      console.log('[CRON] processing', scheduledDoc.ref.path, emailData);

      if (!emailData.to || !emailData.subject || !emailData.html || !emailData.userId) {
        console.warn(`[CRON] Skipping malformed doc: ${scheduledDoc.ref.path}`);
        batch.delete(scheduledDoc.ref);
        continue;
      }

      try {
        await transporter.sendMail({
          from: `"${emailData.fromName || 'Outreach'}" <${GMAIL_EMAIL}>`,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          attachments: emailData.attachments || [],
        });
      } catch (mailErr) {
        console.error(`[CRON] Email send failed for ${scheduledDoc.ref.path}:`, mailErr);
        continue;
      }

      const userHistoryRef = db
        .collection('artifacts')
        .doc(appId)
        .collection('users')
        .doc(emailData.userId)
        .collection('history')
        .doc();

      const { status, ...historyData } = emailData;
      batch.set(userHistoryRef, {
        ...historyData,
        status: 'Initial Outreach (Scheduled)',
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      batch.delete(scheduledDoc.ref);
      emailsSent++;
    }

    await batch.commit();
    return res.status(200).json({
      success: true,
      message: `Successfully sent and moved ${emailsSent} emails.`,
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return res.status(500).json({
      error: 'An error occurred during the cron job.',
      details: error.message,
      code: error.code,
    });
  }
}
