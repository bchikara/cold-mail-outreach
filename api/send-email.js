import { formidable } from 'formidable';
import fs from 'fs';
import nodemailer from 'nodemailer';
import cors from 'cors';

/**
 * Email sending API handler
 * ---------------------------------
 * Updates:
 * • Dynamic resume attachment filename: "<fromName> Resume.pdf".
 * • Use uploaded file's mimetype when present (fallback to application/pdf).
 * • Defensive null checks & simple error messaging.
 * • CORS pre-flight pass-through handled.
 */

const corsHandler = cors({ origin: true });

const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_EMAIL,
    pass: GMAIL_APP_PASSWORD,
  },
});

// Disable Next.js default body parsing so formidable can read the multipart form.
export const config = {
  api: {
    bodyParser: false,
  },
};

/** Parse multipart/form-data with formidable */
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({});
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
};

/** Sanitize a string for safe use in filenames */
function sanitizeForFilename(str = '') {
  // Remove characters illegal on Windows & mail gateways; collapse whitespace.
  return str.replace(/[<>:"/\\|?*]+/g, '').replace(/\s+/g, ' ').trim();
}

export default async function handler(req, res) {
  // Run CORS middleware (supports preflight in some deploy envs)
  await new Promise((resolve, reject) => {
    corsHandler(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });

  // Explicitly allow OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);

    // formidable returns arrays of values
    const to = fields.to?.[0];
    const subject = fields.subject?.[0];
    const html = fields.html?.[0];
    const fromName = fields.fromName?.[0];
    const resumeFile = files.resume?.[0];

    if (!to || !subject || !html || !fromName) {
      return res.status(400).json({ error: 'Missing required text fields.' });
    }

    const mailOptions = {
      from: `"${fromName}" <${GMAIL_EMAIL}>`,
      to,
      subject,
      html,
      attachments: [],
    };

    if (resumeFile) {
      try {
        const fileContent = fs.readFileSync(resumeFile.filepath);
        const safeFrom = sanitizeForFilename(fromName || 'User');
        const filename = `${safeFrom} Resume.pdf`; // user-requested naming convention
        mailOptions.attachments.push({
          filename,
          content: fileContent,
          contentType: resumeFile.mimetype || 'application/pdf',
        });
      } catch (readErr) {
        console.error('Failed to read uploaded resume file:', readErr);
        return res.status(500).json({ error: 'Resume file read error.' });
      }
    }

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ error: 'Failed to process request.', details: error.message });
  }
}
