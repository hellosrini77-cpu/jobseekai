import Anthropic from '@anthropic-ai/sdk';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Extract text from PDF or DOCX ───────────────────────────────────────────
async function extractResumeText(filepath, mimetype, originalFilename) {
  const buffer = fs.readFileSync(filepath);
  const isDocx =
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    (originalFilename && originalFilename.toLowerCase().endsWith('.docx'));

  if (isDocx) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } else {
    const pdfData = await pdfParse(buffer);
    return pdfData.text;
  }
}

const ATS_PROMPT = `You are an expert in how enterprise ATS (Applicant Tracking System) platforms parse and score resumes.

You will be given a RESUME and a JOB DESCRIPTION.

Simulate how each of the following ATS platforms would score this resume, based on their known parsing behavior, skill extraction methods, and strictness levels. Score each out of 100.

ATS platforms to evaluate:
1. Workday - strict header parsing, keyword-based skill extraction, strictness 80%. Struggles with tables, columns, graphics. Requires standard section headers.
2. Greenhouse - flexible header parsing, hybrid skill extraction, strictness 60%. More forgiving with formatting, good semantic matching.
3. Lever - AI-powered header parsing, semantic skill extraction, strictness 50%. Best at understanding context, modern formatting friendly.
4. iCIMS - strict header parsing, keyword-based skill extraction, strictness 85%. Very literal keyword matching, penalizes non-standard formats heavily.
5. Taleo (Oracle) - strict header parsing, keyword-based skill extraction, strictness 90%. Oldest and strictest, plain text works best, penalizes fancy formatting severely.
6. BambooHR - flexible header parsing, keyword-based skill extraction, strictness 70%. Mid-range strictness, decent at parsing most formats.
7. SmartRecruiters - AI-powered parsing, semantic skill extraction, strictness 40%. Very modern, handles most formats well, strong semantic understanding.
8. Jobvite - flexible header parsing, hybrid skill extraction, strictness 65%. Good at parsing, moderate keyword matching.
9. SAP SuccessFactors - strict parsing, keyword-based, strictness 85%. Enterprise-grade strictness, requires very clean formatting.
10. JazzHR - flexible parsing, keyword-based, strictness 55%. SMB-focused, reasonably forgiving.

For each ATS, provide:
- A score 0-100
- Pass (>=50) or Fail (<50)
- 2-3 specific issues this ATS would flag with this resume for this role
- 1 specific fix that would most improve the score on this platform

Respond with pure JSON only, no markdown, no preamble:

{
  "atsResults": [
    {
      "name": "Workday",
      "vendor": "Workday Inc.",
      "parsing": "strict",
      "skillMatch": "keyword-based",
      "strictness": 80,
      "score": <0-100>,
      "pass": <true|false>,
      "issues": ["<issue 1>", "<issue 2>", "<issue 3>"],
      "topFix": "<single most impactful fix for this ATS>"
    }
  ],
  "overallCompatibility": <average score 0-100>,
  "mostCompatible": "<name of ATS this resume scores highest on>",
  "leastCompatible": "<name of ATS this resume scores lowest on>",
  "universalFixes": ["<fix that improves score across all ATS>", "<fix 2>", "<fix 3>"]
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
    const form = formidable({ maxFileSize: 5 * 1024 * 1024 });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    const jdText = Array.isArray(fields.jd) ? fields.jd[0] : fields.jd;
    const resumeFile = Array.isArray(files.resume) ? files.resume[0] : files.resume;

    if (!jdText || !jdText.trim()) return res.status(400).json({ error: 'Job description is required' });
    if (!resumeFile) return res.status(400).json({ error: 'Resume file is required' });

    // Extract text from PDF or DOCX
    const resumeText = await extractResumeText(
      resumeFile.filepath,
      resumeFile.mimetype,
      resumeFile.originalFilename
    );

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ error: 'Could not extract text from file.' });
    }

    fs.unlinkSync(resumeFile.filepath);

    const prompt = ATS_PROMPT
      .replace('{{RESUME_TEXT}}', resumeText)
      .replace('{{JD_TEXT}}', jdText);

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) result = JSON.parse(jsonMatch[0]);
      else throw new Error('Failed to parse response as JSON');
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('ATS check error:', error);
    return res.status(500).json({ error: 'ATS check failed', details: error.message });
  }
}
