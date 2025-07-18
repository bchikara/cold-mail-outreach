import { formidable } from 'formidable';
import fs from 'fs';
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
    api: {
        bodyParser: false,
    },
};

const parseForm = (req) => {
    return new Promise((resolve, reject) => {
        const form = formidable({});
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
};

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

    try {
        const { fields, files } = await parseForm(req);
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
            to: to,
            subject: subject,
            html: html,
            attachments: [],
        };

        if (resumeFile) {
            const fileContent = fs.readFileSync(resumeFile.filepath);
            mailOptions.attachments.push({
                filename: 'resume.pdf',
                content: fileContent,
                contentType: 'application/pdf',
            });
        }

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ success: true, message: 'Email sent successfully!' });

    } catch (error) {
        console.error('Handler Error:', error);
        return res.status(500).json({ error: 'Failed to process request.', details: error.message });
    }
}
