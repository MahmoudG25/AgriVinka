import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

const RoadmapSectionAdmin = ({ data = {}, onChange, onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-8">
      {/* Main Header Config */}
      <div className="border p-4 rounded-xl bg-gray-50 mb-6">
        <h4 className="font-bold mb-4 text-primary">إعدادات القسم (Header)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">العنوان الرئيسي</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={e => onChange('roadmap', 'title', e.target.value)}
              className="w-full p-2 rounded border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">العنوان الفرعي (Gradient)</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={e => onChange('roadmap', 'subtitle', e.target.value)}
              className="w-full p-2 rounded border border-gray-200"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">الوصف</label>
            <textarea
              value={data.description || ''}
              onChange={e => onChange('roadmap', 'description', e.target.value)}
              className="w-full p-2 rounded border border-gray-200"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">عدد الطلاب (Social Proof)</label>
            <input
              type="text"
              value={data.studentCount || '+1.2k'}
              onChange={e => onChange('roadmap', 'studentCount', e.target.value)}
              className="w-full p-2 rounded border border-gray-200"
            />
          </div>
        </div>
      </div>

      {/* Steps Config */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">خطوات الرحلة (Journey Steps)</h3>
        <button
          type="button"
          onClick={() => onAddItem('roadmap.steps', {
            stepNumber: '00',
            title: '',
            subtitle: '',
            description: '',
            icon: 'check_circle',
            duration: '4 أسابيع',
            outcome: 'مهارة جديدة',
            income: 'زيادة الدخل',
            emotional: 'شعور بالإنجاز',
            progress: 20,
            color: 'from-blue-500 to-blue-700'
          })}
          className="text-primary flex items-center gap-1 font-bold text-sm bg-primary/10 px-4 py-2 rounded-lg hover:bg-primary/20"
        >
          <MdAdd size={20} /> إضافة خطوة
        </button>
      </div>

      <div className="space-y-6">
        {data.steps?.map((item, index) => (
          <div key={item.id} className="border border-border-light rounded-xl p-6 bg-white shadow-sm relative group">
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">Step {index + 1}</span>
              <button
                type="button"
                onClick={() => onRemoveItem('roadmap.steps', item.id)}
                className="text-red-400 hover:text-red-500 p-1 hover:bg-red-50 rounded"
              >
                <MdDelete size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">

              {/* Basic Info */}
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">رقم الخطوة</label>
                <input
                  type="text"
                  value={item.stepNumber}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'stepNumber', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 font-mono text-center"
                  placeholder="01"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">العنوان</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'title', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                  placeholder="تأسيس قوي"
                />
              </div>
              <div className="md:col-span-5">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">العنوان الفرعي</label>
                <input
                  type="text"
                  value={item.subtitle}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'subtitle', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                  placeholder="البداية الصحيحة"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-12">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الوصف</label>
                <textarea
                  value={item.description}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'description', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                  rows={2}
                />
              </div>

              {/* Psychological Props */}
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">المدة (Duration)</label>
                <input
                  type="text"
                  value={item.duration}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'duration', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 text-sm"
                  placeholder="4 أسابيع"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">النتيجة (Outcome)</label>
                <input
                  type="text"
                  value={item.outcome}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'outcome', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 text-sm"
                  placeholder="بناء موقع كامل"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الدخل المتوقع (Income)</label>
                <input
                  type="text"
                  value={item.income}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'income', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 text-sm"
                  placeholder="بداية الطريق"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">نسبة الإنجاز (Progress %)</label>
                <input
                  type="number"
                  value={item.progress}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'progress', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 text-sm"
                  placeholder="20"
                />
              </div>

              <div className="md:col-span-12">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الرسالة العاطفية (Emotional Copy)</label>
                <input
                  type="text"
                  value={item.emotional}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'emotional', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 border-l-4 border-l-accent bg-amber-50"
                  placeholder="ستشعر لأول مرة أنك مبرمج حقيقي..."
                />
              </div>

              {/* Visuals */}
              <div className="md:col-span-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">الأيقونة (Material Symbol)</label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-2xl text-gray-400 bg-gray-100 p-1 rounded">{item.icon || 'star'}</span>
                  <input
                    type="text"
                    value={item.icon}
                    onChange={e => onUpdateItem('roadmap.steps', item.id, 'icon', e.target.value)}
                    className="w-full p-2 rounded border border-gray-200"
                  />
                </div>
              </div>
              <div className="md:col-span-6">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">اللون (Tailwind Gradient)</label>
                <input
                  type="text"
                  value={item.color}
                  onChange={e => onUpdateItem('roadmap.steps', item.id, 'color', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200 text-xs font-mono text-gray-500"
                  placeholder="from-blue-500 to-blue-700"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Final Anchor Config */}
      <div className="border p-6 rounded-xl bg-gray-900/5 mt-8 border-gray-200">
        <h4 className="font-bold mb-4 text-heading-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-accent">emoji_events</span>
          بطاقة التحول النهائي (Final Anchor)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">عنوان البطاقة</label>
            <input
              type="text"
              value={data.finalTitle || ''}
              onChange={e => onChange('roadmap', 'finalTitle', e.target.value)}
              className="w-full p-2 rounded border border-gray-200"
              placeholder="من الصفر إلى أول دولار"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">رقم الدخل (Visual)</label>
            <input
              type="text"
              value={data.finalIncome || ''}
              onChange={e => onChange('roadmap', 'finalIncome', e.target.value)}
              className="w-full p-2 rounded border border-gray-200"
              placeholder="$1,250.00"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 mb-1">وصف البطاقة</label>
            <textarea
              value={data.finalDesc || ''}
              onChange={e => onChange('roadmap', 'finalDesc', e.target.value)}
              className="w-full p-2 rounded border border-gray-200"
              rows={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapSectionAdmin;
