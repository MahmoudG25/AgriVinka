import { aiDiagnosisService, PROVIDERS } from '../../../services/firestore/aiDiagnosisService';
import { compressImage } from '../../plant-analyzer/services/imageUtils';

// Adapter to unify image model with existing analysis pipeline.
export const analyzePlantImage = async ({ imageFile, imageUrl, provider = PROVIDERS.OPENAI, language = 'ar' }) => {
  if (imageFile) {
    const compressed = await compressImage(imageFile, 1024, 0.8);
    return aiDiagnosisService.analyzePlantImage({
      provider,
      base64: compressed.base64,
      mimeType: compressed.mimeType,
      language,
    });
  }

  if (imageUrl) {
    // For URL-based images, we rely on service-level handling (may not compress).
    return aiDiagnosisService.analyzePlantImage({
      provider,
      imageUrl,
      language,
    });
  }

  throw new Error('No image payload provided for plant analysis');
};
