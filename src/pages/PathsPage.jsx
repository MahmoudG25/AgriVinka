import React, { useState, useEffect } from 'react';
import SEOHead from '../components/common/SEOHead';
import { logger } from '../utils/logger';
import PathsHeader from '../components/paths/PathsHeader';
import PathCard from '../components/paths/PathCard';
import FAQ from '../components/home/FAQ';
import { roadmapService } from '../services/roadmapService';

const PathsPage = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: null,
    level: null,
    sort: null,
    order: null
  });

  useEffect(() => {
    const fetchRoadmapsAndCourses = async () => {
      try {
        setLoading(true);
        const [roadmapsData, coursesData] = await Promise.all([
          roadmapService.getAllRoadmaps(),
          import('../services/courseService').then(m => m.courseService.getAllCourses())
        ]);

        const courseMap = {};
        coursesData.forEach(c => {
          courseMap[c.id] = c;
        });

        const hydratedRoadmaps = roadmapsData.map(roadmap => {
          if (!roadmap.modules) return roadmap;

          const newModules = roadmap.modules.map(mod => {
            if ((!mod.image || mod.image.trim() === '') && mod.courseId && courseMap[mod.courseId]) {
              return {
                ...mod,
                image: courseMap[mod.courseId].image || courseMap[mod.courseId].media?.thumbnail || courseMap[mod.courseId].preview_image || ''
              };
            }
            return mod;
          });

          return { ...roadmap, modules: newModules };
        });

        setRoadmaps(hydratedRoadmaps);
      } catch (error) {
        logger.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmapsAndCourses();
  }, []);

  const filteredRoadmaps = React.useMemo(() => {
    let result = [...roadmaps];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        r.tag?.toLowerCase().includes(query)
      );
    }

    if (filters.category) {
      result = result.filter(r => r.tag === filters.category);
    }

    if (filters.level) {
      result = result.filter(r => r.level.includes(filters.level) || filters.level === r.level);
    }

    if (filters.sort && filters.order) {
      result.sort((a, b) => {
        let valA, valB;

        if (filters.sort === 'duration') {
          const getHours = (str) => {
            if (str === 'Self-paced') return 999;
            return parseInt(str) || 0;
          };
          valA = getHours(a.duration);
          valB = getHours(b.duration);
        } else if (filters.sort === 'price') {
          valA = a.price || 0;
          valB = b.price || 0;
        }

        return filters.order === 'asc' ? valA - valB : valB - valA;
      });
    }

    return result;
  }, [searchQuery, filters, roadmaps]);

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ category: null, level: null, sort: null, order: null });
  };

  return (
    <main className="pt-32 pb-20 min-h-screen bg-[#f8f9fb]">
      <div className="container-layout space-y-12">
        <PathsHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          onClear={clearFilters}
        />

        <div className="roadmap-list space-y-12">
          {loading ? (
            <div className="text-center py-20">Loading...</div>
          ) : filteredRoadmaps.length > 0 ? (
            filteredRoadmaps.map((roadmap) => (
              <PathCard key={roadmap.id} roadmap={roadmap} />
            ))
          ) : (
            <div className="text-center py-20 text-gray-400">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-50">search_off</span>
              <p className="text-xl">لا توجد مسارات تطابق بحثك</p>
              <button onClick={clearFilters} className="mt-4 text-primary font-bold hover:underline">
                مسح الفلاتر
              </button>
            </div>
          )}
        </div>
      </div>

      <FAQ />
    </main>
  );
};

export default PathsPage;

