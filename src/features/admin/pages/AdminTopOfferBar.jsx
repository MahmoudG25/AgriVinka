import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { toast } from 'react-hot-toast';
import { MdSave, MdCampaign, MdToggleOn, MdToggleOff } from 'react-icons/md';

const AdminTopOfferBar = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    enabled: false,
    message: '',
    ctaEnabled: false,
    ctaText: '',
    ctaLink: '',
    endAt: '',
    showClose: true,
    theme: 'primary',
    offerId: Date.now().toString(),
  });

  useEffect(() => {
    fetchBarSettings();
  }, []);

  const fetchBarSettings = async () => {
    try {
      const docRef = doc(db, 'site_ui', 'top_offer_bar');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        let endAtString = '';

        if (data.endAt) {
          // Check if it's a Firestore timestamp
          const dateObj = data.endAt.toDate ? data.endAt.toDate() : new Date(data.endAt);
          // Format to YYYY-MM-DDThh:mm for input type datetime-local
          const tzOffset = dateObj.getTimezoneOffset() * 60000;
          endAtString = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
        }

        setFormData({
          enabled: data.enabled || false,
          message: data.message || '',
          ctaEnabled: data.ctaEnabled || false,
          ctaText: data.ctaText || '',
          ctaLink: data.ctaLink || '',
          endAt: endAtString,
          showClose: data.showClose ?? true,
          theme: data.theme || 'primary',
          offerId: data.offerId || Date.now().toString(),
        });
      }
    } catch (error) {
      console.error('Error fetching Top Offer Bar config:', error);
      // Suppress specific permissions error so the page doesn't crash
      if (error.code === 'permission-denied') {
        toast.error('ليس لديك الصلاحية لقراءة الإعدادات. سيتم عرض القيم الافتراضية.');
      } else {
        toast.error('حدث خطأ أثناء جلب إعدادات شريط الإعلانات.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const generateNewOfferId = () => {
    setFormData((prev) => ({ ...prev, offerId: Date.now().toString() }));
  };

  const validateForm = () => {
    if (formData.enabled) {
      if (!formData.message.trim()) {
        toast.error('يرجى إدخال نص الإعلان.');
        return false;
      }
      if (formData.ctaEnabled && (!formData.ctaText.trim() || !formData.ctaLink.trim())) {
        toast.error('يرجى إدخال نص ورابط الزر (CTA).');
        return false;
      }
      if (formData.endAt) {
        const endDate = new Date(formData.endAt);
        if (endDate <= new Date()) {
          toast.error('يجب أن يكون تاريخ الانتهاء في المستقبل.');
          return false;
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'site_ui', 'top_offer_bar');

      const payload = {
        ...formData,
        endAt: formData.endAt ? new Date(formData.endAt) : null,
        updatedAt: serverTimestamp(),
      };

      await setDoc(docRef, payload);
      toast.success('تم حفظ إعدادات شريط الإعلانات بنجاح!');
    } catch (error) {
      console.error('Error saving top offer bar config:', error);
      if (error.code === 'permission-denied') {
        toast.error('ليس لديك الصلاحية لحفظ هذه الإعدادات (مرفوض من قاعدة البيانات).');
      } else {
        toast.error('حدث خطأ أثناء الحفظ.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading-dark flex items-center gap-2">
            <MdCampaign className="text-primary" />
            شريط العروض أعلى الموقع
          </h1>
          <p className="text-gray-500 mt-1">تخصيص الشريط الإعلاني الذي يظهر أعلى جميع الصفحات</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <MdSave size={20} />
          )}
          حفظ التغييرات
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-8">
        {/* Toggle Enabled */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div>
            <h3 className="font-bold text-heading-dark">تفعيل الشريط الإعلاني</h3>
            <p className="text-sm text-gray-500">سيتم إظهار الشريط لجميع زوار الموقع.</p>
          </div>
          <button
            onClick={() => setFormData((prev) => ({ ...prev, enabled: !prev.enabled }))}
            className={`text-4xl transition-colors ${formData.enabled ? 'text-green-500' : 'text-gray-400'}`}
          >
            {formData.enabled ? <MdToggleOn /> : <MdToggleOff />}
          </button>
        </div>

        <div className={`space-y-6 transition-opacity duration-300 ${!formData.enabled && 'opacity-50 pointer-events-none'}`}>
          {/* Main Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">نص الإعلان *</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              rows={2}
              placeholder="مثال: خصم 50% لنهاية شهر رمضان المبارك على جميع الكورسات"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* End Date (Countdown) */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">تاريخ الانتهاء (اختياري)</label>
              <input
                type="datetime-local"
                name="endAt"
                value={formData.endAt}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <p className="text-xs text-gray-500 mt-1">إذا تم تحديده، سيظهر عداد تنازلي، ويختفي الشريط بعد الانتهاء.</p>
            </div>

            {/* Theme */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">المظهر (Theme)</label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="primary">افتراضي (لون الموقع الأساسي)</option>
                <option value="dark">داكن (أسود/رمادي غامق)</option>
                <option value="light">فاتح (خلفية شفافة خفيفة)</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* CTA Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="ctaEnabled"
                name="ctaEnabled"
                checked={formData.ctaEnabled}
                onChange={handleInputChange}
                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="ctaEnabled" className="font-bold text-gray-700 cursor-pointer">
                تفعيل زر اتخاذ الإجراء (CTA)
              </label>
            </div>

            {formData.ctaEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نص الزر</label>
                  <input
                    type="text"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={handleInputChange}
                    placeholder="مثال: اشترك الآن"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الرابط (مسار داخلي أو URL)</label>
                  <input
                    type="text"
                    name="ctaLink"
                    value={formData.ctaLink}
                    onChange={handleInputChange}
                    placeholder="/courses أو https://..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* Settings Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="flex items-center h-5 mt-1">
                <input
                  type="checkbox"
                  id="showClose"
                  name="showClose"
                  checked={formData.showClose}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
              <label htmlFor="showClose" className="font-bold text-gray-700 cursor-pointer">
                إظهار زر الإغلاق (X)
                <p className="font-normal text-sm text-gray-500 mt-1">
                  يسمح للمستخدم بإغلاق الشريط، ولن يظهر له مجددًا حتى تتغير الحملة.
                </p>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">معرف الحملة (Offer ID)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="offerId"
                  value={formData.offerId}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-left bg-gray-50"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={generateNewOfferId}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
                >
                  توليد جديد
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                قم بتوليد معرف جديد إذا أردت إظهار الشريط للمستخدمين الذين قاموا بإغلاقه سابقاً.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminTopOfferBar;
