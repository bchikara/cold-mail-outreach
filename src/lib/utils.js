export function getPersonalizedEmail(template, contact, profile) {
  if (!template || !contact || !profile) {
    return { subject: '', body: '' };
  }

  let subject = template.subject
    .replace(/\[Company Name\]/g, contact.company || 'their company')
    .replace(/\[Job Title\]/g, 'the role');

  let body = template.body
    .replace(/\[Name\]/g, contact.name || 'there')
    .replace(/\[Your Name\]/g, profile.name || 'a professional contact')
    .replace(/\[Your Profession\]/g, profile.profession || 'a passionate professional')
    .replace(/\[Your Skills\]/g, profile.skills || 'my relevant skills')
    .replace(/\[Your Website URL\]/g, profile.website || '#')
    .replace(/\[Company Name\]/g, contact.company || 'their company')
    .replace(/\[Job Title\]/g, 'the role')
    .replace(/\[Platform\]/g, 'your company website')
    .replace(/\[Your Key Experience\]/g, 'my professional experience');

  return { subject, body };
}
