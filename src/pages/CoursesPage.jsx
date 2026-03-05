import React, { useState, useEffect, useMemo } from 'react';
import SEOHead from '../components/common/SEOHead';
import { courseService } from '../services/courseService';
import { logger } from '../utils/logger';
import CourseCard from '../components/courses/CourseCard';
import CourseSkeleton from '../components/courses/CourseSkeleton';
import CourseFilter from '../components/courses/CourseFilter';
import { motion, AnimatePresence } from 'framer-motion';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');

  // Fetch Courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        // Fetch published courses
        const { courses: data } = await courseService.getPublishedCourses(100);
        setCourses(data);
      } catch (error) {
        logger.error('Failed to load courses', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Derived State: Categories
  const categories = useMemo(() => {
    const cats = new Set(courses.map(c => (c.category?.trim())).filter(Boolean));
    return Array.from(cats);
  }, [courses]);

  // Derived State: Filtered & Sorted Courses
  const processedCourses = useMemo(() => {
    let result = [...courses];

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }

    // 2. Category
    if (activeCategory !== 'All') {
      result = result.filter(c => (c.category?.trim() || 'عام') === activeCategory);
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return (a.price || 0) - (b.price || 0);
        case 'price-desc':
          return (b.price || 0) - (a.price || 0);
        case 'popular':
          // Assuming 'students' count indicates popularity
          return (b.students || 0) - (a.students || 0);
        case 'newest':
        default:
          // Fallback to createdAt or ID if no date
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
    });

    return result;
  }, [courses, searchQuery, activeCategory, sortOption]);

  return (
    <div className="min-h-screen bg-background-alt pb-20">
      <SEOHead
        title="كورسات برمجة متقدمة | AgriVinka"
        description="اكتشف أفضل كورسات البرمجة والتصميم. دورات تدريبية متقدمة من المبتدئ للمتقدم في ويب، تطبيقات، ذكاء اصطناعي وأكثر."
        keywords="كورسات برمجة, دورات تدريبية, تعلم البرمجة, JavaScript, React, Python, ويب"
        canonical={window.location.href}
      />

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-surface-white border-b border-border-light">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="container-layout relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className=" mx-auto w-full"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-6 border border-primary/20">
              🎓 تعلم وتطور
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-heading-dark mb-6 leading-tight break-words">
              طور مهاراتك بأفضل <span className="text-primary">الكورسات</span>
            </h1>
            <p className="text-xl text-body-text/70 font-medium  mx-auto leading-relaxed break-words">
              مكتبة شاملة من الكورسات التدريبية المتقدمة في البرمجة، التصميم، والذكاء الاصطناعي. تعلم من الخبراء وابنِ مستقبلك المهني.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Filter Bar */}
      <CourseFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortOption={sortOption}
        onSortChange={setSortOption}
      />

      {/* 3. Courses Grid */}
      <div className="container-layout">

        {/* Results Count */}
        <div className="mb-8 text-gray-500 font-bold text-sm">
          عثرنا على {processedCourses.length} دورة تدريبية
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {loading ? (
              // Skeletons
              [...Array(6)].map((_, i) => (
                <CourseSkeleton key={`skel-${i}`} />
              ))
            ) : processedCourses.length > 0 ? (
              // Real Data
              processedCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              // Empty State
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-20 text-center"
              >
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="material-symbols-outlined text-4xl text-gray-400">search_off</span>
                </div>
                <h3 className="text-xl font-bold text-heading-dark mb-2">لا توجد نتائج</h3>
                <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير التصنيف.</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  مسح الفلاتر
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default CoursesPage;
