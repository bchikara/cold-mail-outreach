const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

export const MERGE_TOKENS = [
  '[Name]',
  '[Company Name]',
  '[Job Title]',
  '[Your Name]',
  '[Your Profession]',
  '[Your Phone]',
  '[Your Email]',
  '[Your Website URL]',
  '[Your Skills]',
  '[Your Experience]',
  '[Your Achievements]',
  '[Footer]',
];

export const FOOTER_REGEX = /<table id="email-signature"[\s\S]*?<\/table>/i;

function protectTokens(text) {
  if (!text) return { protected: '', map: [] };
  let protectedText = text;
  const map = [];
  MERGE_TOKENS.forEach((tok, i) => {
    const placeholder = `<<<TOKEN_${i}>>>`;
    const re = new RegExp(escapeRegExp(tok), 'g');
    if (re.test(protectedText)) {
      protectedText = protectedText.replace(re, placeholder);
      map.push({ tok, placeholder });
    }
  });
  return { protected: protectedText, map };
}

function restoreTokens(text, map) {
  if (!text) return text;
  let out = text;
  map.forEach(({ tok, placeholder }) => {
    const re = new RegExp(escapeRegExp(placeholder), 'g');
    out = out.replace(re, tok);
  });
  return out;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sanitizeGeminiHtml(html) {
  if (!html) return '';
  let out = html.trim();

  out = out.replace(/^```(?:html|HTML)?/i, '').replace(/```$/i, '').trim();

  out = out.replace(/<\/?(html|body|head)[^>]*>/gi, '');

  out = out.replace(FOOTER_REGEX, '');

  return out.trim();
}

async function geminiRequest(prompt) {
  const payload = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Gemini API ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || '';
}

export function createEmailPrompt(profile, jobTitle = '[Job Title]') {
  const achievementsList =
    profile.achievements?.map((ach) => `- ${ach}`).join('\n') || 'Not specified.';
  const skills =
    Array.isArray(profile.skills) ? profile.skills.join(', ') : profile.skills || 'Not specified';

  return `
You are an expert career coach and professional email copywriter.

Write a concise, confident, *HTML* email body suitable for a cold outreach / referral request.

IMPORTANT TOKEN RULES (do not change these):
- Use [Name] where the recipient's first name should appear.
- Use [Company Name] where the recipient's company name should appear.
- Use [Job Title] where the target role appears (leave token intact if unknown).
- Use [Your Name], [Your Profession], [Your Skills], [Your Experience], [Your Achievements] in the appropriate places to describe the sender. DO NOT replace or reword these tokens.
- Include the literal text [Footer] on its own line where an email signature should render.
- Use <p> tags for paragraphs; inline <strong> for key phrases.
- Keep tone professional, courteous, and direct.
- Do NOT include a subject line.
- Do NOT include any closing like \"Best regards\"; the signature will come from [Footer].
- Return ONLY HTML that can live inside a <div>.

Sender Profile (for context—use tokens, not actual values):
- Name: ${profile.name || '[Your Name]'}
- Profession: ${profile.profession || '[Your Profession]'}
- Years of Experience: ${profile.experience || '[Your Experience]'}
- Key Skills: ${skills}
- Achievements:
${achievementsList}

Target Job Title: ${jobTitle}

Write the HTML now.
`;
}

function createRephraseBodyPrompt(htmlBodyProtected) {
  return `
You are a professional copy editor. Improve the following HTML email body:

- Maintain a professional, confident, concise tone.
- Preserve ALL placeholders exactly as given (they appear as <<<TOKEN_n>>> markers). Do not remove, rename, or reorder them; return them in meaningful places even if you move text.
- Do not include a subject line.
- Do not include an email signature; do not add contact details; do not add [Footer].
- Return valid inline HTML suitable for an email <div> (paragraphs in <p>, key phrases <strong>).

CONTENT TO IMPROVE:
${htmlBodyProtected}
`;
}

function createRephraseSubjectPrompt(subjectProtected) {
  return `
You are an expert email subject copywriter.

Improve the following subject line for a professional referral or application email.

- Keep it under ~80 characters if possible.
- Maintain a polite, confident tone.
- Preserve all placeholder markers (<<<TOKEN_n>>>) exactly.
- Return ONLY the improved subject line text (no quotes, no backticks).

SUBJECT TO IMPROVE:
${subjectProtected}
`;
}

export async function generateEmailBody(profile, jobTitle = '[Job Title]') {
  const prompt = createEmailPrompt(profile, jobTitle);
  const raw = await geminiRequest(prompt);
  const cleaned = sanitizeGeminiHtml(raw);
  return cleaned;
}

export async function rephraseEmailBody(htmlBody) {
  const { protected: prot, map } = protectTokens(htmlBody);
  const raw = await geminiRequest(createRephraseBodyPrompt(prot));
  const cleaned = sanitizeGeminiHtml(raw);
  return restoreTokens(cleaned, map);
}

export async function rephraseEmailSubject(subjectLine) {
  const { protected: prot, map } = protectTokens(subjectLine);
  const raw = await geminiRequest(createRephraseSubjectPrompt(prot));
  const cleaned = raw.trim().replace(/^`+|`+$/g, '');
  return restoreTokens(cleaned, map);
}
