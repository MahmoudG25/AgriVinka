import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../courses/CourseCard';
import { courseService } from '../../services/firestore/courseService';
import CardSkeleton from '../skeletons/CardSkeleton';

const FeaturedCourses = ({ data }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const limit = data?.limit || 4;
        const result = await courseService.getPublishedCourses(limit);
        setCourses(result.courses || []);
      } catch (err) {
        console.error('Failed to load featured courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [data?.limit]);

  return (
    <section className="section-padding bg-background-light relative z-10 w-full" id="featured-courses">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-black text-heading-dark mb-4 drop-shadow-sm">
              {data?.title || 'أحدث الدورات التدريبية'}
            </h2>
            <p className="text-lg text-body-text/80 font-medium">
              {data?.subtitle || 'اخترنا لك مجموعة من أفضل دوراتنا لتطوير مسيرتك المهنية ومهاراتك الزراعية.'}
            </p>
          </div>
          <Link
            to="/courses"
            className="group flex items-center justify-center gap-2 bg-white text-heading-dark font-bold px-6 py-3 rounded-xl border border-border-light hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all"
          >
            عرض كل الدورات
            <span className="material-symbols-outlined rtl:rotate-180 group-hover:-translate-x-1 transition-transform">arrow_left_alt</span>
          </Link>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 xl:gap-8">
          {loading ? (
            Array(data?.limit || 4).fill(0).map((_, i) => <CardSkeleton key={`skeleton-${i}`} />)
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
             <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
               <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">school</span>
               <p className="text-gray-500 font-medium">لا توجد دورات متاحة حالياً.</p>
             </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCourses;
