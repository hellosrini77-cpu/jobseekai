// api/cover-letter.js
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { jd, summary, verdict, keywords, titleCurrent, titleSuggested, tone, companyName, jobTitle } = req.body;
  if (!jd || !summary) return res.status(400).json({ error: 'Missing required fields' });

  const toneInstructions = {
    professional: 'Write in a polished, precise, and confident professional tone. Formal but not stiff.',
    bold: 'Write in a bold, direct, and assertive tone. Lead with impact. No hedging.',
    warm: 'Write in a warm, personable, and relationship-focused tone. Genuine and human.',
  };

  const prompt = `You are an expert career coach writing a tailored cover letter.

COMPANY NAME: ${companyName || 'the company'}
EXACT JOB TITLE: ${jobTitle || 'see job description'}
CRITICAL: You MUST use "${jobTitle || 'the role'}" as the job title throughout the cover letter. Never paraphrase, upgrade, or substitute it with any other title even if a different title appears in the job description.

JOB DESCRIPTION:
${jd}

CANDIDATE RESUME SUMMARY:
${summary}

RESUME VERDICT:
${verdict}

KEYWORDS ALREADY IN RESUME:
${keywords.join(', ')}

TONE: ${toneInstructions[tone] || toneInstructions.professional}

Write a compelling, tailored cover letter for this role. Guidelines:
- 4 paragraphs, no headers
- Opening: hook that references the ${jobTitle || 'role'} at ${companyName || 'the company'} and why it resonates
- Para 2: most relevant experience that maps directly to the JD requirements
- Para 3: something unique/differentiating (AI/tech angle if applicable, specific achievement)
- Closing: confident call to action referencing ${companyName || 'the company'}
- Do NOT use generic phrases like "I am writing to apply" or "I am a hardworking individual"
- Do NOT include date, address blocks, or "Dear Hiring Manager" — just the body paragraphs
- Use the candidate's actual experience — do not fabricate achievements
- Mirror language from the job description naturally
- Length: 280–350 words total
- End with: "Sincerely," followed by a blank line then the candidate's name placeholder: [Your Name]

Return ONLY the cover letter text, nothing else.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Claude API error');
    }

    const data = await response.json();
    const coverLetter = data.content?.[0]?.text?.trim();
    if (!coverLetter) throw new Error('No cover letter generated');

    return res.status(200).json({ coverLetter });
  } catch (err) {
    console.error('Cover letter error:', err);
    return res.status(500).json({ error: err.message || 'Failed to generate cover letter' });
  }
}
