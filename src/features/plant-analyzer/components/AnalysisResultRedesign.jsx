import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AnalysisResultRedesign.css';

const AnalysisResultRedesign = ({ result, imageDataUrl, onReset }) => {
  if (!result) return null;

  const {
    diagnosis = 'مرض غير محدد',
    scientificName = '',
    confidence,
    causes = [],
    careSteps = [],
    warnings = [],
    description = '',
    severity = '',
    spreadRate = '',
    pathogen = '',
    references = [],
  } = result;

  const isLowConfidence = confidence?.toLowerCase() === 'low';
  const accuracyPercent = isLowConfidence ? 40 : 98;
  const circumference = 220;
  const offset = circumference - (circumference * accuracyPercent) / 100;

  // Get current date formatted in Arabic
  const analysisDate = new Date().toLocaleDateString('ar-EG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Build description text from causes/warnings if no description provided
  const symptomsText = description || (causes.length > 0 ? causes.join('، ') : '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Breadcrumb */}
      <div className="ar-breadcrumb">
        <Link to="/">الرئيسية</Link>
        <span className="ar-breadcrumb-sep">‹</span>
        <Link to="/dashboard">تاريخ الفحص</Link>
        <span className="ar-breadcrumb-sep">‹</span>
        <span className="ar-breadcrumb-current">نتائج التحليل</span>
      </div>

      <div className="ar-result-container">
        {/* Main Grid */}
        <div className="ar-result-grid">

          {/* ===== Left Column: Disease Info ===== */}
          <div className="ar-info-column">

            {/* Status Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={`ar-status-badge ${isLowConfidence ? 'healthy' : 'active'}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>
                  {isLowConfidence ? 'check_circle' : 'warning'}
                </span>
                {isLowConfidence ? 'تحليل غير مؤكد' : 'إصابة نشطة'}
              </div>
            </motion.div>

            {/* Disease Name */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="ar-disease-name">{diagnosis}</h1>
              {(scientificName || pathogen) && (
                <p className="ar-disease-scientific">
                  المسبب: {scientificName || pathogen}
                </p>
              )}
            </motion.div>

            {/* Severity & Spread Badges */}
            <motion.div
              className="ar-badges-row"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="ar-severity-badge danger">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>local_fire_department</span>
                <div>
                  <div className="badge-label">الخطورة</div>
                  <div>{severity || 'مرتفعة'}</div>
                </div>
              </div>
              <div className="ar-severity-badge warning">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>speed</span>
                <div>
                  <div className="badge-label">الانتشار</div>
                  <div>{spreadRate || 'سريع'}</div>
                </div>
              </div>
            </motion.div>

            {/* Symptoms Description */}
            {(symptomsText || causes.length > 0) && (
              <motion.div
                className="ar-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="ar-section-title">
                  <span className="material-symbols-outlined">description</span>
                  وصف الأعراض
                </h3>
                {symptomsText && <p>{symptomsText}</p>}
                {!symptomsText && causes.length > 0 && (
                  <ul style={{ paddingRight: '1.25rem', margin: 0 }}>
                    {causes.map((c, i) => (
                      <li key={i} style={{ fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.8, marginBottom: '0.25rem' }}>{c}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {/* Treatment Steps */}
            {careSteps.length > 0 && (
              <motion.div
                className="ar-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="ar-section-title">
                  <span className="material-symbols-outlined">healing</span>
                  العلاج الموصى به
                </h3>
                <ol className="ar-treatment-list">
                  {careSteps.map((step, i) => (
                    <li key={i} className="ar-treatment-item">
                      <span className="ar-treatment-num">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </motion.div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <motion.div
                className="ar-section"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{ borderColor: '#fde68a', background: '#fffbeb' }}
              >
                <h3 className="ar-section-title" style={{ color: '#a16207' }}>
                  <span className="material-symbols-outlined" style={{ color: '#f59e0b' }}>gpp_maybe</span>
                  تحذيرات إضافية
                </h3>
                <ul style={{ paddingRight: '1.25rem', margin: 0 }}>
                  {warnings.map((w, i) => (
                    <li key={i} style={{ fontSize: '0.9rem', color: '#92400e', lineHeight: 1.8, marginBottom: '0.25rem' }}>{w}</li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* References */}
            {references.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                style={{ paddingTop: '0.5rem' }}
              >
                <h3 style={{ fontSize: '0.8rem', color: '#9ca3af', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>مصادر ومراجع</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {references.map((ref, i) => (
                    <span key={i} style={{ padding: '0.35rem 0.75rem', background: '#f3f4f6', color: '#6b7280', fontSize: '0.75rem', borderRadius: '0.5rem', fontWeight: 600 }}>
                      {ref}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* ===== Right Column: Image & Meta ===== */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <div className="ar-image-card">
              <div className="ar-image-wrapper">
                {imageDataUrl ? (
                  <img src={imageDataUrl} alt="الصورة المرفوعة للنبات" />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#d1d5db' }}>image</span>
                  </div>
                )}
                <div className="ar-image-label">الصورة المرفوعة</div>
              </div>

              {/* Meta Info */}
              <div className="ar-image-meta">
                <div className="ar-meta-row">
                  <span className="ar-meta-value">{analysisDate}</span>
                  <span className="ar-meta-label">تاريخ الفحص</span>
                </div>
              </div>

              {/* Accuracy Circle */}
              <div className="ar-accuracy-section">
                <div className="ar-accuracy-header">
                  <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)' }}>target</span>
                  دقة التحليل
                </div>
                <div className="ar-accuracy-circle">
                  <svg viewBox="0 0 80 80">
                    <circle className="ar-accuracy-bg" cx="40" cy="40" r="35" />
                    <circle
                      className="ar-accuracy-fill"
                      cx="40"
                      cy="40"
                      r="35"
                      style={{ '--accuracy-offset': offset }}
                    />
                  </svg>
                  <div className="ar-accuracy-text">%{accuracyPercent}</div>
                </div>
                <span className="ar-accuracy-label">ثقة بنسبة {accuracyPercent}%</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="ar-actions">
              <button className="ar-btn-primary" onClick={() => window.print()}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>download</span>
                تحميل التقرير الطبي الكامل (PDF)
              </button>
              <button className="ar-btn-outline">
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>forum</span>
                استشارة خبير زراعي
              </button>
            </div>
          </motion.div>

        </div>

        {/* CTA Banner */}
        <motion.div
          className="ar-cta-banner"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="ar-cta-content">
            <h3>هل تحتاج لمتابعة مع مختص؟</h3>
            <p>مهندسينا الزراعيين متاحون الآن لمراجعة حالتك عبر مكالمة فيديو</p>
          </div>
          <button className="ar-cta-btn">احجز موعدك الآن</button>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            marginTop: '1.5rem',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'flex-start',
            fontSize: '0.8rem',
            color: '#92400e',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1rem', marginTop: '2px', flexShrink: 0 }}>warning</span>
          <span>
            هذا التحليل تم إنشاؤه بواسطة الذكاء الاصطناعي ولا يغني عن استشارة مهندس زراعي مختص. يرجى أخذ الحيطة قبل استخدام أي مبيدات كيميائية.
          </span>
        </motion.div>

        {/* Reset Button */}
        <div className="ar-reset-section">
          <button className="ar-reset-btn" onClick={onReset}>
            <span className="material-symbols-outlined">psychiatry</span>
            فحص نبتة أخرى
          </button>
        </div>
      </div>

      {/* Mini Footer */}
      <div className="ar-footer">
        <div className="ar-footer-brand">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: '1.25rem' }}>eco</span>
          <span>AgriVinka</span>
        </div>
        <div className="ar-footer-links">
          <Link to="/terms">الشروط والأحكام</Link>
          <Link to="/contact">اتصل بنا</Link>
          <Link to="/about">سياسة الخصوصية</Link>
        </div>
        <p>© AgriVinka 2024. جميع الحقوق محفوظة.</p>
      </div>
    </motion.div>
  );
};

export default AnalysisResultRedesign;
