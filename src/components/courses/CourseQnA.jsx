import React, { useState, useEffect } from 'react';
import { useAuth } from '../../app/contexts/AuthContext';
import { commentService } from '../../services/firestore/commentService';
import toast from 'react-hot-toast';
import { FaReply, FaTrashAlt, FaPaperPlane, FaUserCircle } from 'react-icons/fa';

export const CourseQnA = ({ lessonId }) => {
  const { currentUser, userData, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  useEffect(() => {
    if (lessonId) loadComments();
  }, [lessonId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await commentService.getCommentsByLesson(lessonId);
      setComments(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل الأسئلة');
    } finally {
      setLoading(false);
    }
  };

  const checkRateLimit = () => {
    const lastTime = localStorage.getItem('last_comment_time');
    if (lastTime) {
      const diff = new Date().getTime() - new Date(parseInt(lastTime)).getTime();
      if (diff < 10000) { // 10 seconds restriction
        const remaining = Math.ceil((10000 - diff) / 1000);
        toast.error(`يرجى الانتظار ${remaining} ثواني قبل التعليق مرة أخرى.`);
        return false;
      }
    }
    return true;
  };

  const setRateLimit = () => {
    localStorage.setItem('last_comment_time', new Date().getTime().toString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    if (!checkRateLimit()) return;

    setSubmitting(true);
    try {
      const userName = userData?.displayName || currentUser?.displayName || 'مستخدم';
      const userAvatar = currentUser?.photoURL || '';
      
      await commentService.addComment(lessonId, currentUser.uid, userName, userAvatar, newComment);
      setNewComment('');
      setRateLimit();
      await loadComments();
      toast.success('تمت إضافة تعليقك بنجاح');
    } catch (error) {
       toast.error('لم نتمكن من الحفظ، حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId) => {
    if (!replyText.trim() || !currentUser) return;
    if (!checkRateLimit()) return;

    setSubmitting(true);
    try {
      const userName = userData?.displayName || currentUser?.displayName || 'مستخدم';
      const userAvatar = currentUser?.photoURL || '';

      await commentService.addComment(lessonId, currentUser.uid, userName, userAvatar, replyText, parentId);
      setReplyText('');
      setReplyingTo(null);
      setRateLimit();
      await loadComments();
      toast.success('تم إضافة الرد بنجاح');
    } catch (error) {
      toast.error('لم يتم النشر، حاول مجدداً');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId, parentId = null) => {
    if(!window.confirm('هل أنت متأكد من حذف هذا التعليق؟')) return;
    try {
      await commentService.deleteComment(commentId, parentId);
      await loadComments();
      toast.success('تم الحذف بنجاح');
    } catch(err) {
      toast.error('خطأ أثناء الحذف');
    }
  };

  const renderComment = (comment, isReply = false) => {
    const isOwnerOrAdmin = isAdmin || currentUser?.uid === comment.userId;
    return (
      <div key={comment.id} className={`flex gap-4 ${isReply ? 'mt-4 mr-10 relative before:absolute before:content-[""] before:bg-gray-200 before:w-6 before:h-[2px] before:-right-8 before:top-6 before:rounded-full after:absolute after:content-[""] after:bg-gray-200 after:w-[2px] after:h-[calc(100%+16px)] after:-right-8 after:-top-4 after:rounded-full' : 'mt-6 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm'}`}>
        <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary z-10 border-2 border-white shadow-sm">
          {comment.userAvatar ? (
            <img src={comment.userAvatar} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold">{comment.userName?.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 w-full relative">
          <div className={`flex items-baseline justify-between ${isReply ? 'mb-1' : 'mb-2'}`}>
            <h5 className="font-bold text-[14px] text-gray-800">{comment.userName}</h5>
            <span className="text-[11px] text-gray-400 font-medium">
              {new Date(comment.createdAt).toLocaleDateString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <p className="text-[14px] text-gray-600 leading-relaxed font-medium">
            {comment.content}
          </p>
          <div className="flex items-center gap-4 mt-3">
            {!isReply && (
              <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[12px] font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5">
                <FaReply /> رد
              </button>
            )}
            {isOwnerOrAdmin && (
              <button onClick={() => handleDelete(comment.id, comment.parentId)} className="text-[12px] font-bold text-red-400 hover:text-red-500 transition-colors flex items-center gap-1.5 z-10 relative">
                <FaTrashAlt /> حذف
              </button>
            )}
          </div>

          {/* Reply Input Box */}
          {replyingTo === comment.id && !isReply && (
            <div className="mt-4 flex gap-3 z-10 relative">
              <input
                type="text"
                placeholder="أضف رداً..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl px-4 py-2outline-none"
              />
              <button 
                onClick={() => handleReplySubmit(comment.id)}
                disabled={submitting || !replyText.trim()}
                className="bg-primary hover:bg-accent text-white px-4 rounded-xl flex items-center justify-center font-bold text-sm transition-colors shadow-md disabled:opacity-50"
              >
                إرسال
              </button>
            </div>
          )}

          {/* Child Replies */}
          {comment.replies?.length > 0 && (
            <div className="relative mt-2 z-10">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="py-10 text-center text-gray-400 text-sm font-bold">جاري تحميل الأسئلة...</div>;
  }

  return (
    <div className="animate-fade-in w-full pb-10">
      {/* Thread Add */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">forum</span>
          الأسئلة والأجوبة ({comments.length})
        </h3>
        
        {currentUser ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <textarea
              placeholder="هل لديك سؤال أو استفسار حول هذا الدرس؟"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 hover:bg-gray-50 focus:bg-white focus:border-primary rounded-2xl px-5 py-4 text-sm outline-none transition-all custom-scrollbar resize-none font-medium text-gray-700"
              rows={3}
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="bg-primary hover:bg-accent focus:ring-4 focus:ring-primary/20 text-white font-bold rounded-xl px-6 py-2.5 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <FaPaperPlane /> إرسال السؤال
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-orange-50 text-orange-600 p-4 rounded-xl text-sm font-bold border border-orange-100 text-center">
            يرجى تسجيل الدخول لتتمكن من إضافة الأسئلة والمشاركة في النقاش.
          </div>
        )}
      </div>

      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-400">
           <span className="material-symbols-outlined text-[64px] mb-4 opacity-30 text-gray-300">chat_bubble_outline</span>
           <p className="text-lg font-bold text-gray-600 mb-1">لا توجد أسئلة بعد</p>
           <p className="text-sm font-medium">كن أول من يسأل حول هذا الدرس!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map(c => renderComment(c, false))}
        </div>
      )}
    </div>
  );
};
