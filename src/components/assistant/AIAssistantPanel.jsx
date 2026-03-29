import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../app/contexts/AuthContext';
import { aiAssistantService } from '../../features/ai-assistant/services/aiAssistantService';
import { aiSessionService } from '../../services/firestore/aiSessionService';
import { aiAdminService } from '../../services/firestore/aiAdminService';
import { useAiSettings } from '../../hooks/useAiSettings';
import { toast } from 'react-hot-toast';
import { FaMicrophone, FaCamera, FaUpload, FaStopCircle } from 'react-icons/fa';
import { FiPaperclip, FiArrowUp, FiVolume2, FiSquare, FiAlertCircle } from 'react-icons/fi';

const baseUserMessage = (text) => ({
  id: `u-${Date.now()}-${Math.random().toString(36).substring(2)}`,
  sender: 'user',
  text,
  createdAt: new Date().toISOString(),
});

const baseAiMessage = (text, payload = null) => ({
  id: `a-${Date.now()}-${Math.random().toString(36).substring(2)}`,
  sender: 'assistant',
  text,
  payload,
  createdAt: new Date().toISOString(),
});

const AIAssistantPanel = ({ initialSessionId = null, onClose, conversationId = null, conversationTitle = 'محادثة جديدة', onSessionCreated, onSessionUpdated }) => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;
  const {
    isAssistantEnabled,
    isLimitReached,
    imageEnabled,
    voiceInEnabled,
    voiceOutEnabled,
    getBlockReason,
  } = useAiSettings();

  const [sessionId, setSessionId] = useState(conversationId || initialSessionId);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  // Audio & Speech States
  const [isListening, setIsListening] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const textareaRef = useRef(null);
  const attachMenuRef = useRef(null);
  const recognitionRef = useRef(null);

  const canSend = useMemo(
    () => (inputText.trim().length > 0 || selectedImage) && !isProcessing && isAssistantEnabled && !isLimitReached,
    [inputText, selectedImage, isProcessing, isAssistantEnabled, isLimitReached]
  );

  // STT (Microphone) Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop when user stops talking
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'ar-SA'; // Arabic default

      recognitionRef.current.onresult = (event) => {
        // Find if there is a final transcript
        let interimTranscript = '';
        let finalTrans = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTrans) {
          setInputText((prev) => (prev ? prev + ' ' + finalTrans : finalTrans));
        }
      };

      recognitionRef.current.onerror = (event) => {
        if (event.error === 'not-allowed') {
          toast.error('يرجى السماح بالوصول للميكروفون لاستخدام الإدخال الصوتي.');
        } else if (event.error === 'no-speech') {
          toast.error('لم يتم اكتشاف أي صوت.');
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      // Cleanup TTS on unmount
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      setMessages([]);
    }
  }, [isInitialized]);

  useEffect(() => {
    let isMounted = true;
    const fetchMessages = async () => {
      if (conversationId && uid) {
        setSessionId(conversationId);
        setIsLoadingMessages(true);
        const msgs = await aiSessionService.getMessages(uid, conversationId);
        if (isMounted) {
          setMessages(msgs);
          setIsLoadingMessages(false);
        }
      } else {
        setSessionId(initialSessionId);
        setMessages([]);
        setIsLoadingMessages(false);
      }
      
      setInputText('');
      clearImage();
      // stop playback if switching chats
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingMsgId(null);
    };

    fetchMessages();
    return () => { isMounted = false; };
  }, [conversationId, uid, initialSessionId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isProcessing, isLoadingMessages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 160;
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [inputText]);

  // Handle clicking outside the attach dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target)) {
        setIsAttachMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const appendMessage = (msg) => setMessages((prev) => [...prev, msg]);

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleImageSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار صورة صالحة');
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const processAssistant = async (text, imageFile = null) => {
    if (!uid) {
      toast.error('الرجاء تسجيل الدخول لاستخدام المساعد الذكي.');
      return;
    }

    // ── Feature gate check ─────────────────────────────────────────────────
    const blockReason = getBlockReason(!!imageFile, false);
    if (blockReason) {
      appendMessage(baseAiMessage(blockReason));
      return;
    }

    const userMessageObj = baseUserMessage(text || (imageFile ? 'تم إرفاق صورة للفحص 📸' : ''));
    if (imageFile) {
      userMessageObj.imageUrl = URL.createObjectURL(imageFile);
    }
    appendMessage(userMessageObj);

    setIsProcessing(true);
    setInputText('');
    clearImage();

    // Stop speaking and listening if a new response is calculating
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlayingMsgId(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    try {
      const result = await aiAssistantService.processInput({
        userId: uid || 'demo-user',
        sessionId,
        text: text || '',
        imageFile,
      });

      if (result?.sessionId && result.sessionId !== sessionId) {
        setSessionId(result.sessionId);
        if (onSessionCreated && result.session) {
           onSessionCreated(result.session);
        }
      } else if (result?.session?.isTitleUpdated && onSessionUpdated) {
        onSessionUpdated(result.session);
      }

      const replyText = result?.text || 'تمت المعالجة بنجاح.';
      const assistantMsg = baseAiMessage(replyText, result);
      appendMessage(assistantMsg);

      // Increment usage counter (non-blocking)
      if (uid) aiAdminService.incrementUserUsage(uid);

      if (result?.analysisResult) toast.success('تم الحصول على نتيجة التشخيص.');
    } catch (err) {
      console.error('AIAssistantPanel error', err);
      setTimeout(() => {
        appendMessage(baseAiMessage("عذراً، حدث خطأ في الاتصال بالخادم. يرجى المحاولة لاحقاً."));
        setIsProcessing(false);
      }, 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = () => {
    if (!canSend) return;
    processAssistant(inputText.trim(), selectedImage);
  };

  // TTS Toggle
  const toggleSpeech = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      toast.error('المتصفح الذي تستخدمه لا يدعم ميزة النطق الصوتي.');
      return;
    }

    if (playingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setPlayingMsgId(null);
    } else {
      window.speechSynthesis.cancel(); // Stop anything else currently playing
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-SA';
      utterance.rate = 1.0;
      
      utterance.onend = () => setPlayingMsgId(null);
      utterance.onerror = () => setPlayingMsgId(null);
      
      window.speechSynthesis.speak(utterance);
      setPlayingMsgId(msgId);
    }
  };

  // STT Toggle
  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('المتصفح لا يدعم خاصية التحدث الصوتي.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      toast('تم إيقاف الميكروفون', { icon: '🎤' });
    } else {
      recognitionRef.current.start();
      toast('جارٍ الاستماع...', { icon: '🎧' });
      setIsListening(true);
    }
  };

  const isEmptySpace = messages.length === 0 && !isProcessing;

  // ── Blocked banner (assistant disabled or limit reached) ──────────────────
  const globalBlockReason = !isAssistantEnabled
    ? (!uid ? null : getBlockReason(false, false))
    : isLimitReached
    ? getBlockReason(false, false)
    : null;

  return (
    <div className="flex h-full w-full flex-col bg-slate-50 relative">

      {/* Global blocked banner */}
      {globalBlockReason && (
        <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm" dir="rtl">
          <FiAlertCircle className="mt-0.5 shrink-0 text-amber-500" size={18} />
          <p className="leading-relaxed font-medium">{globalBlockReason}</p>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef} 
        className={`flex-1 overflow-y-auto px-4 sm:px-6 custom-scrollbar ${isEmptySpace ? 'flex flex-col items-center justify-center' : 'pt-6 pb-24'}`}
      >
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <span className="flex gap-1.5 opacity-60">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></span>
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></span>
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary"></span>
            </span>
          </div>
        ) : isEmptySpace ? (
          <div className="flex flex-col items-center justify-center text-center -mt-20">
            <h1 className="mb-8 text-3xl font-bold md:text-4xl text-gray-800">كيف يمكنني مساعدتك؟</h1>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[760px] space-y-7">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {isUser ? (
                    <div className="max-w-[80%] rounded-3xl bg-primary px-5 py-4 text-white shadow-sm relative group overflow-hidden">
                      {msg.imageUrl && (
                        <div className="mb-3 relative w-full sm:w-[280px] rounded-xl overflow-hidden shadow-sm border border-white/20">
                          <img src={msg.imageUrl} alt="مرفق المستخدم" className="w-full h-auto object-cover max-h-[300px]" />
                        </div>
                      )}
                      {msg.text && <p className="whitespace-pre-wrap text-[15.5px] leading-relaxed font-medium text-white">{msg.text}</p>}
                    </div>
                  ) : (
                    <div className="flex w-full max-w-[85%] items-start gap-4 group">
                      {/* Avatar for assistant */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-primary mt-1">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                      </div>
                      <div className="min-w-0 flex-1 text-gray-800 rounded-3xl bg-[#f4f4f4] px-5 py-4 border border-gray-100 shadow-sm">
                        <p className="whitespace-pre-wrap text-[15.5px] leading-relaxed">{msg.text}</p>
                        
                        {/* AI Message Action Menu (Read Aloud) */}
                        {voiceOutEnabled && (
                          <div className="mt-2 flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => toggleSpeech(msg.id, msg.text)} 
                              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${playingMsgId === msg.id ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                              title={playingMsgId === msg.id ? "إيقاف القراءة" : "اقرأ بصوت عالٍ"}
                            >
                              {playingMsgId === msg.id ? <FiSquare size={14} className="fill-current text-primary" /> : <FiVolume2 size={15} />}
                              <span className={playingMsgId === msg.id ? "text-primary font-bold" : "hidden sm:inline-block"}>
                                {playingMsgId === msg.id ? 'إيقاف..' : 'استمع'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {isProcessing && (
              <div className="flex w-full items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 text-primary">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                </div>
                <div className="flex items-center h-8">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                  </span>
                </div>
              </div>
            )}
            <div className="h-6" />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`w-full px-4 sm:px-6 z-10 transition-all ${isEmptySpace ? 'mb-auto mt-[-20px] pb-10' : 'sticky bottom-0 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent pb-6 pt-4'}`}>
        <div className="mx-auto w-full max-w-[760px]">
          {previewUrl && (
            <div className="mb-3 flex items-center gap-3">
              <div className="relative inline-block">
                <img src={previewUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover shadow-sm border border-gray-200" />
                <button
                  onClick={clearImage}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gray-800 text-xs text-white hover:bg-gray-700 shadow-md"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          <div className={`relative flex w-full items-end gap-2 rounded-[26px] border bg-white px-3 py-2.5 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20 ${isListening ? 'border-red-400 ring-2 ring-red-100 shadow-red-100' : 'border-gray-300 focus-within:border-primary'}`}>
            
            {/* Attachment Icons & Dropdown */}
            <div className="relative flex shrink-0 items-center justify-center h-[38px] pb-0.5 sm:pb-0 pr-1 flex-row-reverse gap-1" ref={attachMenuRef}>
              <div className="relative">
                <button
                  onClick={() => setIsAttachMenuOpen((p) => !p)}
                  className={`flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors ${
                    isAttachMenuOpen ? 'bg-primary text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                  title="إرفاق ملف"
                >
                  <FiPaperclip className="h-5 w-5" />
                </button>

                {/* Dropdown Menu (Upwards) */}
                {isAttachMenuOpen && (
                  <div className="absolute bottom-full right-0 mb-3 w-48 rounded-xl bg-white py-2 shadow-xl border border-gray-100 ring-1 ring-black/5 z-50 overflow-hidden transform origin-bottom-right transition-all">
                    <button
                      onClick={() => {
                        setIsAttachMenuOpen(false);
                        // Small timeout to allow DOM interaction before unmount (although inputs are out now)
                        setTimeout(() => fileInputRef.current?.click(), 0);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-right text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      dir="rtl"
                    >
                      <FaUpload className="h-[16px] w-[16px] text-gray-500" />
                      <span className="font-medium">رفع صورة</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsAttachMenuOpen(false);
                        setTimeout(() => cameraInputRef.current?.click(), 0);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-right text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      dir="rtl"
                    >
                      <FaCamera className="h-[16px] w-[16px] text-gray-500" />
                      <span className="font-medium">التقاط صورة</span>
                    </button>
                  </div>
                )}
                
                {/* Hidden File Inputs MUST be outside the conditional rendering menu! */}
                <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => handleImageSelect(e.target.files?.[0])} />
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={(e) => handleImageSelect(e.target.files?.[0])} />
              </div>

              {/* Microphone STT Button */}
              <button
                onClick={voiceInEnabled ? toggleListening : () => toast.error('ميزة الإدخال الصوتي معطّلة حالياً.')}
                disabled={!voiceInEnabled}
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-full transition-all hidden sm:flex ${
                  !voiceInEnabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isListening
                    ? 'bg-red-50 text-red-500 animate-pulse ring-2 ring-red-200'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
                title={voiceInEnabled ? 'إدخال صوتي' : 'الإدخال الصوتي معطّل'}
              >
                {isListening ? <FaStopCircle className="h-[17px] w-[17px]" /> : <FaMicrophone className="h-[16px] w-[16px]" />}
              </button>
            </div>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => { 
                if (e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  handleSend(); 
                } 
              }}
              placeholder={isListening ? "جاري الاستماع، تحدث الآن..." : "اكتب رسالتك هنا..."}
              rows={1}
              className={`flex-1 max-h-40 min-h-[26px] resize-none overflow-y-auto bg-transparent py-1.5 px-2 text-[15.5px] leading-relaxed focus:outline-none custom-scrollbar ${isListening ? 'text-red-700 placeholder-red-400 font-medium' : 'text-gray-800'}`}
              style={{ paddingBottom: '8px' }}
              dir="auto"
            />

            {/* Send Button */}
            <div className="flex shrink-0 items-center justify-center h-[38px] pb-0.5 sm:pb-0 pl-1">
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={`flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors ${
                  canSend
                    ? 'bg-accent text-white hover:bg-accent-hover shadow-sm'
                    : 'bg-gray-200 text-white cursor-not-allowed'
                }`}
              >
                <FiArrowUp className="h-5 w-5" strokeWidth={2.5} />
              </button>
            </div>
            
          </div>
          
          <div className="mt-2 text-center text-xs text-gray-400 font-medium">
            يستخدم المساعد الذكي تقنيات التعرف الصوتي الحديثة. يُرجى التحدث بوضوح للحصول على أفضل النتائج.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPanel;
