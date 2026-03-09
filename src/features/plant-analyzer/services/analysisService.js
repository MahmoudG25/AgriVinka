import { analyzeWithOpenAI } from './adapters/openai';
import { analyzeWithGemini } from './adapters/gemini';
import { analyzeWithGrok } from './adapters/grok';

export const PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  GROK: 'grok'
};

/**
 * Main entry point for analyzing plant images.
 * Routes the request to the selected provider adapter.
 * 
 * @param {Object} params
 * @param {string} params.provider - The chosen AI provider (openai, gemini, grok)
 * @param {string} params.base64 - Base64 encoded image data (without prefix)
 * @param {string} params.mimeType - MIME type of the image (e.g., 'image/jpeg')
 * @param {string} [params.language='ar'] - Language for the response
 * @returns {Promise<Object>} The analysis result containing diagnosis, causes, careSteps, etc.
 */
export const analyzePlantImage = async ({ provider, base64, mimeType, language = 'ar' }) => {
  switch (provider) {
    case PROVIDERS.OPENAI:
      return await analyzeWithOpenAI({ base64, mimeType, language });
    case PROVIDERS.GEMINI:
      return await analyzeWithGemini({ base64, mimeType, language });
    case PROVIDERS.GROK:
      return await analyzeWithGrok({ base64, mimeType, language });
    default:
      throw new Error(`Unsupported AI Provider: ${provider}`);
  }
};
