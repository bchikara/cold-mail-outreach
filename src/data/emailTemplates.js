export const emailTemplates = [
  {
    id: 'referral',
    name: 'Referral Request',
    subject: 'Referral Request for [Job Title] at [Company Name]',
    body: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hi [Name],</p>
        <p>My name is <strong>[Your Name]</strong> and I'm a passionate [Your Profession]. I came across the [Job Title] position at [Company Name] and was very impressed by the work your team is doing.</p>
        <p>I was hoping you might be willing to offer a referral. I'm confident my skills in [Your Skills] would be a great asset to the team.</p>
        <p>I have attached my resume for your convenience and you can view my portfolio here: <a href="[Your Website URL]"><strong>[Your Website URL]</strong></a>.</p>
        <p>Thank you for your time and consideration.</p>
        <br>
        <p>Best,<br>[Your Name]</p>
      </div>
    `
  },
  {
    id: 'direct-application',
    name: 'Direct Application Inquiry',
    subject: 'Inquiry regarding the [Job Title] position',
    body: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hi [Name],</p>
        <p>I hope this email finds you well.</p>
        <p>My name is <strong>[Your Name]</strong>, and I'm writing to express my strong interest in the [Job Title] position at [Company Name] that I saw advertised on [Platform, e.g., LinkedIn].</p>
        <p>With my experience in [Your Key Experience], I believe I have the skills and qualifications to excel in this role. I've been following [Company Name]'s work in [Industry/Field] for some time and am very excited about the prospect of contributing to your team.</p>
        <p>I've attached my resume for your review and welcome you to visit my website: <a href="[Your Website URL]"><strong>[Your Website URL]</strong></a>.</p>
        <p>I'm eager to learn more about this opportunity and discuss how I can contribute to [Company Name].</p>
        <br>
        <p>Thank you for your time.</p>
        <p>Sincerely,<br>[Your Name]</p>
      </div>
    `
  },
  {
    id: 'follow-up',
    name: 'Follow-up Email',
    subject: 'Following up on my application for [Job Title]',
    body: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <p>Hi [Name],</p>
        <p>I hope you're having a great week.</p>
        <p>I'm writing to politely follow up on my email from last week regarding the [Job Title] position. I'm still very interested in the opportunity to contribute to [Company Name] and believe my skills in [Your Skills] would be a strong match.</p>
        <p>Would you have a few minutes to chat next week? I've re-attached my resume for your convenience.</p>
        <br>
        <p>Best regards,<br>[Your Name]</p>
      </div>
    `
  }
];