import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../app/contexts/AuthContext';
import { userService } from '../../../services/firestore/userService';
import { cloudinaryService } from '../../../services/cloudinary';
import { authService } from '../../../services/authService';
import { logger } from '../../../utils/logger';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

/**
 * Custom styling overrides for react-international-phone
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
  const { currentUser, userData, isAdmin } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [displayName, setDisplayName] = useState(userData?.displayName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [university, setUniversity] = useState(userData?.university || '');
  const [college, setCollege] = useState(userData?.college || '');
  const [graduationYear, setGraduationYear] = useState(userData?.graduationYear || '');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const validatePhone = useCallback((value) => {
    if (!value || value === '+') {
      setPhoneError('');
      return true;
    }
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
    const cleanPhone = (!phone || phone === '+') ? '' : phone;
    if (cleanPhone && !validatePhone(cleanPhone)) return;
    try {
      setLoading(true);
      await userService.updateProfile(currentUser.uid, {
        displayName,
        bio,
        phone: cleanPhone,
        university,
        college,
        graduationYear,
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
    setUniversity(userData?.university || '');
    setCollege(userData?.college || '');
    setGraduationYear(userData?.graduationYear || '');
    setPhoneError('');
    setPreviewUrl(null);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      logger.error('Error logging out:', error);
    }
  };

  const avatarSrc = previewUrl || userData?.photoURL;

  const roleBadge = {
    admin: { label: 'مدير', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    editor: { label: 'محرر', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    student: { label: 'طالب', color: 'bg-green-100 text-green-700 border-green-200' },
  };
  const role = userData?.role || 'student';
  const badge = roleBadge[role] || roleBadge.student;

  // Detail items for the dropdown
  const detailItems = [
    { icon: 'call', label: 'رقم الهاتف', value: userData?.phone, dir: 'ltr' },
    { icon: 'description', label: 'نبذة شخصية', value: userData?.bio },
    { icon: 'school', label: 'الجامعة', value: userData?.university },
    { icon: 'apartment', label: 'الكلية / المعهد', value: userData?.college },
    { icon: 'event', label: 'سنة التخرج', value: userData?.graduationYear },
  ].filter(item => item.value);

  return (
    <div id="profile" className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

      {/* ═══════ VIEW MODE ═══════ */}
      {!isEditing ? (
        <>
          {/* Header Row */}
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-lg font-black text-heading-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">person</span>
              الملف الشخصي
            </h2>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 text-sm font-bold text-primary hover:text-heading-dark transition-colors group"
            >
              <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">edit</span>
              تعديل
            </button>
          </div>

          {/* Toast */}
          {message && (
            <div className={`mx-5 mt-3 p-3 rounded-xl text-xs font-bold text-center transition-all ${message.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}

          {/* ── Central Avatar & Info ── */}
          <div className="flex flex-col items-center py-6 px-5">
            {/* Avatar */}
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-[3px] border-primary/20 shadow-lg shadow-primary/10">
                {avatarSrc ? (
                  <img src={avatarSrc} alt={userData?.displayName} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-white text-3xl font-black">
                    {userData?.displayName?.[0] || 'ن'}
                  </div>
                )}
              </div>
              {/* Online dot */}
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full" />
            </div>

            {/* Name + Badge */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-black text-heading-dark">{userData?.displayName || 'مستخدم جديد'}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            {/* Email */}
            <p className="text-xs text-gray-400 font-medium" dir="ltr">{userData?.email}</p>

            {/* Join Date */}
            <div className="mt-4 text-center">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">تاريخ الانضمام</span>
              <p className="text-sm font-bold text-heading-dark">
                {userData?.createdAt?.seconds
                  ? new Date(userData.createdAt.seconds * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '-'}
              </p>
            </div>
          </div>

          {/* ── Details Dropdown Toggle ── */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-bold text-gray-500 hover:text-primary hover:bg-gray-50/50 transition-all"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">badge</span>
                التفاصيل الأكاديمية والشخصية
              </span>
              <span className={`material-symbols-outlined text-lg transition-transform duration-300 ${showDetails ? 'rotate-180' : ''}`}>
                expand_more
              </span>
            </button>

            {/* ── Dropdown Content ── */}
            <div
              className="overflow-hidden transition-all duration-400 ease-in-out"
              style={{
                maxHeight: showDetails ? '400px' : '0px',
                opacity: showDetails ? 1 : 0,
              }}
            >
              <div className="px-5 pb-5 space-y-3">
                {detailItems.length > 0 ? (
                  detailItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/70 border border-gray-100/80">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                        <span className="material-symbols-outlined text-base">{item.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</span>
                        <p className={`text-sm font-medium text-heading-dark truncate ${item.dir === 'ltr' ? '' : ''}`} dir={item.dir || 'rtl'}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">info</span>
                    <p className="text-xs text-gray-400">لم تتم إضافة تفاصيل بعد</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-2 text-xs font-bold text-primary hover:underline"
                    >
                      أضف بياناتك الآن
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Action Buttons (Admin + Logout) ── */}
          <div className="border-t border-gray-100 p-4 flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/features/admin')}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-heading-dark text-white font-bold rounded-xl text-sm hover:bg-primary transition-colors"
              >
                <span className="material-symbols-outlined text-base">shield</span>
                لوحة الإدارة
              </button>
            )}
            <button
              onClick={handleLogout}
              className={`${isAdmin ? '' : 'flex-1'} flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-500 font-bold rounded-xl text-sm hover:bg-red-500 hover:text-white transition-colors`}
            >
              <span className="material-symbols-outlined text-base rtl:rotate-180">logout</span>
              تسجيل الخروج
            </button>
          </div>
        </>
      ) : (
        /* ═══════ EDIT MODE ═══════ */
        <form onSubmit={handleSaveProfile} className="p-5 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-heading-dark flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">edit_note</span>
              تعديل البيانات
            </h2>
            <button
              type="button"
              onClick={handleCancelEditing}
              className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              إلغاء
            </button>
          </div>

          {/* Toast */}
          {message && (
            <div className={`p-3 rounded-xl text-xs font-bold text-center transition-all ${message.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {message}
            </div>
          )}

          {/* ── Avatar Upload ── */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 shrink-0">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-white text-2xl font-bold">
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
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" disabled={uploadingAvatar} />
              <p className="text-[10px] text-gray-400 mt-1">JPG, PNG — أقصى حجم 5MB</p>
            </div>
          </div>

          {/* ── Personal Fields ── */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <span className="material-symbols-outlined text-sm text-primary">person</span>
              البيانات الشخصية
            </p>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">الاسم</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700 font-medium transition-all outline-none"
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
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-100 text-gray-400 text-sm text-gray-700 font-medium cursor-not-allowed"
                value={userData?.email || ''}
              />
            </div>

            {/* Phone */}
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
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">نبذة شخصية</label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700 font-medium transition-all outline-none resize-none"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="اكتب نبذة قصيرة عن نفسك..."
              />
            </div>
          </div>

          {/* ── Academic Fields ── */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 border-b border-gray-100 pb-2">
              <span className="material-symbols-outlined text-sm text-primary">school</span>
              البيانات الأكاديمية
            </p>

            {/* University */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">الجامعة</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700 font-medium transition-all outline-none"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="مثال: جامعة القاهرة"
              />
            </div>

            {/* College / Institute */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">الكلية / المعهد</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700 font-medium transition-all outline-none"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="مثال: كلية الزراعة"
              />
            </div>

            {/* Graduation Year */}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">سنة التخرج</label>
              <input
                type="text"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700 font-medium transition-all outline-none"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
                placeholder="مثال: 2025"
              />
            </div>
          </div>

          {/* ── Submit Buttons ── */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !!phoneError}
              className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-heading-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base">check_circle</span>
                  حفظ التغييرات
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancelEditing}
              className="px-5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfileSettings;
