import React, { useState, useEffect } from 'react';
import SEOHead from '../components/common/SEOHead';
import { logger } from '../utils/logger';

import Hero from '../components/home/Hero';
import FeaturedCourses from '../components/home/FeaturedCourses';
import PlatformFeatures from '../components/home/PlatformFeatures';
import AnalyzerPreview from '../components/home/AnalyzerPreview';
import Tracks from '../components/home/Tracks';
import Testimonials from '../components/home/Testimonials';
import Pricing from '../components/home/Pricing';
import FAQ from '../components/home/FAQ';
import CTA from '../components/home/CTA';

import HeroSkeleton from '../components/skeletons/HeroSkeleton';
import CardSkeleton from '../components/skeletons/CardSkeleton';

import { pageService } from '../services/firestore/pageService';

const Home = () => {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await pageService.getPageData('home');
        setHomeData(data || {});
      } catch (error) {
        logger.error('Error fetching home data:', error);
        setHomeData({});
      }
    };
    fetchHomeData();
  }, []);

  if (!homeData) {
    return (
      <main className="w-full min-h-screen bg-white">
        <HeroSkeleton />
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </main>
    );
  }

  return (
    <>
      <SEOHead
        title={homeData.seo?.metaTitle || "AgriVinka | تعلم الزراعة باسلوب بسيط"}
        description={homeData.seo?.metaDescription || "اكتشف أفضل كورسات الزراعه. مسارات الزراعة شاملة من المبتدئ للمتقدم."}
        keywords={homeData.seo?.keywords || "كورسات زراعة, تعلم الزراعة, مسارات زراعية, دورات زراعية"}
      />
      <main className="w-full overflow-hidden">
        <Hero data={homeData.hero} />
        <FeaturedCourses data={homeData.featuredCourses} />
        <PlatformFeatures data={homeData.platformFeatures} />
        <AnalyzerPreview />
        <Tracks data={homeData.tracks} />
        <Testimonials testimonials={homeData.testimonials} />
        <Pricing data={homeData.pricing} />
        <CTA data={homeData.ctaFinal} />
        <FAQ data={homeData.faq} />

      </main>
    </>
  );
};

export default Home;
