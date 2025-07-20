const footer = `[Footer]`;

export const emailTemplates = [
  {
    id: 'builder-engineering-outreach',
    name: 'Engineering Role Outreach',
    subject: 'Exploring Software Engineering opportunities at [Company Name]',
    body: `
    <style>
  a {
    color: #1a0dab;
    text-decoration: none;
  }
</style>
      <div style="font-family:Arial,sans-serif;color:#333;font-size:16px;line-height:1.5;">
        <p>Hi [Name],</p>
        <p>
          I hope you are doing well. I’ve been following what <strong>[Company Name]</strong> is building, and I’m really impressed by the products and engineering challenges you're tackling. 
          I enjoy building end-to-end solutions and want to contribute to creating and scaling impactful systems.
        </p>
        <p>
          With [Your Experience] of relevant experience building full-stack applications at companies like 
          <strong>Deloitte, ToTheNew, Smart Joules</strong>, where I’ve delivered systems serving thousands of users. My expertise spans across the stack, starting with 
          <strong>frontend development (React, Next.js, Angular, TypeScript)</strong>, then moving to 
          <strong>backend systems (Node.js, Python, GraphQL, GRPC)</strong>, and also includes managing 
          infrastructure (AWS, GCP).
        </p>
        <p>
          My technical skill set also includes <strong>WebRTC, RTMP, UDP, WebSockets, REST APIs, Docker, CI/CD pipelines, MongoDB, SQL, AI integration (OpenAI API), and building PWAs</strong>.
        </p>
        <p>
          Some of my key achievements include developing an open-source <strong>NPM module for multi-select autocomplete</strong>, 
          winning <strong>Hackathon 1.0 (Helping Hands)</strong>, and earning <strong>Deloitte’s Applause Award three times</strong> for leadership and solving complex dashboard challenges.
        </p>
        <p>
          Along with my professional experience, I’ve built several projects that demonstrate my ability to take ideas from concept to production:</p>
          <ul>
            <li><strong><a href="https://www.youtube.com/watch?v=yECqnPjo67A" target="_blank">ProCode</a></strong> – An AI companion that simulates real coding practice by listening, guiding, and assessing your submissions with an intelligent avatar.</li>
            <li><strong><a href="https://thelacarte.com/" target="_blank">LaCarte</a></strong> – A smart QR-based dining experience enabling menu browsing, ordering, and payments without waiters.</li>
            <li><strong><a href="https://cold-mail-outreach.vercel.app/" target="_blank">Cold Mail Outreach</a></strong> – A full-stack web app with dynamic email templates and outreach tracking in a modern Gemini-inspired dark UI.</li>
            <li><strong><a href="https://github.com/bchikara/job_automater?tab=readme-ov-file#-automated-job-application-assistant" target="_blank">Job Automator</a></strong> – Automates repetitive job applications with AI-assisted form filling and tracking.</li>
            <li><strong><a href="https://github.com/bchikara/SpaceScrible?tab=readme-ov-file#-spacescrible" target="_blank">Space Scribble</a></strong> – A motion tracking app using CNN models to convert sensor-based gestures into alphabet predictions.</li>
          </ul>
        <p>More projects can be found here: <a href="https://builtbychikara.dev/projects" target="_blank">builtbychikara.dev/projects</a>.
        </p>
        <p>
          I would love to learn more about any software engineering opportunities at <strong>[Company Name]</strong>, or if you think someone on your team would be a better contact, I’d appreciate your referral or guidance. 
          I’ve attached my resume and would be happy to provide any additional information if required.
        </p>
        <p>
          Looking forward to hearing from you!
        </p>
        ${footer}
      </div>
    `
  },
  {
    id: 'direct-application',
    name: 'Direct Application Inquiry',
    subject: 'Inquiry regarding the [Job Title] position',
    body: `
      <div style="font-family:Arial,sans-serif;color:#333;font-size:16px;line-height:1.5;">
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
      <div style="font-family:Arial,sans-serif;color:#333;font-size:16px;line-height:1.5;">
        <p>Hi [Name],</p>
        <p>I hope you're having a great week. I'm writing to politely follow up on my email from last week regarding the [Job Title] position. I'm still very interested in the opportunity to contribute to [Company Name].</p>
        <p>My resume is attached again for convenience.</p>
        ${footer}
      </div>
    `
  }
];
