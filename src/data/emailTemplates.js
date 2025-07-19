const footer = `[Footer]`; // leave placeholder

export const emailTemplates = [
  {
    id: 'comprehensive-referral',
    name: 'Comprehensive Referral Request',
    subject: 'Referral for Software Engineering role at [Company Name]',
    body: `
      <div style="font-family:Arial,sans-serif;color:#333;font-size:14px;line-height:1.6;">
        <p>Hi [Name],</p>
        <p>I hope you're doing well.</p>
        <p>I'm reaching out to express my strong interest in a software engineering role at <strong>[Company Name]</strong>. With over [Your Experience] of hands-on work across leading technologies like [Your Skills], I've contributed to building scalable applications and impactful data visualizations.</p>
        <p>During my tenure, a key achievement was [Your Achievements]. I am currently pursuing my Master’s in Computer Science at Syracuse University, further deepening my technical skills.</p>
        <p>I've attached my resume for your consideration. I'd love the opportunity to explore how I can bring value to the engineering teams at [Company Name]. Please let me know if any roles align with my profile.</p>
        <p>Thank you for your time and consideration.</p>
        ${footer}
      </div>
    `
  },
  {
    id: 'direct-application',
    name: 'Direct Application Inquiry',
    subject: 'Inquiry regarding the [Job Title] position',
    body: `
      <div style="font-family:Arial,sans-serif;color:#333;font-size:14px;line-height:1.6;">
        <p>Hi [Name],</p>
        <p>My name is <strong>[Your Name]</strong>, and I'm writing to express my interest in the [Job Title] position at [Company Name]. With experience in [Your Skills], I believe I can contribute meaningfully.</p>
        <p>My resume is attached for your review. I'd appreciate any next steps or guidance you can share.</p>
        ${footer}
      </div>
    `
  },
  {
    id: 'follow-up',
    name: 'Follow-up Email',
    subject: 'Following up on my application for [Job Title]',
    body: `
      <div style="font-family:Arial,sans-serif;color:#333;font-size:14px;line-height:1.6;">
        <p>Hi [Name],</p>
        <p>I hope you're having a great week. I'm writing to politely follow up on my email from last week regarding the [Job Title] position. I'm still very interested in the opportunity to contribute to [Company Name].</p>
        <p>My resume is attached again for convenience.</p>
        ${footer}
      </div>
    `
  }
];
