const footerTemplate = `
  <br><br>
  <table id="email-signature" role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:450px;border-top:1px solid #dddddd;padding-top:15px;margin-top:20px;">
    <tr>
      <td style="width:80px;vertical-align:top;padding-right:15px;">
        <img src="[Your Photo URL]" alt="Profile" width="70" height="70" style="display:block;width:70px;height:70px;border-radius:50%;object-fit:cover;">
      </td>
      <td style="vertical-align:top;font-family:Arial,sans-serif;font-size:14px;line-height:1.4;color:#555;">
        <p style="margin:0;font-weight:bold;font-size:16px;color:#333;">[Your Name]</p>
        <p style="margin:2px 0 6px;font-size:14px;color:#555;">[Your Profession]</p>
        <p style="margin:2px 0;font-size:14px;color:#555;">[Your Phone] &nbsp;•&nbsp; <a href="mailto:[Your Email]" style="color:#1a0dab;text-decoration:none;">[Your Email]</a></p>
        <p style="margin:2px 0 8px;font-size:14px;color:#555;"><a href="[Your Website URL]" style="color:#1a0dab;text-decoration:none;">[Your Website URL]</a></p>
        <p style="margin:0;line-height:1;">
          [Social Links]
        </p>
      </td>
    </tr>
  </table>
`;

export function getPersonalizedEmail(template, contact, profile) {
  if (!template || !contact || !profile) {
    return { subject: '', body: '' };
  }

  const toCompany = contact.company || 'your company';
  const skillsStr = Array.isArray(profile.skills)
    ? profile.skills.join(', ')
    : (profile.skills || 'my relevant skills');
  const yearsStr = profile.experience
    ? `${profile.experience} year${profile.experience > 1 ? 's' : ''} of experience`
    : 'my experience';
  const firstName = (contact.name || '').trim().split(/\s+/)[0] || 'there';

  // ---- SUBJECT ----
  let subject = (template.subject || '')
    .replace(/\[Company Name\]/gi, toCompany)
    .replace(/\[Job Title\]/gi, 'the role'); // you can pass a jobTitle prop if you add it

  // Add sender suffix once
  if (profile.name) {
    const nameSuffix = ` | ${profile.name}`;
    if (!subject.includes(nameSuffix)) subject += nameSuffix;
  }

  // ---- BODY ----
  let body = (template.body || '')
    .replace(/\[Name\]/gi, firstName)
    .replace(/\[Company Name\]/gi, toCompany)
    .replace(/\[Your Name\]/gi, profile.name || 'a professional contact')
    .replace(/\[Your Profession\]/gi, profile.profession || 'Software Engineer')
    .replace(/\[Your Skills\]/gi, skillsStr)
    .replace(/\[Your Experience\]/gi, yearsStr)
    .replace(/\[Your Key Experience\]/gi, yearsStr)
    .replace(/\[Your Achievements\]/gi, profile.achievements?.[0] || 'a key achievement');

  // ---- FOOTER ----
  const socialLinks = [
    profile.linkedin && `<span style="display:inline-block;margin-right:10px;"><a href="${profile.linkedin}" style="text-decoration:none;"><img src="https://img.icons8.com/color/24/linkedin.png" alt="LinkedIn"></a></span>`,
    profile.github && `<span style="display:inline-block;margin-right:10px;"><a href="${profile.github}" style="text-decoration:none;"><img src="https://img.icons8.com/material-outlined/24/github.png" alt="GitHub"></a></span>`,
    profile.twitter && `<span style="display:inline-block;"><a href="${profile.twitter}" style="text-decoration:none;"><img src="https://img.icons8.com/color/24/twitter.png" alt="Twitter"></a></span>`
  ].filter(Boolean).join('');

  const personalizedFooter = footerTemplate
    .replace(/\[Your Photo URL\]/g, profile.photoURL || 'https://placehold.co/70x70/1f2937/9ca3af?text=')
    .replace(/\[Your Name\]/g, profile.name || '')
    .replace(/\[Your Profession\]/g, profile.profession || '')
    .replace(/\[Your Phone\]/g, profile.phone || '')
    .replace(/\[Your Email\]/g, profile.email || '')
    .replace(/\[Your Website URL\]/g, profile.website || '')
    .replace('[Social Links]', socialLinks || '');

  if (body.includes('[Footer]')) {
    body = body.replace('[Footer]', personalizedFooter);
  } else if (!/id="email-signature"/i.test(body)) {
    // If author forgot placeholder, just append.
    body += personalizedFooter;
  }

  return { subject, body };
}

