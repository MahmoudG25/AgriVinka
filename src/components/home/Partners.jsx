import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';

const Partners = ({ data }) => {
  // Data is now an array of partner objects { id, name, logo }
  const partners = Array.isArray(data) ? data : (data?.logos || []);
  const title = data?.title || 'نعتز بثقة شركائنا في مسيرة التنمية الزراعية';

  if (!partners || partners.length === 0) {
    console.warn("Partners component received empty data:", data);
    return null;
  }

  return (
    <section className="w-full bg-white border-b border-border-light py-10 overflow-hidden relative" aria-label="Trusted By">
      <div className="container-layout mb-10 text-center">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">{title}</h2>
      </div>

      {/* Fade Gradient Masks */}
      <div className="absolute top-0 left-0 h-full w-24 md:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 h-full w-24 md:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

      {/* Swiper Container */}
      <div className="w-full" dir="ltr">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={0}
          slidesPerView="auto"
          loop={true}
          speed={4000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          className="partners-swiper"
        >
          {/* 3x duplication for smooth infinite loop */}
          {[...partners, ...partners, ...partners].map((partner, index) => (
            <SwiperSlide key={index} className="!w-auto">
              <div
                className="flex items-center justify-center shrink-0 mx-8 md:mx-12 w-32 md:w-40 h-16 transition-all duration-500 hover:scale-110 cursor-alias"
                title={partner.name}
              >
                <img
                  src={partner.logo || partner.src}
                  alt={partner.name}
                  className="w-full h-full object-contain max-h-14 md:max-h-14"
                  draggable="false"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Partners;
