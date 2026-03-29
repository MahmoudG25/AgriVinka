import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../app/store/slices/uiSlice';
import { aiAdminService } from '../../../services/firestore/aiAdminService';
import { userService } from '../../../services/firestore/userService';
import {
  MdSmartToy, MdTune, MdPeople, MdBarChart, MdList,
  MdSearch, MdRefresh, MdSave,
  MdImageSearch, MdMic, MdVolumeUp, MdBlock, MdCheckCircle,
  MdRestartAlt, MdClose,
} from 'react-icons/md';
import { FiEdit3 } from 'react-icons/fi';

// ─── InputModal ───────────────────────────────────────────────────────────────

const InputModal = ({ isOpen, title, label, description, placeholder, defaultValue = '', onConfirm, onCancel }) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue(String(defaultValue ?? ''));
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-border-light overflow-hidden animate-fade-in-up"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-light">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <FiEdit3 size={15} className="text-primary" />
            </div>
            <h3 className="font-bold text-heading-dark text-base">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <MdClose size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {description && (
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{description}</p>
          )}
          <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
          <input
            ref={inputRef}
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onConfirm(value);
              if (e.key === 'Escape') onCancel();
            }}
            className="w-full px-4 py-3 rounded-xl border border-border-light focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-heading-dark font-bold text-lg transition-all"
          />
          <p className="text-xs text-gray-400 mt-2">اتركه فارغاً لإزالة الحد المخصص واستخدام الحد الافتراضي</p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button
            onClick={() => onConfirm(value)}
            className="flex-1 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors shadow-sm"
          >
            حفظ
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};

const formatDate = (val) => {
  if (!val) return '-';
  if (val?.seconds) return new Date(val.seconds * 1000).toLocaleString('ar-EG');
  return new Date(val).toLocaleString('ar-EG');
};

const StatCard = ({ label, value, icon: Icon, color = 'text-primary', bg = 'bg-primary/10' }) => (
  <div className="bg-white rounded-2xl border border-border-light p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
      <Icon size={24} className={color} />
    </div>
    <div>
      <p className="text-2xl font-bold text-heading-dark">{value ?? '…'}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const Toggle = ({ value, onChange, disabled }) => (
  <button
    onClick={() => !disabled && onChange(!value)}
    className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
      value ? 'bg-primary' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    type="button"
  >
    <span
      className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${
        value ? 'right-1' : 'right-6'
      }`}
    />
  </button>
);

const TABS = [
  { id: 'settings', label: 'الإعدادات العامة', icon: MdTune },
  { id: 'users',    label: 'المستخدمون',       icon: MdPeople },
  { id: 'stats',    label: 'الإحصائيات',        icon: MdBarChart },
  { id: 'logs',     label: 'السجلات',           icon: MdList },
];

// ─── Settings Tab ─────────────────────────────────────────────────────────────

const SettingsTab = () => {
  const dispatch = useDispatch();
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    const data = await aiAdminService.getGlobalSettings();
    setSettings(data);
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleChange = (key, value) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const ok = await aiAdminService.saveGlobalSettings(settings);
    dispatch(addToast({ type: ok ? 'success' : 'error', message: ok ? 'تم حفظ الإعدادات بنجاح' : 'فشل حفظ الإعدادات' }));
    setSaving(false);
  };

  if (!settings) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  const toggleRow = (key, label, Icon, desc) => (
    <div key={key} className="flex items-center justify-between py-4 border-b border-border-light last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon size={20} className="text-gray-500" />
        </div>
        <div>
          <p className="font-semibold text-heading-dark text-sm">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <Toggle value={!!settings[key]} onChange={(v) => handleChange(key, v)} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Main toggle */}
      <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
        <h2 className="text-base font-bold text-heading-dark mb-4 flex items-center gap-2">
          <MdSmartToy className="text-primary" /> حالة المساعد الذكي
        </h2>
        <div className={`flex items-center justify-between p-4 rounded-xl ${settings.assistantEnabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <div>
            <p className="font-bold text-sm text-heading-dark">المساعد الذكي</p>
            <p className={`text-sm font-medium mt-1 ${settings.assistantEnabled ? 'text-green-600' : 'text-red-500'}`}>
              {settings.assistantEnabled ? '● يعمل لجميع المستخدمين' : '● موقوف عن جميع المستخدمين'}
            </p>
          </div>
          <Toggle value={!!settings.assistantEnabled} onChange={(v) => handleChange('assistantEnabled', v)} />
        </div>
      </div>

      {/* Limits */}
      <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
        <h2 className="text-base font-bold text-heading-dark mb-4">حدود الاستخدام</h2>
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">الحد الأقصى للرسائل اليومية لكل مستخدم</label>
          <input
            type="number" min={1} max={1000}
            value={settings.maxDailyMessages ?? 50}
            onChange={e => handleChange('maxDailyMessages', Number(e.target.value))}
            className="w-48 px-4 py-2.5 rounded-xl border border-border-light focus:outline-none focus:border-primary bg-white text-heading-dark font-bold"
          />
          <p className="text-xs text-gray-400 mt-1.5">يمكن تجاوز هذا الحد لمستخدمين بعينهم من قسم المستخدمين</p>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
        <h2 className="text-base font-bold text-heading-dark mb-2">الميزات المتاحة</h2>
        <p className="text-xs text-gray-400 mb-4">تحكم في الميزات المتاحة لجميع المستخدمين</p>
        {toggleRow('imageAnalysisEnabled', 'تحليل الصور', MdImageSearch, 'السماح برفع صور النباتات لتحليلها بالذكاء الاصطناعي')}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-sm"
      >
        <MdSave size={18} />
        {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
      </button>
    </div>
  );
};

// ─── Users Tab ────────────────────────────────────────────────────────────────

const UsersTab = () => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [limitModal, setLimitModal] = useState(null); // { user } | null

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch {
      dispatch(addToast({ type: 'error', message: 'فشل تحميل المستخدمين' }));
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const t = search.toLowerCase();
    return users.filter(u =>
      (u.displayName || '').toLowerCase().includes(t) ||
      (u.email || '').toLowerCase().includes(t)
    );
  }, [users, search]);

  const toggleAi = async (user) => {
    const newVal = user.aiEnabled === false ? true : false;
    setUpdatingId(user.id);
    const ok = await aiAdminService.updateUserAiSettings(user.id, { aiEnabled: newVal });
    if (ok) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, aiEnabled: newVal } : u));
    dispatch(addToast({ type: ok ? 'success' : 'error', message: ok ? 'تم التحديث' : 'فشل التحديث' }));
    setUpdatingId(null);
  };

  const resetUsage = async (user) => {
    setUpdatingId(user.id);
    const ok = await aiAdminService.resetUserUsage(user.id);
    if (ok) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, aiUsageCount: 0 } : u));
    dispatch(addToast({ type: ok ? 'success' : 'error', message: ok ? 'تم إعادة ضبط الاستخدام' : 'فشل' }));
    setUpdatingId(null);
  };

  const setLimitOverride = (user) => {
    // Open our nice modal instead of native prompt()
    setLimitModal({ user });
  };

  const confirmLimitOverride = async (rawValue) => {
    const user = limitModal?.user;
    setLimitModal(null);
    if (!user) return;

    const trimmed = String(rawValue).trim();
    // Empty → remove override (set to null)
    if (trimmed === '') {
      setUpdatingId(user.id);
      const ok = await aiAdminService.updateUserAiSettings(user.id, { aiLimitOverride: null });
      if (ok) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, aiLimitOverride: null } : u));
      dispatch(addToast({ type: ok ? 'success' : 'error', message: ok ? 'تمت إزالة الحد المخصص' : 'فشل' }));
      setUpdatingId(null);
      return;
    }

    const val = parseInt(trimmed, 10);
    if (isNaN(val) || val < 0) {
      dispatch(addToast({ type: 'error', message: 'رقم غير صالح، الرجاء إدخال رقم صحيح' }));
      return;
    }
    setUpdatingId(user.id);
    const ok = await aiAdminService.updateUserAiSettings(user.id, { aiLimitOverride: val });
    if (ok) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, aiLimitOverride: val } : u));
    dispatch(addToast({ type: ok ? 'success' : 'error', message: ok ? 'تم تعيين الحد المخصص' : 'فشل' }));
    setUpdatingId(null);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  return (
    <>
      <div className="space-y-4">
        {/* ... existing UsersTab elements ... */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="بحث بالاسم أو البريد..."
              className="pl-4 pr-10 py-2.5 rounded-xl border border-border-light focus:outline-none focus:border-primary w-full bg-white text-sm"
            />
          </div>
          <span className="text-sm text-gray-500 font-medium">{filtered.length} مستخدم</span>
        </div>

        <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-background-alt text-gray-500 font-semibold text-xs uppercase tracking-wide">
                <tr>
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">الدور</th>
                  <th className="p-4">استخدام AI</th>
                  <th className="p-4">الحد المخصص</th>
                  <th className="p-4">حالة AI</th>
                  <th className="p-4">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {filtered.length > 0 ? filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {user.photoURL
                            ? <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                            : (user.displayName || 'U')[0]}
                        </div>
                        <div>
                          <p className="font-bold text-heading-dark">{user.displayName || 'بدون اسم'}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        user.role === 'admin' || user.role === 'superAdmin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>{user.role || 'student'}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-primary">{user.aiUsageCount ?? 0}</span>
                      <span className="text-gray-400 text-xs mr-1">رسالة</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">
                        {user.aiLimitOverride != null
                          ? <span className="text-primary font-bold">{user.aiLimitOverride}</span>
                          : <span className="text-gray-400 text-xs">افتراضي</span>}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.aiEnabled === false
                        ? <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">مُعطَّل</span>
                        : <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">مُفعَّل</span>
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleAi(user)}
                          disabled={updatingId === user.id}
                          title={user.aiEnabled === false ? 'تفعيل AI' : 'إيقاف AI'}
                          className={`p-2 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                            user.aiEnabled === false
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-red-500 hover:bg-red-50'
                          }`}
                        >
                          {user.aiEnabled === false ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
                          <span className="hidden sm:inline">{user.aiEnabled === false ? 'تفعيل' : 'إيقاف'}</span>
                        </button>

                        <button
                          onClick={() => resetUsage(user)}
                          disabled={updatingId === user.id}
                          title="إعادة ضبط عداد الاستخدام"
                          className="p-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors flex items-center gap-1 text-xs"
                        >
                          <MdRestartAlt size={16} />
                          <span className="hidden sm:inline">ضبط</span>
                        </button>

                        <button
                          onClick={() => setLimitOverride(user)}
                          disabled={updatingId === user.id}
                          title="تعيين حد مخصص"
                          className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors flex items-center gap-1 text-xs"
                        >
                          <MdTune size={16} />
                          <span className="hidden sm:inline">حد</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-gray-400">لا يوجد مستخدمون</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Limit Override Modal */}
      <InputModal
        isOpen={!!limitModal}
        title="تعيين حد مخصص"
        label="الحد الأقصى للرسائل"
        description={limitModal ? `تعيين حد مخصص للمستخدم: ${limitModal.user.displayName || limitModal.user.email}` : ''}
        placeholder="مثال: 100"
        defaultValue={limitModal?.user?.aiLimitOverride ?? ''}
        onConfirm={confirmLimitOverride}
        onCancel={() => setLimitModal(null)}
      />
    </>
  );
};

// ─── Stats Tab ─────────────────────────────────────────────────────────────────

const StatsTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await aiAdminService.getStats();
      setStats(data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" /></div>;

  const total = stats.textCount + stats.imageCount || 1;
  const textPct  = Math.round((stats.textCount  / total) * 100);
  const imagePct = Math.round((stats.imageCount / total) * 100);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="إجمالي الطلبات" value={stats.totalRequests} icon={MdBarChart} color="text-primary" bg="bg-primary/10" />
        <StatCard label="جلسات المحادثة" value={stats.totalSessions} icon={MdSmartToy} color="text-purple-600" bg="bg-purple-100" />
        <StatCard label="رسائل نصية" value={stats.textCount} icon={MdList} color="text-blue-500" bg="bg-blue-100" />
      </div>

      {/* Type breakdown */}
      <div className="bg-white rounded-2xl border border-border-light p-6 shadow-sm">
        <h3 className="font-bold text-heading-dark mb-5">توزيع نوع الطلبات</h3>
        <div className="space-y-4">
          {[
            { label: 'نصي',   count: stats.textCount,  pct: textPct,  color: 'bg-primary'  },
            { label: 'صوري',  count: stats.imageCount, pct: imagePct, color: 'bg-amber-500' },
          ].map(({ label, count, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium text-gray-700">{label}</span>
                <span className="font-bold text-heading-dark">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
              </div>
              <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">* الإحصائيات تُحسب من مجموعة ai_logs — ستكون دقيقة بعد تجمّع البيانات</p>
    </div>
  );
};

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

const LogsTab = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [filterUser, setFilterUser] = useState('');

  const fetchLogs = useCallback(async (reset = true) => {
    setLoading(true);
    const prevLast = reset ? null : lastDoc;
    const { logs: newLogs, nextLastDoc } = await aiAdminService.getLogs({
      pageSize: 25,
      lastDoc: prevLast,
      filterUserId: filterUser.trim() || null,
    });

    setLogs(reset ? newLogs : prev => [...prev, ...newLogs]);
    setLastDoc(nextLastDoc);
    setHasMore(newLogs.length === 25);
    setLoading(false);
  }, [filterUser, lastDoc]);

  useEffect(() => { fetchLogs(true); }, [filterUser]);

  const intentLabel = (intent) => ({
    plant_analysis: 'تحليل نبات',
    course_recommendation: 'اقتراح دورات',
    general_question: 'سؤال عام',
  }[intent] || intent || '-');

  const typeLabel = (type) => ({
    text: '💬 نص',
    image: '🖼 صورة',
    voice: '🎙 صوت',
  }[type] || type || '-');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            value={filterUser}
            onChange={e => setFilterUser(e.target.value)}
            placeholder="فلتر بـ userId..."
            className="pr-10 pl-4 py-2.5 rounded-xl border border-border-light focus:outline-none focus:border-primary bg-white text-sm w-64"
          />
        </div>
        <button
          onClick={() => fetchLogs(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-border-light rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <MdRefresh size={16} /> تحديث
        </button>
        <span className="text-sm text-gray-400">{logs.length} سجل</span>
      </div>

      <div className="bg-white rounded-2xl border border-border-light overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-background-alt text-gray-500 font-semibold text-xs uppercase tracking-wide">
              <tr>
                <th className="p-4">userId</th>
                <th className="p-4">النية (Intent)</th>
                <th className="p-4">النوع</th>
                <th className="p-4">الوقت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {loading && logs.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center"><div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">لا توجد سجلات بعد</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-gray-500 max-w-[160px] truncate">{log.userId}</td>
                  <td className="p-4">{intentLabel(log.intent)}</td>
                  <td className="p-4">{typeLabel(log.type)}</td>
                  <td className="p-4 text-gray-500 text-xs">{formatDate(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="p-4 border-t border-border-light text-center">
            <button
              onClick={() => fetchLogs(false)}
              disabled={loading}
              className="px-5 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {loading ? 'جاري التحميل...' : 'تحميل المزيد'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const AIAssistantAdminPage = () => {
  const [activeTab, setActiveTab] = useState('settings');

  const TabContent = {
    settings: <SettingsTab />,
    users:    <UsersTab />,
    stats:    <StatsTab />,
    logs:     <LogsTab />,
  }[activeTab];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading-dark flex items-center gap-2">
            <MdSmartToy className="text-primary" size={28} />
            إدارة المساعد الذكي
          </h1>
          <p className="text-sm text-gray-500 mt-1">تحكم كامل في إعدادات وصلاحيات وسجلات المساعد الزراعي الذكي</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-background-alt p-1 rounded-xl w-fit border border-border-light">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === id
                ? 'bg-white text-primary shadow-sm border border-border-light'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{TabContent}</div>
    </div>
  );
};

export default AIAssistantAdminPage;
