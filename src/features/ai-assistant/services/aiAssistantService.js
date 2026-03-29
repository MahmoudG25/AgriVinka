import { detectIntent, isAffirmative, isNegative } from './intentService';
import { analyzePlantImage } from './diagnosisAdapter';
import { aiSessionService } from '../../../services/firestore/aiSessionService';
import { aiAdminService } from '../../../services/firestore/aiAdminService';
import { aiDiagnosisService, PROVIDERS } from '../../../services/firestore/aiDiagnosisService';
import { courseService } from '../../../services/firestore/courseService';
import { compressImage } from '../../plant-analyzer/services/imageUtils';
import { logger } from '../../../utils/logger';

const CHAT_PLACEHOLDER = 'مرحبا! كيف يمكنني مساعدتك اليوم؟';

const buildMessage = (from, text, payload = null) => ({
  sender: from,
  text,
  payload,
  createdAt: new Date().toISOString(),
});

const formatCourseRecommendations = (courses) => {
  if (!courses || courses.length === 0) return 'لم يتم العثور على دورات مناسبة حالياً. ولكن بإمكانك تصفح قسم الدورات لتجد ما يناسبك.';
  const lines = courses.slice(0, 3).map((course, idx) => `${idx + 1}. ${course.title || course.name || 'دورة غير مسماة'}`);
  return [`لقد وجدت هذه الدورات المناسبة لك:`, ...lines, 'يمكنك زيارة صفحة الدورات للحصول على المزيد من التفاصيل.'].join('\n');
};

const createAssistantResponse = async ({ userId, sessionId, intent, text, imageFile, imageUrl }) => {
  if (intent === 'plant_analysis') {
    if (!imageFile && !imageUrl) {
      await aiSessionService.updateSession(userId, sessionId, {
        state: 'awaiting_plant_image',
        pendingAction: 'awaiting_plant_image',
        pendingData: { userMessage: text || '' },
      });

      return {
        type: 'prompt',
        text: 'من فضلك أرسل صورة للنبات أو الورقة التي تريد تحليلها حتى أستطيع مساعدتك بشكل أفضل.',
      };
    }

    // Run diagnosis for provided image
    let analysisResult;
    try {
      if (imageFile) {
        analysisResult = await analyzePlantImage({ imageFile, provider: PROVIDERS.OPENAI, language: 'ar' });
      } else {
        analysisResult = await analyzePlantImage({ imageUrl, provider: PROVIDERS.OPENAI, language: 'ar' });
      }
    } catch (error) {
      logger.error('assistant plant_analysis failed', error);
      return {
        type: 'error',
        text: 'عذراً، حدث خطأ أثناء تحليل الصورة. حاول مرة أخرى أو أرسل صورة أوضح.',
      };
    }

    // Save scan history if user is authenticated
    if (userId && imageFile) {
      try {
        const compressed = await compressImage(imageFile, 1024, 0.8);
        await aiDiagnosisService.saveScanHistory(userId, {
          base64: compressed.base64,
          mimeType: compressed.mimeType,
        }, PROVIDERS.OPENAI, analysisResult);
      } catch (saveErr) {
        logger.error('assistant saveScanHistory failed', saveErr);
      }
    }

    await aiSessionService.updateSession(userId, sessionId, {
      state: 'idle',
      pendingAction: null,
      pendingData: null,
      lastIntent: 'plant_analysis',
    });

    const responseText = `هذا ما وجدته في التشخيص:\n- التشخيص: ${analysisResult.diagnosis || 'غير محدد'}\n- الثقة: ${analysisResult.confidence || 'غير متوفر'}\n- الأسباب المحتملة: ${(analysisResult.causes || []).join(', ') || 'غير متوفر'}`;

    return {
      type: 'diagnosis',
      text: responseText,
      analysisResult,
    };
  }

  if (intent === 'course_recommendation') {
    let recCourses = [];
    try {
      const data = await courseService.getPublishedCourses(4);
      recCourses = data.courses || [];
    } catch (courseErr) {
      logger.error('assistant course recommendation failed', courseErr);
    }

    await aiSessionService.updateSession(userId, sessionId, {
      state: 'idle',
      pendingAction: null,
      pendingData: null,
      lastIntent: 'course_recommendation',
    });

    return {
      type: 'course_recommendation',
      text: formatCourseRecommendations(recCourses),
      courses: recCourses,
    };
  }

  // General fallback
  await aiSessionService.updateSession(userId, sessionId, {
    state: 'idle',
    pendingAction: null,
    pendingData: null,
    lastIntent: 'general_question',
  });

  const base = 'يمكنني مساعدتك في تشخيص الأمراض النباتية من خلال صورة، أو اقتراح الدورات، أو الإجابة عن الاستفسارات الزراعية العامة.';
  const follow = isAffirmative(text) ? 'هل ترغب بمشاركة صورة للنبات الآن؟' : 'ما هو السؤال الذي تود الإجابة عنه؟';

  return {
    type: 'general_question',
    text: `${base} ${follow}`,
  };
};

export const aiAssistantService = {
  initSession: async (userId) => {
    if (!userId) {
      throw new Error('User must be authenticated to initiate AI assistant session');
    }
    return aiSessionService.createSession(userId);
  },

  getSession: async (userId, sessionId) => {
    if (!userId || !sessionId) return null;
    return aiSessionService.getSession(userId, sessionId);
  },

  processInput: async ({ userId, sessionId = null, text = '', imageFile = null, imageUrl = null }) => {
    if (!userId) {
      throw new Error('User is required to use the AI assistant. Please log in.');
    }

    let session = null;
    let isNewSession = false;
    if (sessionId) {
      session = await aiSessionService.getSession(userId, sessionId);
    }
    
    // Auto-generate title logic
    const generatedTitle = text ? text.split(' ').slice(0, 4).join(' ') + (text.split(' ').length > 4 ? '...' : '') : (imageFile || imageUrl ? 'فحص نبات' : 'محادثة جديدة');

    if (!session) {
      session = await aiSessionService.createSession(userId, generatedTitle);
      sessionId = session.id;
      isNewSession = true;
    } else if (session.title === 'محادثة جديدة' && generatedTitle !== 'محادثة جديدة') {
      await aiSessionService.updateSession(userId, sessionId, { title: generatedTitle });
      session.title = generatedTitle;
      session.isTitleUpdated = true; // flag to notify UI
    }

    // Append user message
    const userMessageText = text || (imageFile || imageUrl ? 'تم إرسال صورة' : '');
    await aiSessionService.addMessage(userId, sessionId, buildMessage('user', userMessageText, { hasImage: Boolean(imageFile || imageUrl) }));

    // If a pending action is waiting for image, handle that first
    if (session.pendingAction === 'awaiting_plant_image') {
      if (!imageFile && !imageUrl) {
        const assistantReply = buildMessage('assistant', 'لا يزال بإمكاني مساعدتك، يرجى إرسال صورة النبات لبدء التشخيص.');
        await aiSessionService.addMessage(userId, sessionId, assistantReply);
        return { sessionId, session: await aiSessionService.getSession(userId, sessionId), reply: assistantReply };
      }

      const analysisOutput = await createAssistantResponse({ userId, sessionId, intent: 'plant_analysis', text: userMessageText, imageFile, imageUrl });
      const assistantMessage = buildMessage('assistant', analysisOutput.text, { type: analysisOutput.type, analysisResult: analysisOutput.analysisResult });
      await aiSessionService.addMessage(userId, sessionId, assistantMessage);
      return { sessionId, session: await aiSessionService.getSession(userId, sessionId), ...analysisOutput, reply: assistantMessage };
    }

    const { intent } = detectIntent({ text, hasImage: Boolean(imageFile || imageUrl) });

    const analysisOutput = await createAssistantResponse({ userId, sessionId, intent, text, imageFile, imageUrl });

    const assistantMessage = buildMessage('assistant', analysisOutput.text, { type: analysisOutput.type, analysisResult: analysisOutput.analysisResult, courses: analysisOutput.courses });
    await aiSessionService.addMessage(userId, sessionId, assistantMessage);

    // Non-blocking activity log
    aiAdminService.writelog(userId, {
      intent,
      type: imageFile ? 'image' : 'text',
      sessionId,
    });

    return { sessionId, session: await aiSessionService.getSession(userId, sessionId), intent, ...analysisOutput, reply: assistantMessage };
  },
};
