import React from 'react';
import { MdAdd, MdDelete } from 'react-icons/md';

const FaqSectionAdmin = ({ data = [], onAddItem, onUpdateItem, onRemoveItem }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">الأسئلة الشائعة</h3>
        <button
          type="button"
          onClick={() => onAddItem('faq', { question: '', answer: '' })}
          className="text-primary flex items-center gap-1 font-bold text-sm"
        >
          <MdAdd size={20} /> إضافة سؤال
        </button>
      </div>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="border border-border-light rounded-xl p-4 bg-gray-50 relative">
            <button
              type="button"
              onClick={() => onRemoveItem('faq', item.id)}
              className="absolute top-4 left-4 text-red-400 hover:text-red-500"
            >
              <MdDelete size={20} />
            </button>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">السؤال</label>
                <input
                  type="text"
                  value={item.question}
                  onChange={e => onUpdateItem('faq', item.id, 'question', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">الإجابة</label>
                <textarea
                  value={item.answer}
                  onChange={e => onUpdateItem('faq', item.id, 'answer', e.target.value)}
                  className="w-full p-2 rounded border border-gray-200"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FaqSectionAdmin;
