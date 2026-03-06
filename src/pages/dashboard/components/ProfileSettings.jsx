import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../../app/contexts/AuthContext';
import { userService } from '../../../services/firestore/userService';
import { cloudinaryService } from '../../../services/cloudinary';
import { logger } from '../../../utils/logger';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

/**
 * Custom styling overrides for react-international-phone
 * to match the design system (rounded-xl, border-gray-200, focus:ring-primary, etc.)
 */
const phoneInputStyle = {
  '--react-international-phone-height': '42px',
  '--react-international-phone-border-radius': '12px',
  '--react-international-phone-border-color': '#e5e7eb',
  '--react-international-phone-background-color': '#f9fafb',
  '--react-international-phone-text-color': '#1A2E1A',
  '--react-international-phone-font-size': '14px',
  '--react-international-phone-country-selector-background-color': '#f9fafb',
  '--react-international-phone-country-selector-background-color-hover': '#f3f4f6',
  '--react-international-phone-selected-dropdown-item-background-color': '#E8F5E9',
  '--react-international-phone-country-selector-border-color': '#e5e7eb',
  '--react-international-phone-dropdown-item-background-color': 'white',
  '--react-international-phone-focus-border-color': '#1B5E20',
};

const ProfileSettings = () => {
  const { currentUser, userData } = useAuth();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  /**
   * Validate E.164: optional but if provided must be + followed by 7-15 digits.
   */
  const validatePhone = useCallback((value) => {
    if (!value || value === '+') {
      setPhoneError('');
      return true; // phone is optional
    }
    // E.164: + followed by 7-15 digits
    const e164 = /^\+[1-9]\d{6,14}$/;
    if (!e164.test(value)) {
      setPhoneError('رقم الهاتف غير صالح');
      return false;
    }
    setPhoneError('');
    return true;
  }, []);

  const handlePhoneChange = useCallback((value) => {
    setPhone(value);
    if (phoneError) validatePhone(value);
  }, [phoneError, validatePhone]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    // Validate phone before save
    const cleanPhone = (!phone || phone === '+') ? '' : phone;
    if (cleanPhone && !validatePhone(cleanPhone)) return;

    try {
      setLoading(true);
      await userService.updateProfile(currentUser.uid, {
        displayName,
        bio,
        phone: cleanPhone,
      });
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
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target.result);
    reader.readAsDataURL(file);
    handleAvatarUpload(file);
  };

  const handleAvatarUpload = async (file) => {
    setUploadingAvatar(true);
    try {
      const url = await cloudinaryService.uploadFile(file, 'Namaa-Academy/avatars');
      await userService.updateProfile(currentUser.uid, { photoURL: url });
      showMessage('✅ تم تحديث الصورة بنجاح');
      setPreviewUrl(null);
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      showMessage('❌ حدث خطأ أثناء رفع الصورة');
      setPreviewUrl(null);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setDisplayName(userData?.displayName || '');
    setBio(userData?.bio || '');
    setPhone(userData?.phone || '');
    setPhoneError('');
    setPreviewUrl(null);
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

          {/* Phone — with country flags */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1.5">رقم الهاتف</label>
            <div dir="ltr" style={phoneInputStyle}>
              <PhoneInput
                defaultCountry="eg"
                value={phone}
                onChange={handlePhoneChange}
                onBlur={() => validatePhone(phone)}
                inputClassName="!rounded-xl !font-medium !text-sm"
                countrySelectorStyleProps={{
                  buttonClassName: '!rounded-r-xl !border-gray-200',
                }}
                charAfterDialCode=" "
                disableDialCodeAndPrefix={false}
                showDisabledDialCodeAndPrefix={false}
              />
            </div>
            {phoneError && (
              <p className="text-xs font-medium text-danger mt-1" role="alert">{phoneError}</p>
            )}
            <p className="text-[10px] text-gray-400 mt-1">اختياري — سيُحفظ بتنسيق دولي (مثال: ‎+201012345678)</p>
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
              disabled={loading || !!phoneError}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-heading-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
            <button
              type="button"
              onClick={handleCancelEditing}
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
