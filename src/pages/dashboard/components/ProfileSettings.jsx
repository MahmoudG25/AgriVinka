import React, { useState, useRef } from 'react';
import { useAuth } from '../../../app/contexts/AuthContext';
import { userService } from '../../../services/firestore/userService';
import { cloudinaryService } from '../../../services/cloudinary';
import { logger } from '../../../utils/logger';

const ProfileSettings = () => {
  const { currentUser, userData } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await userService.updateProfile(currentUser.uid, { displayName, bio, phone });
      showMessage('✅ تم حفظ التغييرات بنجاح');
      setIsEditing(false);
    } catch (error) {
      logger.error('Error saving profile:', error);
      showMessage('❌ حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
    // Upload
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    try {
      const url = await cloudinaryService.uploadFile(file, 'Namaa-Academy/avatars');
      await userService.updateProfile(currentUser.uid, { photoURL: url });
      showMessage('✅ تم تحديث الصورة بنجاح');
      setPreviewUrl(null); // Clear preview, real URL is now in userData
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      showMessage('❌ حدث خطأ أثناء رفع الصورة');
      setPreviewUrl(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const avatarSrc = previewUrl || userData?.photoURL;

  return (
    <div id="profile" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-bold text-heading-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">person</span>
          الملف الشخصي
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            تعديل
          </button>
        )}
      </div>

      {/* Toast */}
      {message && (
        <div className={`mb-4 p-3 rounded-xl text-xs font-bold text-center transition-all ${message.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
          }`}>
          {message}
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Avatar upload with preview */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                    {userData?.displayName?.[0] || 'ن'}
                  </div>
                )}
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent" />
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${uploadingAvatar
                  ? 'bg-gray-100 text-gray-400 cursor-wait'
                  : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
              >
                {uploadingAvatar ? 'جاري الرفع...' : 'تغيير الصورة'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploadingAvatar}
              />
              <p className="text-[10px] text-gray-400 mt-1">JPG, PNG — أقصى حجم 5MB</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">الاسم</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all outline-none"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {/* Email (readonly) */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">البريد الإلكتروني</label>
            <input
              type="email"
              disabled
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-sm font-medium cursor-not-allowed"
              value={userData?.email || ''}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">رقم الهاتف</label>
            <input
              type="tel"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+20 10x xxx xxxx"
              dir="ltr"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">نبذة شخصية</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all outline-none resize-none"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب نبذة قصيرة عن نفسك..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-heading-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setDisplayName(userData?.displayName || '');
                setBio(userData?.bio || '');
                setPhone(userData?.phone || '');
                setPreviewUrl(null);
              }}
              className="px-4 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {/* Avatar display */}
          <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-primary flex items-center justify-center shrink-0 border-2 border-primary/10">
              {userData?.photoURL ? (
                <img src={userData.photoURL} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
              ) : (
                <span className="text-lg font-bold text-white">{userData?.displayName?.[0] || 'ن'}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-heading-dark truncate">{userData?.displayName || '-'}</p>
              <p className="text-[10px] text-gray-400 truncate" dir="ltr">{userData?.email}</p>
            </div>
          </div>

          {/* Fields */}
          {userData?.phone && (
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">رقم الهاتف</span>
              <p className="text-sm text-heading-dark font-medium" dir="ltr">{userData.phone}</p>
            </div>
          )}
          {userData?.bio && (
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">نبذة شخصية</span>
              <p className="text-sm text-heading-dark leading-relaxed">{userData.bio}</p>
            </div>
          )}
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">تاريخ الانضمام</span>
            <p className="text-sm text-heading-dark font-medium">
              {userData?.createdAt?.seconds
                ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                : '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
