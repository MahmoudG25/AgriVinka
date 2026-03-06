import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaClock, FaInfoCircle, FaUsers, FaChevronDown, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { FadeIn } from '../../utils/motion';

const TrainingCard = ({ training }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format dates manually or via a library if available. Assuming Firestore Timestamps or JS Dates
  const formatDate = (dateValue) => {
    if (!dateValue) return '';

    // If it's a Firestore Timestamp convert to JS Date
    let date;
    if (typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else {
      // String or numeric timestamp
      date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return ''; // Invalid date

    return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const checkDeadline = (dateValue) => {
    if (!dateValue) return false;
    let timeMs;
    if (typeof dateValue.toDate === 'function') {
      timeMs = dateValue.toDate().getTime();
    } else if (dateValue instanceof Date) {
      timeMs = dateValue.getTime();
    } else {
      timeMs = new Date(dateValue).getTime();
    }
    if (isNaN(timeMs)) return false;
    return (timeMs - Date.now() < 7 * 24 * 60 * 60 * 1000); // within 7 days
  };

  const isNearingDeadline = checkDeadline(training.deadline);

  return (
    <FadeIn>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">

        {/* Main Card Content (Clickable to expand) */}
        <div
          className="p-6 cursor-pointer flex flex-col md:flex-row gap-6 items-start md:items-center relative"
          onClick={() => setIsExpanded(!isExpanded)}
        >

          {/* Left/Top side: Info */}
          <div className="flex-1 space-y-3">
            <h3 className="text-xl font-bold text-heading-dark dark:text-gray-100">{training.title}</h3>

            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {training.shortDescription}
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500 dark:text-gray-400 mt-4">
              {training.durationText && (
                <div className="flex items-center gap-1.5">
                  <FaClock className="text-primary" />
                  <span>{training.durationText}</span>
                </div>
              )}

              {(training.location?.city || training.location?.governorate) && (
                <div className="flex items-center gap-1.5">
                  <FaMapMarkerAlt className="text-primary" />
                  <span>{training.location?.city}{training.location?.governorate ? `، ${training.location.governorate}` : ''}</span>
                </div>
              )}

              {(training.startDate || training.endDate) && (
                <div className="flex items-center gap-1.5">
                  <FaCalendarAlt className="text-primary" />
                  <span>
                    {training.startDate && formatDate(training.startDate)}
                    {training.startDate && training.endDate && ' - '}
                    {training.endDate && formatDate(training.endDate)}
                  </span>
                </div>
              )}
            </div>

            {/* Badges area */}
            <div className="flex flex-wrap gap-2 mt-3 cursor-default" onClick={e => e.stopPropagation()}>
              {training.deadline && (
                <div className={`px-3 py-1 rounded-full text-[11px] font-bold border flex items-center gap-1.5 
                ${isNearingDeadline ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400'}`}>
                  {isNearingDeadline ? <FaExclamationCircle /> : <FaInfoCircle />}
                  <span>آخر موعد للتقديم: {formatDate(training.deadline)}</span>
                </div>
              )}

              {training.seatsLimited && (
                <div className="px-3 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1.5 dark:bg-orange-900/30 dark:text-orange-400">
                  <FaUsers />
                  <span>محدود المقاعد - سارع بالتسجيل</span>
                </div>
              )}
            </div>
          </div>

          {/* Right/Bottom side: CTA */}
          <div className="w-full md:w-auto flex flex-col items-center gap-3" onClick={e => e.stopPropagation()}>
            <Link
              to={`/practical-training/apply/${training.id}`}
              className="w-full md:w-40 py-3 rounded-xl font-bold text-center bg-primary text-white hover:bg-accent transition-colors shadow-sm shadow-primary/20 flex items-center justify-center gap-2"
            >
              التقديم الآن
            </Link>
            <button
              className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
              <FaChevronDown className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Accordion Content */}
        <div
          className={`transition-all duration-300 ease-in-out border-t border-gray-100 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-800/50 ${isExpanded ? 'max-h-[1000px] opacity-100 py-6' : 'max-h-0 opacity-0 py-0'}`}
        >
          <div className="px-6 grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Details & Reqs */}
            <div className="space-y-4">
              {training.details && (
                <div>
                  <h4 className="font-bold text-sm text-heading-dark dark:text-gray-200 mb-2 flex items-center gap-2">
                    <FaInfoCircle className="text-primary" />
                    محتوى التدريب
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {training.details}
                  </p>
                </div>
              )}

              {training.requirements && (
                <div>
                  <h4 className="font-bold text-sm text-heading-dark dark:text-gray-200 mb-2 mt-4 flex items-center gap-2">
                    <FaCheckCircle className="text-primary" />
                    المتطلبات
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
                    {training.requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Details 2: Instructors & Full Location */}
            <div className="space-y-4">

              {training.location?.address && (
                <div>
                  <h4 className="font-bold text-sm text-heading-dark dark:text-gray-200 mb-2 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-primary" />
                    العنوان بالتفصيل
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {training.location.address}
                  </p>
                </div>
              )}

              {training.instructors && training.instructors.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-heading-dark dark:text-gray-200 mb-3 flex items-center gap-2">
                    <FaUsers className="text-primary" />
                    المدربين والمشرفين
                  </h4>
                  <div className="space-y-2">
                    {training.instructors.map((inst, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {inst.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-heading-dark dark:text-gray-200">{inst.name}</p>
                          {inst.title && <p className="text-xs text-gray-500 dark:text-gray-400">{inst.title}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {training.seatsLimited && training.seatsTotal && (
                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-800/30 mt-4">
                  <p className="text-sm font-bold text-orange-800 dark:text-orange-400 flex justify-between">
                    <span>المقاعد المتاحة</span>
                    <span>{training.seatsRemaining ?? training.seatsTotal} / {training.seatsTotal}</span>
                  </p>
                  <div className="w-full bg-orange-200 dark:bg-orange-900/50 rounded-full h-1.5 mt-2">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, ((training.seatsRemaining ?? training.seatsTotal) / training.seatsTotal) * 100))}%` }}
                    ></div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
};

export default TrainingCard;
