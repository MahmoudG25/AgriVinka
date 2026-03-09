import { SYSTEM_PROMPT, getLanguageInstruction, parseJsonResponse } from './prompts';

export const analyzeWithGemini = async ({ base64, mimeType, language = 'ar' }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("VITE_GEMINI_API_KEY is not configured.");

  // Using the REST API natively so no external SDK required.
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [{
        parts: [
          { text: `Analyze this plant. ${getLanguageInstruction(language)}` },
          { inline_data: { mime_type: mimeType, data: base64 } }
        ]
      }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";

  return parseJsonResponse(rawText);
};
