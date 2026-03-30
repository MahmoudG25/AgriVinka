import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/contexts/AuthContext';
import { noteService } from '../../services/firestore/noteService';
import toast from 'react-hot-toast';
import { FaSave, FaCheckCircle } from 'react-icons/fa';

export const CourseNotes = ({ lessonId }) => {
  const { currentUser } = useAuth();
  const [noteContent, setNoteContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (lessonId && currentUser) loadNote();
  }, [lessonId, currentUser]);

  const loadNote = async () => {
    setLoading(true);
    try {
      const content = await noteService.getNote(currentUser.uid, lessonId);
      setNoteContent(content);
      if (content) setLastSaved(new Date());
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل ملاحظاتك');
    } finally {
      setLoading(false);
    }
  };

  const checkRateLimit = () => {
    const lastTime = localStorage.getItem('last_note_save_time');
    if (lastTime) {
      const diff = new Date().getTime() - new Date(parseInt(lastTime)).getTime();
      if (diff < 5000) { // 5 seconds restriction for notes (slightly shorter)
        const remaining = Math.ceil((5000 - diff) / 1000);
        toast.error(`يرجى الانتظار ${remaining} ثواني قبل الحفظ مرة أخرى.`);
        return false;
      }
    }
    return true;
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!currentUser) return;
    if (!checkRateLimit()) return;

    setSaving(true);
    try {
      await noteService.saveNote(currentUser.uid, lessonId, noteContent);
      localStorage.setItem('last_note_save_time', new Date().getTime().toString());
      setLastSaved(new Date());
      toast.success('تمت حفظ الملاحظات');
    } catch (error) {
      toast.error('لم نتمكن من حفظ الملاحظات');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-orange-50 text-orange-600 p-6 rounded-2xl text-center border border-orange-100 font-bold mb-10 w-full animate-fade-in shadow-sm">
        <span className="material-symbols-outlined text-[48px] opacity-70 mb-3 text-orange-400">lock</span>
        <p className="text-xl font-bold mb-2 text-orange-800">سجل الدخول لحفظ ملاحظاتك</p>
        <p className="text-sm font-medium">ميزة تدوين الملاحظات الشخصية تتطلب إنشاء حساب لتتمكن من العودة إليها لاحقاً.</p>
      </div>
    );
  }

  if (loading) {
     return <div className="py-10 text-center text-gray-400 text-sm font-bold w-full">جاري تحميل تدويناتك...</div>;
  }

  return (
    <div className="animate-fade-in w-full pb-10">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-4 flex flex-col items-start gap-4 h-full relative group">
        
        <div className="w-full flex items-center justify-between">
           <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
             <span className="material-symbols-outlined text-primary">edit_note</span>
             الملزمة الخاصة بي
           </h3>
           
           {lastSaved && (
             <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 transition-opacity opacity-100 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
               <FaCheckCircle className="text-green-500" /> آخر حفظ: {lastSaved.toLocaleTimeString('ar-EG', { hour: '2-digit', minute:'2-digit' })}
             </span>
           )}
        </div>

        <p className="text-sm text-gray-400 font-bold max-w-lg leading-relaxed mb-2">قم بتدوين أية أفكار أو نقاط هامة تستفيد منها أثناء مشاهدة الفيديو. فقط أنت يمكنك قراءة هذه الملاحظات في أي وقت تعود فيه لهذا الدرس.</p>

        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="دوّن ملاحظاتك هنا (مثال: يتم خلط محلول أ أولاً ثم محلول ب لتفادي ترسب الكالسيوم...)"
          className="w-full flex-1 min-h-[300px] bg-[#F7F6F1] border-2 border-[#EAE8E0] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl px-6 py-6 text-[15px] outline-none transition-all custom-scrollbar resize-y text-gray-800 font-medium leading-loose relative focus:shadow-md"
        />

        <div className="w-full flex justify-end mt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-accent focus:ring-4 focus:ring-primary/20 text-white font-bold rounded-2xl px-8 py-3 transition-all shadow-md flex items-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed group"
          >
            {saving ? (
              <span className="animate-spin block w-4 h-4 border-2 border-white border-t-transparent rounded-full font-bold"></span>
            ) : (
              <FaSave className="text-lg group-hover:scale-110 transition-transform" />
            )}
            حفظ الآن
          </button>
        </div>
      </div>
    </div>
  );
};
