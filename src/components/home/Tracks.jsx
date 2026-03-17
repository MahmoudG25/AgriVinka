import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import { roadmapService } from '../../services/firestore/roadmapService';
import HorizontalCardSkeleton from '../skeletons/HorizontalCardSkeleton';
import { ImageWithFallback } from '../../utils/imageUtils';

const Tracks = ({ data }) => {
  const swiperRef = useRef(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('الكل');

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        const all = await roadmapService.getAllRoadmaps();
        setRoadmaps(all);
      } catch (err) {
        console.warn('Failed to load roadmaps:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, []);

  // Dynamically build filter tabs from real categories
  const categories = ['الكل', ...new Set(roadmaps.map(r => r.category).filter(Boolean))];

  // Filter roadmaps by active category
  const filtered = activeFilter === 'الكل'
    ? roadmaps
    : roadmaps.filter(r => r.category === activeFilter);

  // Duplicate slides until at least 4 so the slider renders properly
  const MIN_SLIDES = 4;
  let displayRoadmaps = filtered;
  if (filtered.length > 0 && filtered.length < MIN_SLIDES) {
    while (displayRoadmaps.length < MIN_SLIDES) {
      displayRoadmaps = [...displayRoadmaps, ...filtered];
    }
  }

  const shouldLoop = displayRoadmaps.length >= MIN_SLIDES;

  return (
    <section className="py-20 bg-[#f8f9fb] w-full" id="tracks">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
            {data?.badge || '🎯 مساراتك نحو الاحتراف'}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-4">
            {data?.title || 'خطط دراسية متدرجة ترسم لك'}
            <br />
            <span className="text-primary">{data?.subtitle || 'الطريق من الأساسيات وحتى التخصص'}</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            {data?.description || 'مصممة بعناية لبناء مهندس زراعي شامل يجمع بين المعرفة الأكاديمية والممارسة الميدانية.'}
          </p>
        </div>

        {/* Category filters */}
        {!loading && categories.length > 1 && (
          <div className="flex justify-center flex-wrap gap-2 mb-10">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveFilter(cat);
                  // Wait for re-render then go back to first slide
                  setTimeout(() => swiperRef.current?.slideTo(0, 0), 50);
                }}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 border
                  ${activeFilter === cat
                    ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Slider */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <HorizontalCardSkeleton />
            <HorizontalCardSkeleton />
            <HorizontalCardSkeleton />
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400 text-lg">
            لا توجد مسارات متاحة حالياً.
          </div>
        ) : (
          <div className="w-full overflow-hidden">
            <Swiper
              key={activeFilter}
              modules={[Autoplay, Navigation]}
              onSwiper={(swiper) => { swiperRef.current = swiper; }}
              spaceBetween={20}
              slidesPerView={1}
              breakpoints={{
                640:  { slidesPerView: 1.3 },
                768:  { slidesPerView: 2   },
                1024: { slidesPerView: 3   },
              }}
              loop={shouldLoop}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              grabCursor
              style={{ direction: 'rtl' }}
              className="w-full"
            >
              {displayRoadmaps.map((roadmap, i) => (
                <SwiperSlide key={`${roadmap.id}-${i}`}>
                  <Link to={`/roadmaps/${roadmap.slug || roadmap.id}`}>
                    <div
                      className="relative rounded-2xl overflow-hidden bg-gray-900 group cursor-pointer"
                      style={{ height: '380px' }}
                    >
                      {/* Image */}
                      <ImageWithFallback
                        src={roadmap.image}
                        fallbackSrc={`https://picsum.photos/seed/${roadmap.id}/800/600`}
                        alt={roadmap.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                      {/* Badge top */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-black/40 backdrop-blur-sm text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full">
                          {roadmap.tag || 'مسار شامل'}
                        </span>
                      </div>

                      {/* Content bottom */}
                      <div className="absolute bottom-0 inset-x-0 p-5 text-right">
                        <h3 className="text-lg font-black text-white mb-1 leading-snug line-clamp-2">
                          {roadmap.title}
                        </h3>
                        <p className="text-gray-300 text-xs mb-3 line-clamp-2">
                          {roadmap.description || 'تعلم كل المهارات اللازمة لتصبح محترفاً من الصفر.'}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-300 mb-3">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>play_lesson</span>
                            {roadmap.courseCount || (roadmap.modules || []).length || 5} دورات
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>workspace_premium</span>
                            شهادة معتمدة
                          </span>
                        </div>

                        <span className="inline-flex items-center gap-1 bg-primary text-white text-xs font-black px-4 py-2 rounded-lg">
                          ابدأ المسار
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>arrow_back</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

        {/* Navigation */}
        {!loading && roadmaps.length > 0 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="w-12 h-12 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center text-gray-700 hover:text-primary hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <Link
              to="/roadmaps"
              className="px-8 py-3 bg-primary text-white font-black rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
              استكشف جميع المسارات
            </Link>

            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="w-12 h-12 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center text-gray-700 hover:text-primary hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};

export default Tracks;