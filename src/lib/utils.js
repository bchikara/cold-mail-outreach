import { FOOTER_REGEX } from './geminiUtils'; 

export const footerTemplate = `
  <table id="email-signature" cellpadding="0" cellspacing="0" border="0"
    style="width:100%;max-width:450px;border-top:1px solid #dddddd;padding-top:15px;margin-top:20px;">
    <tr>
      <td style="width:80px;vertical-align:top;padding-right:15px;">
        <img src="[Your Photo URL]" alt="Profile"
          style="display:block;width:70px;height:70px;border-radius:50%;object-fit:cover;">
      </td>
      <td style="vertical-align:top;font-family:Arial,sans-serif;font-size:14px;line-height:1.4;color:#555;">
        <p style="margin:0;font-weight:bold;font-size:16px;color:#333;">[Your Name]</p>
        <p style="margin:2px 0 6px;font-size:14px;color:#555;">[Your Profession]</p>
        <p style="margin:2px 0;font-size:14px;color:#555;">
          <a href="mailto:[Your Email]" style="color:#1a0dab;text-decoration:none;">[Your Email]</a> | [Your Phone]
        </p>
        <p style="margin:2px 0 8px;font-size:14px;color:#555;">
          <a href="[Your Website URL]" style="color:#1a0dab;text-decoration:none;">[Your Website URL]</a>
        </p>
        <p style="margin:0;line-height:1;display:flex;gap:8px;align-items:center;">
          [Social Links]
        </p>
      </td>
    </tr>
  </table>
`;

export function getPersonalizedEmail(template, contact, profile) {
  if (!template || !contact || !profile) return { subject: '', body: '' };

  const company = contact.company || 'the company';
  const jobTitle = contact.jobTitle || '[Job Title]';
  const firstName = (contact.name || '').trim().split(/\s+/)[0] || 'there';

  const skills = Array.isArray(profile.skills)
    ? profile.skills.join(', ')
    : (profile.skills || 'relevant skills');

  const expText = profile.experience
    ? `${profile.experience} year${Number(profile.experience) === 1 ? '' : 's'}`
    : 'several years';

  let subject = (template.subject || '')
    .replace(/\[Company Name\]/gi, company)
    .replace(/\[Job Title\]/gi, jobTitle)
    .replace(/\[Your Experience\]/gi, expText);

  if (profile.name) {
    const suffix = ` | ${profile.name}`;
    if (!subject.includes(suffix)) subject += suffix;
  }

  const achievementsList =
    profile.achievements?.map((ach) => `${ach}, `).join('\n')

  let body = (template.body || '')
    .replace(/\[Name\]/gi, firstName)
    .replace(/\[Company Name\]/gi, company)
    .replace(/\[Job Title\]/gi, jobTitle)
    .replace(/\[Your Name\]/gi, profile.name || '')
    .replace(/\[Your Profession\]/gi, profile.profession || '')
    .replace(/\[Your Phone\]/gi, profile.phone || '')
    .replace(/\[Your Email\]/gi, profile.email || '')
    .replace(/\[Your Website URL\]/gi, profile.website || '')
    .replace(/\[Your Skills\]/gi, skills)
    .replace(/\[Your Experience\]/gi, expText)
    .replace(/\[Your Achievements\]/gi, achievementsList.slice(0, -2) || 'a key achievement.');

  const socialLinks = [
    profile.linkedin && `<a href="${profile.linkedin}" style="text-decoration:none;"><img src="https://img.icons8.com/color/24/linkedin.png" alt="LinkedIn"></a>`,
    profile.github && `<a href="${profile.github}" style="text-decoration:none;"><img src="https://img.icons8.com/material-outlined/24/github.png" alt="GitHub"></a>`,
    profile.twitter && `<a href="${profile.twitter}" style="text-decoration:none;"><img src="https://img.icons8.com/color/24/twitter.png" alt="Twitter"></a>`,
  ].filter(Boolean).join('');

  const personalizedFooter = footerTemplate
    .replace(/\[Your Photo URL\]/g, profile.photoURL || 'https://placehold.co/70x70')
    .replace(/\[Your Name\]/g, profile.name || '')
    .replace(/\[Your Profession\]/g, profile.profession || '')
    .replace(/\[Your Phone\]/g, profile.phone || '')
    .replace(/\[Your Email\]/g, profile.email || '')
    .replace(/\[Your Website URL\]/g, profile.website || '')
    .replace('[Social Links]', socialLinks);

  body = body.replace(FOOTER_REGEX, '');

  body = body
  .replace(/(<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>)+$/gi, '')  
  .replace(/(<br\s*\/?>)+$/gi, '')                       
  .trim();


  if (body.includes('[Footer]')) {
    body = body.replace('[Footer]', personalizedFooter);
  } else {
    body += personalizedFooter;
  }

  return { subject, body };
}
