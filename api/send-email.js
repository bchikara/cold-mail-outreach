import { formidable } from 'formidable';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import cors from 'cors';

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

export const config = {
  api: { bodyParser: false },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false, maxFileSize: 20 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

const wrapEmailBody = (body) => {
  return `<div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">${body}</div>`;
};


export default async function handler(req, res) {
  try {
    await new Promise((resolve, reject) => {
      corsHandler(req, res, (result) => {
        if (result instanceof Error) return reject(result);
        return resolve(result);
      });
    });
  } catch (err) {
    console.error('CORS Error:', err);
    return res.status(500).json({ error: 'CORS failure', details: err.message });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);

    const to = Array.isArray(fields.to) ? fields.to[0] : fields.to;
    const subject = Array.isArray(fields.subject) ? fields.subject[0] : fields.subject;
    const html = Array.isArray(fields.html) ? fields.html[0] : fields.html;
    const fromName = Array.isArray(fields.fromName) ? fields.fromName[0] : fields.fromName;

    const resumeFile = files?.resume
      ? Array.isArray(files.resume)
        ? files.resume[0]
        : files.resume
      : null;

    if (!to || !subject || !html || !fromName) {
      return res.status(400).json({ error: 'Missing required text fields.' });
    }

    let resumeFilename = `${fromName} Resume.pdf`;
    if (resumeFile?.originalFilename) {
      const ext = path.extname(resumeFile.originalFilename) || '.pdf';
      resumeFilename = `${fromName} Resume${ext}`;
    }

    const mailOptions = {
      from: `"${fromName}" <${GMAIL_EMAIL}>`,
      to,
      subject,
      html: wrapEmailBody(html),
      attachments: [],
    };

    if (resumeFile?.filepath) {
      const fileContent = fs.readFileSync(resumeFile.filepath);
      mailOptions.attachments.push({
        filename: resumeFilename,
        content: fileContent,
        contentType: resumeFile.mimetype || 'application/pdf',
      });
    }

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ error: 'Failed to process request.', details: error.message });
  }
}
