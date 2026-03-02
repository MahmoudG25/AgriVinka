import React, { useState, useEffect } from 'react';
import SEOHead from '../components/common/SEOHead';
import { logger } from '../utils/logger';

import Hero from '../components/home/Hero';
import Partners from '../components/home/Partners';
import Diagnosis from '../components/home/Diagnosis';
import Tracks from '../components/home/Tracks';
import Roadmap from '../components/home/Roadmap';
import Pricing from '../components/home/Pricing';
import Testimonials from '../components/home/Testimonials';
import CTA from '../components/home/CTA';
import FAQ from '../components/home/FAQ';
import Mission from '../components/home/Mission';
import AboutPreview from '../components/home/AboutPreview';

import HeroSkeleton from '../components/skeletons/HeroSkeleton';
import CardSkeleton from '../components/skeletons/CardSkeleton';

import { pageService } from '../services/pageService';
import { SectionRegistry } from '../admin/utils/SectionRegistry';

const Home = () => {
  const [homeData, setHomeData] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await pageService.getPageData('home');
        setHomeData(data);
      } catch (error) {
        logger.error('Error fetching home data:', error);
      }
    };
    fetchHomeData();
  }, []);

  if (!homeData) {
    return (
      <main className="w-full min-h-screen bg-white">
        <HeroSkeleton />
        <div className="container-layout py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
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
        title={homeData.seo?.metaTitle || "Namaa Academy |تعلم الزراعة باسلوب بسيط "}
        description={homeData.seo?.metaDescription || "اكتشف أفضل كورسات الزراعه . مسارات الزراعة شاملة من المبتدئ للمتقدم."}
        keywords={homeData.seo?.keywords || "كورسات زراعة, تعلم الزراعة, مسارات زراعية, دورات زراعية"}
      />
      <main className="w-full overflow-hidden">
        {homeData.sections && homeData.sections.length > 0 ? (
          // Dynamic Rendering Mode (From CMS)
          homeData.sections.map((section) => {
            const SectionComponent = SectionRegistry[section.type]?.component;
            if (!SectionComponent) return null;
            // Spread section ID to allow React to track keys
            return <SectionComponent key={section.id} data={section.data} />;
          })
        ) : (
          // Fallback legacy static rendering if no dynamic sections exist
          <>
            <Hero data={homeData.hero} />
            <Partners data={homeData.partners} />
            <Diagnosis data={homeData.diagnosis} />
            <Tracks data={homeData.tracks} />
            <Roadmap data={homeData.roadmap || { steps: [] }} />
            <Testimonials testimonials={homeData.testimonials} />
            <Pricing data={homeData.pricing} />
            <AboutPreview data={homeData.about} />
            <CTA data={homeData.ctaFinal} />
            <FAQ data={homeData.faq} />
            {homeData.mission && <Mission data={homeData.mission} />}
          </>
        )}
      </main>
    </>
  );
};

export default Home;
