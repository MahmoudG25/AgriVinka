import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { certificateService } from '../../services/certificateService';

const AdminCertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        const allCerts = await certificateService.getAllCertificates();
        setCertificates(allCerts);
      } catch (error) {
        console.error('Error fetching certificates:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  // Get unique course titles for filter dropdown
  const uniqueCourses = useMemo(() => {
    const courses = new Set(certificates.map(c => c.courseTitle).filter(Boolean));
    return [...courses].sort();
  }, [certificates]);

  // Format Firestore timestamp
  const formatDate = (dateField) => {
    if (!dateField) return '-';
    if (dateField.toDate) return dateField.toDate().toLocaleDateString('ar-EG');
    if (dateField.seconds) return new Date(dateField.seconds * 1000).toLocaleDateString('ar-EG');
    return new Date(dateField).toLocaleDateString('ar-EG');
  };

  // Filter certificates
  const filtered = useMemo(() => {
    return certificates.filter(cert => {
      const matchesSearch =
        !searchTerm ||
        cert.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.courseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;
      const matchesCourse = filterCourse === 'all' || cert.courseTitle === filterCourse;

      return matchesSearch && matchesStatus && matchesCourse;
    });
  }, [certificates, searchTerm, filterStatus, filterCourse]);

  const handleDownload = async (pdfUrl, certId) => {
    if (!pdfUrl) return;
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${certId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-heading-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500">workspace_premium</span>
            إدارة الشهادات
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            عرض وإدارة جميع الشهادات الصادرة عن الأكاديمية ({certificates.length} شهادة)
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="بحث بالاسم، الدورة، أو رقم الشهادة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="all">كل الحالات</option>
          <option value="valid">صالحة</option>
          <option value="revoked">ملغاة</option>
        </select>

        {/* Course filter */}
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 max-w-[200px]"
        >
          <option value="all">كل الدورات</option>
          {uniqueCourses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">جاري تحميل الشهادات...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-gray-300 mb-3 block">search_off</span>
            <p className="text-gray-500">لا توجد شهادات مطابقة للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-right font-bold text-gray-600 px-4 py-3">المتدرب</th>
                  <th className="text-right font-bold text-gray-600 px-4 py-3">الدورة</th>
                  <th className="text-right font-bold text-gray-600 px-4 py-3">التاريخ</th>
                  <th className="text-right font-bold text-gray-600 px-4 py-3">الرقم التسلسلي</th>
                  <th className="text-center font-bold text-gray-600 px-4 py-3">الحالة</th>
                  <th className="text-center font-bold text-gray-600 px-4 py-3">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(cert => (
                  <tr key={cert.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-heading-dark">
                      {cert.studentName || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">
                      {cert.courseTitle || '-'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {formatDate(cert.issuedAt || cert.completionDate)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500" dir="ltr">
                      {cert.serialNumber || cert.certificateCode || cert.id}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${cert.status === 'valid'
                          ? 'bg-green-100 text-green-700'
                          : cert.status === 'revoked'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                        {cert.status === 'valid' ? 'صالحة' : cert.status === 'revoked' ? 'ملغاة' : 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {cert.pdfUrl && (
                          <button
                            onClick={() => handleDownload(cert.pdfUrl, cert.id)}
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="تحميل PDF"
                          >
                            <span className="material-symbols-outlined text-lg">download</span>
                          </button>
                        )}
                        <Link
                          to={`/verify/${cert.id}`}
                          target="_blank"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="صفحة التحقق"
                        >
                          <span className="material-symbols-outlined text-lg">open_in_new</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 text-xs text-gray-400 text-center">
          عرض {filtered.length} من {certificates.length} شهادة
        </div>
      )}
    </div>
  );
};

export default AdminCertificatesPage;
