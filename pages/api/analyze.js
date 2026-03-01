import Anthropic from '@anthropic-ai/sdk';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ANALYSIS_PROMPT = `You are an expert ATS (Applicant Tracking System) analyst and resume coach with deep knowledge of how modern ATS systems including Workday, Greenhouse, Lever, iCIMS, and Taleo parse, score, and filter resumes.

You will be given a RESUME and a JOB DESCRIPTION.

Analyze the resume against the job description and respond with a JSON object only (no markdown, no preamble, pure JSON).

Your analysis must:
1. Think like an ATS first — keyword matching, title normalization, skill extraction
2. Then think like a senior recruiter — context, impact, seniority signals
3. Identify what is genuinely missing vs what is present but poorly expressed
4. Only rewrite bullets that are weak, vague, missing keywords, or unquantified — skip bullets that are already strong. Maximum 10 rewrites.

Scoring criteria:
- Keyword match (required skills present): 30 points
- Keyword match (preferred skills present): 15 points
- Title/seniority alignment: 20 points
- Quantified achievements: 15 points
- Formatting/parseability: 10 points
- Overall narrative fit: 10 points

Be brutally honest with the score. A resume that scores 85+ should genuinely be competitive. Most resumes score between 35-65.

Respond with this exact JSON structure:
{
  "atsScore": <number 0-100>,
  "scoreBreakdown": {
    "requiredKeywords": <number 0-30>,
    "preferredKeywords": <number 0-15>,
    "titleAlignment": <number 0-20>,
    "quantifiedAchievements": <number 0-15>,
    "formatting": <number 0-10>,
    "narrativeFit": <number 0-10>
  },
  "verdict": "<one sentence brutally honest assessment>",
  "topPriorities": [
    "<specific action #1>",
    "<specific action #2>",
    "<specific action #3>"
  ],
  "keywordAnalysis": {
    "present": ["<keyword>"],
    "missing": [
      {
        "keyword": "<missing keyword or phrase>",
        "importance": "Required|Preferred",
        "context": "<why this matters for this specific role and how to naturally incorporate it>"
      }
    ]
  },
  "bulletRewrites": [
    {
      "original": "<exact original bullet from resume>",
      "rewritten": "<complete replacement bullet, ATS-optimized, quantified where possible, ready to paste>",
      "reason": "<one line explaining what changed and why>"
    }
  ],
  "formattingIssues": [
    {
      "issue": "<specific formatting problem that hurts ATS parsing>",
      "fix": "<exact fix to apply>"
    }
  ],
  "titleRecommendation": {
    "current": "<current resume title or headline>",
    "suggested": "<ATS-optimized title aligned to JD>",
    "reason": "<why this change improves ATS matching>"
  },
  "summary": "<3-4 sentence honest overall assessment covering fit, gaps, and the single biggest opportunity to improve this resume for this role>"
}

RESUME:
{{RESUME_TEXT}}

JOB DESCRIPTION:
{{JD_TEXT}}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Parse multipart form data
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 }); // 5MB limit

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const jdText = Array.isArray(fields.jd) ? fields.jd[0] : fields.jd;
    const resumeFile = Array.isArray(files.resume) ? files.resume[0] : files.resume;

    if (!jdText || !jdText.trim()) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    if (!resumeFile) {
      return res.status(400).json({ error: 'Resume PDF is required' });
    }

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(resumeFile.filepath);
    const pdfData = await pdfParse(pdfBuffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ error: 'Could not extract text from PDF. Please ensure the PDF contains selectable text (not a scanned image).' });
    }

    // Clean up temp file
    fs.unlinkSync(resumeFile.filepath);

    // Build prompt
    const prompt = ANALYSIS_PROMPT
      .replace('{{RESUME_TEXT}}', resumeText)
      .replace('{{JD_TEXT}}', jdText);

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;

    // Parse JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse response as JSON');
      }
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed', details: error.message });
  }
}
