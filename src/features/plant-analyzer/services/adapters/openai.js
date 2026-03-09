import { SYSTEM_PROMPT, getLanguageInstruction, parseJsonResponse } from './prompts';

export const analyzeWithOpenAI = async ({ base64, mimeType, language = 'ar' }) => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error("VITE_OPENAI_API_KEY is not configured.");

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // or gpt-4o
      response_format: { type: 'json_object' },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze this plant. ${getLanguageInstruction(language)}` },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
          ]
        }
      ]
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API Error: ${response.status} - ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data.choices[0]?.message?.content || "{}";

  return parseJsonResponse(rawText);
};
