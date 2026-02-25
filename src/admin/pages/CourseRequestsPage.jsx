import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { courseRequestService } from '../../services/courseRequestService';
import { MdAccessTime, MdCheckCircle, MdDone, MdOpenInNew } from 'react-icons/md';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'معلق', color: 'yellow' },
  { value: 'reviewed', label: 'تمت المراجعة', color: 'blue' },
  { value: 'done', label: 'مكتمل', color: 'green' },
];

const getStatusBadge = (status) => {
  switch (status) {
    case 'reviewed': return <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-full"><MdCheckCircle /> تمت المراجعة</span>;
    case 'done': return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full"><MdDone /> مكتمل</span>;
    default: return <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full"><MdAccessTime /> معلق</span>;
  }
};

const CourseRequestsPage = () => {
  const dispatch = useDispatch();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editNote, setEditNote] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await courseRequestService.getAll();
        setRequests(data);
      } catch (err) {
        dispatch(addToast({ type: 'error', message: 'فشل تحميل الطلبات' }));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await courseRequestService.update(id, { status: newStatus });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      dispatch(addToast({ type: 'success', message: 'تم تحديث الحالة' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: 'فشل تحديث الحالة' }));
    }
  };

  const handleSaveNote = async (id) => {
    try {
      await courseRequestService.update(id, { adminNote: editNote });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, adminNote: editNote } : r));
      setEditingId(null);
      dispatch(addToast({ type: 'success', message: 'تم حفظ الملاحظة' }));
    } catch (err) {
      dispatch(addToast({ type: 'error', message: 'فشل حفظ الملاحظة' }));
    }
  };

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const formatDate = (ts) => {
    if (!ts?.seconds) return '—';
    return new Date(ts.seconds * 1000).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading-dark">طلبات الدورات</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border-light pb-4 overflow-x-auto">
        {[{ value: 'all', label: 'الكل' }, ...STATUS_OPTIONS].map(s => (
          <button
            key={s.value}
            onClick={() => setFilter(s.value)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === s.value ? 'bg-heading-dark text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <p className="text-sm text-gray-500">{filtered.length} طلب</p>

      {/* Cards List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">inbox</span>
          <p>لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <div key={req.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Main Info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="font-bold text-heading-dark text-lg">{req.courseName}</h3>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 mb-2">
                    <span>👤 {req.name}</span>
                    {req.email && <span>✉ {req.email}</span>}
                    {req.phone && <span>📱 {req.phone}</span>}
                    <span>📅 {formatDate(req.createdAt)}</span>
                  </div>

                  {req.courseLink && (
                    <a href={req.courseLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-2">
                      <MdOpenInNew size={14} /> رابط الدورة
                    </a>
                  )}

                  {req.message && <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mt-2">{req.message}</p>}

                  {/* Admin Note */}
                  {editingId === req.id ? (
                    <div className="mt-3 flex gap-2">
                      <input
                        value={editNote}
                        onChange={e => setEditNote(e.target.value)}
                        className="flex-grow p-2 rounded-lg border border-gray-200 text-sm focus:border-primary focus:outline-none"
                        placeholder="ملاحظة داخلية..."
                      />
                      <button onClick={() => handleSaveNote(req.id)} className="px-3 py-2 bg-primary text-heading-dark rounded-lg text-sm font-bold hover:bg-accent transition-colors">حفظ</button>
                      <button onClick={() => setEditingId(null)} className="px-3 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm hover:bg-gray-200 transition-colors">إلغاء</button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      {req.adminNote && <p className="text-xs text-gray-400 italic">📝 {req.adminNote}</p>}
                      <button
                        onClick={() => { setEditingId(req.id); setEditNote(req.adminNote || ''); }}
                        className="text-xs text-primary hover:underline"
                      >
                        {req.adminNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Status selector */}
                <div className="shrink-0">
                  <select
                    value={req.status}
                    onChange={e => handleStatusChange(req.id, e.target.value)}
                    className="p-2 rounded-lg border border-gray-200 text-sm font-bold text-heading-dark focus:border-primary focus:outline-none cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseRequestsPage;
