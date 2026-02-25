import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { roadmapService } from '../../services/roadmapService';
import HorizontalCardSkeleton from '../skeletons/HorizontalCardSkeleton';
import { ImageWithFallback } from '../../utils/imageUtils';

// Map tab labels to Material Symbols icons (AgriTech Context)
const TAB_ICONS = {
  'الكل': 'apps',
  'All': 'apps',
  'الإنتاج النباتي': 'park',
  'الري والتسميد': 'water_drop',
  'وقاية النباتات': 'bug_report',
  'الهندسة الزراعية': 'architecture',
  'الزراعة الذكية': 'memory',
  'تنسيق الحدائق': 'local_florist',
  'إدارة المشاتل': 'yard',
};

const getTabIcon = (tab) => TAB_ICONS[tab] || 'school';

const Tracks = ({ data }) => {
  const tabs = data?.tabs || [];
  const [activeTab, setActiveTab] = useState(tabs[0] || 'All');
  const swiperRef = useRef(null);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real roadmaps from Firebase
  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, []);

  // Filter roadmaps based on state
  const filteredRoadmaps =
    activeTab === 'الكل' || activeTab === 'All'
      ? roadmaps
      : roadmaps.filter(r => r.category === activeTab);

  // Duplicate slides if needed to ensure infinite loop works smoothly
  let displayRoadmaps = filteredRoadmaps;
  if (filteredRoadmaps.length > 0 && filteredRoadmaps.length < 6) {
    while (displayRoadmaps.length < 6) {
      displayRoadmaps = [...displayRoadmaps, ...filteredRoadmaps];
    }
  }

  const enableLoop = filteredRoadmaps.length > 0;

  return (
    <section className="section-padding bg-background-alt relative border-b border-border-light w-full overflow-hidden" id="tracks">
      <div className="container-layout relative">

        {/* 1. Header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4 border border-primary/20">
            {data?.badge || '🎯 مساراتك نحو الاحتراف'}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-heading-dark mb-6">
            {data?.title || 'خطط دراسية متدرجة ترسم لك'} <br /> <span className="text-primary">{data?.subtitle || 'الطريق من الأساسيات وحتى التخصص'}</span>
          </h2>
          <p className="text-xl text-body-text/70 font-medium mx-auto leading-relaxed">
            {data?.description || 'مصممة بعناية لبناء مهندس زراعي شامل يجمع بين المعرفة الأكاديمية والممارسة الميدانية.'}
          </p>
        </div>

        {/* 2. Goal Tabs (Scrollable on mobile) */}
        <div className="flex justify-start md:justify-center mb-10 md:mb-16 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto hide-scroll">
          <div className="flex gap-2 md:gap-3 pb-4">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(tab)}
                className={`
                  shrink-0 px-5 py-2.5 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold transition-all duration-300 flex items-center gap-2
                  ${activeTab === tab
                    ? 'bg-heading-dark text-white shadow-lg transform scale-105'
                    : 'bg-white text-heading-dark/70 hover:bg-gray-100 border border-border-light'
                  }
                `}
              >
                <span className="material-symbols-outlined text-lg">{getTabIcon(tab)}</span>
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Slider Container / Loading State */}
        <div className="relative mb-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <HorizontalCardSkeleton />
              <HorizontalCardSkeleton />
              <HorizontalCardSkeleton />
            </div>
          ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              onBeforeInit={(swiper) => { swiperRef.current = swiper; }}
              dir="rtl"
              centeredSlides={true}
              loop={enableLoop}
              watchSlidesProgress={true}
              spaceBetween={32}
              slidesPerView={1.05}
              breakpoints={{
                640: { slidesPerView: 1.5, spaceBetween: 24 },
                768: { slidesPerView: 2, spaceBetween: 32 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
              }}
              speed={800}
              autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              grabCursor={true}
              className="!py-12 !overflow-visible tracks-swiper"
              key={`${activeTab}-${displayRoadmaps.length}`}
            >
              {displayRoadmaps.map((roadmap, index) => (
                <SwiperSlide key={`${roadmap.id}-${index}`} className="h-auto">
                  <Link to={`/roadmaps/${roadmap.slug || roadmap.id}`} className="block h-full">
                    <div className="
                    relative h-[420px] md:h-[480px] w-full rounded-[32px] overflow-hidden
                    shadow-xl transition-all duration-500 ease-out
                    cursor-pointer border border-white/20 group bg-heading-dark transform
                    scale-100 md:scale-[0.85]
                    md:[.swiper-slide-active_&]:scale-105 [.swiper-slide-active_&]:shadow-2xl [.swiper-slide-active_&]:border-accent/50
                    hover:scale-100
                  ">
                      {/* Background Image */}
                      <div className="absolute inset-0">
                        <ImageWithFallback
                          src={roadmap.image}
                          fallbackSrc={`https://source.unsplash.com/random/800x600?tech,${roadmap.id}`}
                          alt={roadmap.title}
                          className="w-full h-full object-cover transition-transform duration-700 [.swiper-slide-active_&]:scale-110 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-heading-dark via-heading-dark/60 to-transparent"></div>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute top-0 bottom-0 left-0 right-0 p-8 flex flex-col justify-end">

                        {/* Top Badge */}
                        <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                          <span className="bg-white/10 backdrop-blur-md text-white border border-white/10 text-xs font-bold px-3 py-1.5 rounded-full">
                            {roadmap.tag || 'مسار شامل'}
                          </span>
                          {roadmap.isNew && (
                            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                              جديد 🔥
                            </span>
                          )}
                        </div>

                        <div className="transform translate-y-4 transition-transform duration-500 [.swiper-slide-active_&]:translate-y-0 group-hover:translate-y-0 opacity-100">
                          <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight drop-shadow-lg">
                            {roadmap.title}
                          </h3>

                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {roadmap.description || "تعلم كل المهارات اللازمة لتصبح محترفاً في هذا المجال من الصفر."}
                          </p>

                          <div className="flex flex-col gap-3">
                            {/* Outcome Badge */}
                            <div className="flex items-center gap-2 bg-accent/20 border border-accent/30 p-2 rounded-lg backdrop-blur-sm">
                              <span className="material-symbols-outlined text-accent">work</span>
                              <span className="text-accent font-bold text-sm">
                                يؤهلك لوظيفة: <span className="text-white">{roadmap.jobTitle || roadmap.title}</span>
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 mt-2 px-1">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">schedule</span> 6 أشهر
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">play_lesson</span> {roadmap.courseCount || 5} دورات
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">workspace_premium</span> شهادة
                              </span>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}

              {filteredRoadmaps.length === 0 && !loading && (
                <div className="text-center py-20 w-full text-gray-500 text-xl font-medium col-span-full h-[300px] flex items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  لا توجد مسارات متاحة في هذا التصنيف حالياً.
                </div>
              )}
            </Swiper>
          )}
        </div>

        {/* 4. Navigation & CTA Row */}
        <div className="flex flex-row items-center justify-center gap-3 md:gap-8 relative z-20 mb-8 md:mb-16 mt-8 w-full px-4 md:px-0">

          {/* Left Arrow (Prev in this context) */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-lg items-center justify-center text-heading-dark hover:text-primary hover:scale-110 transition-all duration-300 hover:shadow-xl border border-gray-100 group cursor-pointer shrink-0"
            aria-label="Previous"
          >
            <span className="material-symbols-outlined text-xl md:text-3xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>

          {/* Main CTA */}
          <Link to="/learning-paths" className="flex-1 md:flex-none w-auto px-4 py-3 md:px-10 md:py-4 bg-primary hover:bg-accent text-white font-black text-sm md:text-lg rounded-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:scale-105 flex items-center justify-center gap-2 whitespace-nowrap">
            <span>استكشف جميع المسارات</span>
          </Link>

          {/* Right Arrow (Next in this context) */}
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="flex w-10 h-10 md:w-14 md:h-14 bg-white rounded-full shadow-lg items-center justify-center text-heading-dark hover:text-primary hover:scale-110 transition-all duration-300 hover:shadow-xl border border-gray-100 group cursor-pointer shrink-0"
            aria-label="Next"
          >
            <span className="material-symbols-outlined text-xl md:text-3xl group-hover:-translate-x-1 transition-transform">arrow_back</span>
          </button>

        </div>

      </div>
    </section>
  );
};

export default Tracks;
