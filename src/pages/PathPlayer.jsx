import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/contexts/AuthContext';
import { roadmapService } from '../services/firestore/roadmapService';
import { courseService } from '../services/firestore/courseService';
import { enrollmentService } from '../services/firestore/enrollmentService';
import { logger } from '../utils/logger';
import SEOHead from '../components/common/SEOHead';
import { FaChevronRight, FaPlayCircle, FaCheckCircle, FaLock } from 'react-icons/fa';

const PathPlayer = () => {
  const { id: roadmapId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [roadmap, setRoadmap] = useState(null);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPathData = async () => {
      if (!currentUser?.uid) return;
      try {
        setLoading(true);

        const rm = await roadmapService.getRoadmapById(roadmapId);
        if (!rm) {
          navigate('/dashboard');
          return;
        }
        setRoadmap(rm);

        // Fetch detailed courses
        if (rm.courses && rm.courses.length > 0) {
          const coursePromises = rm.courses.map(cId => courseService.getCourseById(cId));
          const loadedCourses = await Promise.all(coursePromises);
          // Filter out nulls in case some courses were deleted
          setCourses(loadedCourses.filter(c => c !== null));
        }

        const userEnrollments = await enrollmentService.getUserEnrollments(currentUser.uid);
        setEnrollments(userEnrollments);

      } catch (err) {
        logger.error('Error fetching PathPlayer data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPathData();
  }, [roadmapId, currentUser, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-alt flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!roadmap) return null;

  return (
    <div className="min-h-screen bg-background-alt font-body" dir="rtl">
      <SEOHead title={`${roadmap.title} - مسار التعلم`} />

      {/* Header */}
      <header className="bg-heading-dark text-white p-6 shadow-md relative z-10">
        <div className="container mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition">
            <FaChevronRight />
          </Link>
          <div>
            <h1 className="text-2xl font-bold mb-1">{roadmap.title}</h1>
            <p className="text-sm text-gray-400">تابع تقدمك في مسار التعلم</p>
          </div>
        </div>
      </header>

      {/* Timeline Content */}
      <main className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-4xl pb-safe min-w-0">
        <div className="relative pl-4 md:pl-0">
          {/* Vertical Line */}
          <div className="absolute right-[23px] top-6 bottom-6 w-1 bg-gray-200 rounded-full"></div>

          <div className="space-y-8">
            {courses.map((course, index) => {
              const enr = enrollments.find(e => e.courseId === course.id);
              const progress = enr?.progressPercentage || enr?.progressPercent || 0;
              const isCompleted = enr?.isCompleted || progress === 100;

              const prevCourse = index > 0 ? courses[index - 1] : null;
              const prevEnr = prevCourse ? enrollments.find(e => e.courseId === prevCourse.id) : null;
              const isPrevCompleted = prevEnr?.isCompleted || (prevEnr?.progressPercentage === 100);
              const isLocked = index > 0 && !isPrevCompleted && !enr; // Optional: enforce sequential order

              return (
                <div key={course.id} className="relative flex items-start gap-6">
                  {/* Timeline Badge */}
                  <div className={`relative z-10 w-12 h-12 shrink-0 rounded-full flex items-center justify-center border-4 border-background-alt shadow-sm transition-colors ${isCompleted ? 'bg-green-500 text-white' :
                    enr && progress > 0 ? 'bg-primary text-white' :
                      isLocked ? 'bg-gray-200 text-gray-400' : 'bg-white text-gray-400 border-gray-300'
                    }`}>
                    {isCompleted ? <FaCheckCircle className="text-xl" /> :
                      isLocked ? <FaLock className="text-lg" /> :
                        <span className="font-bold text-lg">{index + 1}</span>}
                  </div>

                  {/* Course Card */}
                  <div className={`flex-1 bg-white rounded-2xl shadow-sm border p-6 transition-all ${isLocked ? 'border-gray-100 opacity-60' : 'border-gray-200 hover:shadow-md'
                    }`}>
                    <div className="md:flex justify-between items-start gap-4">
                      <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-bold text-heading-dark mb-2">{course.title}</h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description || course.shortDescription}</p>

                        {!isLocked && (
                          <div className="w-full max-w-xs">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">التقدم</span>
                              <span className="font-bold text-primary">{progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-green-500' : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center">
                        {isCompleted ? (
                          <Link to={`/courses/${course.id}/play`} className="px-6 py-2.5 bg-gray-100 text-heading-dark font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2">
                            مراجعة الدورة
                          </Link>
                        ) : isLocked ? (
                          <div className="px-6 py-2.5 bg-gray-100 text-gray-400 font-bold rounded-xl flex items-center gap-2 cursor-not-allowed">
                            <FaLock />
                            مغلق
                          </div>
                        ) : (
                          <Link to={`/courses/${course.id}/play`} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/30 hover:-translate-y-1 transition-all flex items-center gap-2">
                            <FaPlayCircle />
                            {progress > 0 ? 'متابعة التعلم' : 'ابدأ التعلم الآن'}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PathPlayer;
