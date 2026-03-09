import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../app/store/slices/uiSlice';
import { useCertificateTemplateSettings } from '../../../features/certificates/hooks/useCertificateTemplateSettings';
import { DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS } from '../../../features/certificates/services/templateSettingsService';
import {
  MdSave,
  MdRestartAlt,
  MdImage,
  MdColorLens,
  MdTextFields,
  MdVerifiedUser,
  MdBrush,
  MdBorderStyle,
  MdDescription,
} from 'react-icons/md';

/* ─── Reusable sub-components ───────────────────────────────── */

const SectionCard = ({ icon: Icon, title, description, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
    <h2 className="text-lg font-bold text-heading-dark flex items-center gap-2 mb-1">
      <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon size={18} />
      </span>
      {title}
    </h2>
    {description && <p className="text-xs text-gray-500 mb-5 mr-10">{description}</p>}
    {!description && <div className="mb-5" />}
    <div className="space-y-5">{children}</div>
  </div>
);

const FieldLabel = ({ children, hint }) => (
  <div className="mb-1.5">
    <label className="block text-sm font-bold text-gray-700">{children}</label>
    {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
  </div>
);

const TextInput = ({ value, onChange, dir = 'rtl', placeholder, ...rest }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    dir={dir}
    placeholder={placeholder}
    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
    {...rest}
  />
);

const ColorField = ({ label, value, onChange }) => (
  <div>
    <FieldLabel>{label}</FieldLabel>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-11 h-11 rounded-lg cursor-pointer border border-gray-200"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir="ltr"
        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary text-left text-sm font-mono"
      />
    </div>
  </div>
);

const ToggleSwitch = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-bold text-gray-700">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-gray-300'
        }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white transition-transform shadow ${checked ? 'translate-x-1.5' : 'translate-x-5'
          }`}
      />
    </button>
  </div>
);

const ImagePreview = ({ url, alt }) => {
  if (!url) return null;
  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-200 inline-block">
      <img
        src={url}
        alt={alt}
        className="max-h-20 max-w-[180px] object-contain rounded"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    </div>
  );
};

/* ─── Main Page Component ───────────────────────────────────── */

const CertificateSettingsPage = () => {
  const dispatch = useDispatch();
  const { settings, loading, saving, save, reset } = useCertificateTemplateSettings();
  const [form, setForm] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Sync form state from hook once loaded
  React.useEffect(() => {
    if (!loading && settings && !form) {
      setForm({ ...settings });
    }
  }, [loading, settings, form]);

  if (loading || !form) {
    return (
      <div className="p-8 text-center text-gray-500">جاري تحميل إعدادات قالب الشهادة...</div>
    );
  }

  /* helpers */
  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const setNested = (parent, key, value) =>
    setForm((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [key]: value },
    }));

  const handleSave = async () => {
    try {
      await save(form);
      dispatch(addToast({ type: 'success', message: 'تم حفظ إعدادات الشهادة بنجاح ✅' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'فشل حفظ الإعدادات. حاول مرة أخرى.' }));
    }
  };

  const handleReset = async () => {
    try {
      const defaults = await reset();
      setForm({ ...defaults });
      setConfirmReset(false);
      dispatch(addToast({ type: 'success', message: 'تم إعادة الإعدادات إلى القيم الافتراضية' }));
    } catch {
      dispatch(addToast({ type: 'error', message: 'فشل إعادة الإعدادات' }));
    }
  };

  return (
    <div className="p-6 mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading-dark flex items-center gap-2">
            <MdDescription className="text-primary" /> إعدادات قالب الشهادة
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            تحكم في شكل وهوية شهادات الإتمام التي يحصل عليها المتدربون
          </p>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setConfirmReset(true)}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <MdRestartAlt size={18} />
            إعادة الافتراضي
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-bold disabled:opacity-50"
          >
            <MdSave size={18} />
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {confirmReset && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={() => setConfirmReset(false)}>
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-heading-dark mb-2">إعادة إلى الإعدادات الافتراضية؟</h3>
            <p className="text-gray-500 text-sm mb-6">
              سيتم حذف جميع التعديلات والعودة إلى القيم الافتراضية. لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {saving ? 'جاري الإعادة...' : 'نعم، إعادة الافتراضي'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ─── Branding ─── */}
        <SectionCard icon={MdImage} title="الهوية والشعار" description="اسم الأكاديمية ورابط الشعار">
          <div>
            <FieldLabel hint="يظهر في أعلى الشهادة بالإنجليزية">اسم الأكاديمية (EN)</FieldLabel>
            <TextInput
              value={form.academyNameEn}
              onChange={(e) => set('academyNameEn', e.target.value)}
              dir="ltr"
              placeholder="AgriVinka"
            />
          </div>
          <div>
            <FieldLabel hint="يظهر تحت الاسم الإنجليزي">اسم الأكاديمية (AR)</FieldLabel>
            <TextInput
              value={form.academyNameAr}
              onChange={(e) => set('academyNameAr', e.target.value)}
              placeholder="AgriVinka"
            />
          </div>
          <div>
            <FieldLabel hint="رابط مباشر لصورة الشعار (PNG/SVG)">رابط الشعار (Logo URL)</FieldLabel>
            <TextInput
              value={form.logoUrl}
              onChange={(e) => set('logoUrl', e.target.value)}
              dir="ltr"
              placeholder="https://example.com/logo.png"
            />
            <ImagePreview url={form.logoUrl} alt="Logo Preview" />
          </div>
          <div>
            <FieldLabel hint="شعار الموقع — يظهر على الجهة اليمنى من الشهادة (PNG/SVG)">شعار الموقع (Site Logo URL)</FieldLabel>
            <TextInput
              value={form.siteLogoUrl || ''}
              onChange={(e) => set('siteLogoUrl', e.target.value)}
              dir="ltr"
              placeholder="https://example.com/site-logo.png"
            />
            <ImagePreview url={form.siteLogoUrl} alt="Site Logo Preview" />
          </div>
        </SectionCard>

        {/* ─── Colors ─── */}
        <SectionCard icon={MdColorLens} title="الألوان" description="اللون الأساسي ولون التمييز في الشهادة">
          <ColorField
            label="اللون الأساسي (Primary Color)"
            value={form.primaryColor}
            onChange={(v) => set('primaryColor', v)}
          />
          <ColorField
            label="لون التمييز / الذهبي (Accent Color)"
            value={form.accentColor}
            onChange={(v) => set('accentColor', v)}
          />
          <ToggleSwitch
            label="إظهار الإطار الزخرفي"
            checked={form.borderEnabled}
            onChange={(v) => set('borderEnabled', v)}
          />
        </SectionCard>

        {/* ─── Texts ─── */}
        <SectionCard icon={MdTextFields} title="النصوص" description="عنوان وعبارات الشهادة">
          <div>
            <FieldLabel>عنوان الشهادة (EN)</FieldLabel>
            <TextInput
              value={form.titleEn}
              onChange={(e) => set('titleEn', e.target.value)}
              dir="ltr"
              placeholder="Certificate of Completion"
            />
          </div>
          <div>
            <FieldLabel>العنوان الفرعي (EN)</FieldLabel>
            <TextInput
              value={form.subtitleEn}
              onChange={(e) => set('subtitleEn', e.target.value)}
              dir="ltr"
              placeholder="This certifies the successful completion of a course"
            />
          </div>
          <div>
            <FieldLabel>نص التذييل (Footer)</FieldLabel>
            <TextInput
              value={form.footerTextEn}
              onChange={(e) => set('footerTextEn', e.target.value)}
              dir="ltr"
              placeholder="Verify at: agrivinka.com/verify"
            />
          </div>
        </SectionCard>

        {/* ─── Seal / Accreditation ─── */}
        <SectionCard icon={MdVerifiedUser} title="ختم الاعتماد" description="نص الختم الذي يظهر على الشهادة">
          <div>
            <FieldLabel>نص الاعتماد (EN)</FieldLabel>
            <TextInput
              value={form.sealTextEn}
              onChange={(e) => set('sealTextEn', e.target.value)}
              dir="ltr"
              placeholder="Accredited by AgriVinka"
            />
          </div>
        </SectionCard>

        {/* ─── Signature ─── */}
        <SectionCard icon={MdBrush} title="التوقيع" description="اسم المدرب وصورة التوقيع">
          <ToggleSwitch
            label="إظهار التوقيع في الشهادة"
            checked={form.signature?.enabled ?? true}
            onChange={(v) => setNested('signature', 'enabled', v)}
          />
          {form.signature?.enabled && (
            <>
              <div>
                <FieldLabel>اسم المدرب / الجهة</FieldLabel>
                <TextInput
                  value={form.signature?.instructorName ?? ''}
                  onChange={(e) => setNested('signature', 'instructorName', e.target.value)}
                  placeholder="Dr. ..."
                />
              </div>
              <div>
                <FieldLabel hint="رابط مباشر لصورة التوقيع (PNG شفاف)">رابط صورة التوقيع</FieldLabel>
                <TextInput
                  value={form.signature?.signatureImageUrl ?? ''}
                  onChange={(e) => setNested('signature', 'signatureImageUrl', e.target.value)}
                  dir="ltr"
                  placeholder="https://example.com/signature.png"
                />
                <ImagePreview url={form.signature?.signatureImageUrl} alt="Signature Preview" />
              </div>
            </>
          )}
        </SectionCard>

        {/* ─── Watermark ─── */}
        <SectionCard icon={MdBorderStyle} title="العلامة المائية" description="نص أو صورة تظهر خلف محتوى الشهادة">
          <ToggleSwitch
            label="إظهار العلامة المائية"
            checked={form.watermark?.enabled ?? false}
            onChange={(v) => setNested('watermark', 'enabled', v)}
          />
          {form.watermark?.enabled && (
            <>
              <div>
                <FieldLabel>نوع العلامة المائية</FieldLabel>
                <div className="flex gap-3">
                  {['text', 'image'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNested('watermark', 'type', t)}
                      className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${form.watermark?.type === t
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40'
                        }`}
                    >
                      {t === 'text' ? 'نص' : 'صورة'}
                    </button>
                  ))}
                </div>
              </div>

              {form.watermark?.type === 'text' && (
                <div>
                  <FieldLabel>نص العلامة المائية</FieldLabel>
                  <TextInput
                    value={form.watermark?.text ?? ''}
                    onChange={(e) => setNested('watermark', 'text', e.target.value)}
                    dir="ltr"
                    placeholder="AGRIVINKA"
                  />
                </div>
              )}

              {form.watermark?.type === 'image' && (
                <div>
                  <FieldLabel>رابط صورة العلامة المائية</FieldLabel>
                  <TextInput
                    value={form.watermark?.imageUrl ?? ''}
                    onChange={(e) => setNested('watermark', 'imageUrl', e.target.value)}
                    dir="ltr"
                    placeholder="https://example.com/watermark.png"
                  />
                  <ImagePreview url={form.watermark?.imageUrl} alt="Watermark Preview" />
                </div>
              )}
            </>
          )}
        </SectionCard>
      </div>

      {/* Template version badge */}
      <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
        <span className="px-2 py-0.5 bg-gray-100 rounded-full font-mono">
          {form.templateVersion || 'v1'}
        </span>
        <span>إصدار القالب</span>
      </div>
    </div>
  );
};

export default CertificateSettingsPage;
