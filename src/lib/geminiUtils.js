function createEmailPrompt(profile, contact, jobTitle, resumeText) {
  const achievementsList = profile.achievements?.map(ach => `- ${ach}`).join('\n') || 'Not specified.';
  
  return `
    You are an expert career coach writing a cold email for a job seeker.
    Your tone should be professional, confident, and concise.

    **Job Seeker's Profile:**
    - Name: ${profile.name}
    - Profession: ${profile.profession}
    - Years of Experience: ${profile.experience || 'Not specified'}
    - Key Skills: ${profile.skills}
    - Key Achievements:
    ${achievementsList}

    **Job Seeker's Resume Summary:**
    ${resumeText ? `---START RESUME---\n${resumeText}\n---END RESUME---` : 'No resume text provided.'}

    **Recipient's Information:**
    - Name: ${contact.name}
    - Company: ${contact.company}

    **Task:**
    Write a compelling and personalized HTML email body for a referral request for the "${jobTitle}" position at ${contact.company}.
    - Start with a polite greeting to ${contact.name}.
    - Briefly introduce ${profile.name} and their profession.
    - Clearly state the ask: a referral for the position.
    - Do not include a subject line or a closing (like "Best regards").
  `;
}

export async function generateContent(prompt) {
  try {
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.candidates && result.candidates[0]?.content?.parts?.[0]) {
      let text = result.candidates[0].content.parts[0].text;
      if (text.startsWith("```html")) {
        text = text.substring(7, text.length - 3).trim();
      }
      return text;
    } else {
      throw new Error("Invalid response structure from API.");
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return null;
  }
}

export async function generateEmailBody(profile, contact, resumeText, jobTitle = "a relevant role") {
    const prompt = createEmailPrompt(profile, contact, jobTitle, resumeText);
    return await generateContent(prompt);
}

export async function rephraseEmailBody(textToRephrase) {
    const prompt = `
        You are a professional copywriter. Rephrase the following HTML email body to be more impactful and concise, while maintaining the original intent and professional tone.
        Keep the response in HTML format.
        Do NOT include the [Footer] placeholder in your response.

        Original Text:
        ${textToRephrase}
    `;
    return await generateContent(prompt);
}
