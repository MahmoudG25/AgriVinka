import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import { addToast } from '../../../app/store/slices/uiSlice';
import { MdSave, MdAdd, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { pageService } from '../../../services/firestore/pageService';
import MediaUploader from '../components/MediaUploader';
import { v4 as uuidv4 } from 'uuid';
import { defaultRoadmapData, defaultSteps } from '../../../components/home/Roadmap';

// Subcomponents
import HeroSectionAdmin from '../components/home/HeroSectionAdmin'; 
import FeaturedCoursesSectionAdmin from '../components/home/FeaturedCoursesSectionAdmin'; 
import PlatformFeaturesSectionAdmin from '../components/home/PlatformFeaturesSectionAdmin'; 
import TracksSectionAdmin from '../components/home/TracksSectionAdmin';
import TestimonialsSectionAdmin from '../components/home/TestimonialsSectionAdmin';
import PricingSectionAdmin from '../components/home/PricingSectionAdmin';
import FaqSectionAdmin from '../components/home/FaqSectionAdmin';
import CtaSectionAdmin from '../components/home/CtaSectionAdmin';

const HomeEditPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [formData, setFormData] = useState({
    hero: { title: '', subtitle: '', ctaText: '', ctaLink: '/paths', stats: [], bgImage: '', images: [], badge: '', videoUrl: '' },
    featuredCourses: { title: '', subtitle: '', limit: 4 },
    platformFeatures: { badge: '', title: '', subtitle: '', features: [] },
    tracks: { title: '', subtitle: '', items: [] },
    testimonials: [],
    pricing: {
      title: 'استثمر في مستقبلك الزراعي',
      subtitle: 'خطط مرنة تناسب جميع المستويات، مع ضمان استرداد الأموال خلال 30 يوماً.',
      plans: [
        {
          id: 'plan-basic',
          title: 'الخطة الأساسية',
          price: '99',
          originalPrice: '',
          period: '/شهرياً',
          badge: 'ابدأ مجاناً',
          subtitle: 'مثالية للمبتدئين',
          description: 'ابدأ رحلتك في تعلم الزراعة بخطوات صغيرة',
          features: [
            'الوصول لـ 5 دورات مجاناً',
            'شهادة إتمام لكل دورة',
            'دعم عبر البريد الإلكتروني',
            'تحديثات المحتوى',
          ],
          highlight: false,
          image: '',
          buttonText: 'ابدأ الآن',
        },
        {
          id: 'plan-pro',
          title: 'الخطة الاحترافية',
          price: '299',
          originalPrice: '499',
          period: '/شهرياً',
          badge: '⭐ الأكثر طلباً',
          subtitle: 'للراغبين في التميز',
          description: 'تعلم بشكل أسرع مع وصول كامل لجميع المسارات',
          features: [
            'وصول كامل لجميع الدورات',
            'مسارات تعليمية متكاملة',
            'شهادات معتمدة',
            'دعم مباشر مع المدربين',
            'مشاريع عملية ميدانية',
          ],
          highlight: true,
          image: '',
          buttonText: 'اشترك الآن',
        },
        {
          id: 'plan-premium',
          title: 'الخطة الشاملة',
          price: '599',
          originalPrice: '999',
          period: '/سنوياً',
          badge: '🏆 القيمة الأعلى',
          subtitle: 'للمحترفين والمؤسسات',
          description: 'حزمة متكاملة للمحترفين الذين يسعون للتميز',
          features: [
            'كل ما في الخطة الاحترافية',
            'جلسات تدريب فردية شهرية',
            'عضوية منتدى الخبراء',
            'أولوية في التدريب العملي',
            'وصول مدى الحياة للمحتوى',
          ],
          highlight: false,
          image: '',
          buttonText: 'تواصل معنا',
        },
      ]
    },
    faq: [],
    ctaFinal: { title: '', subtitle: '', buttonText: '', images: [] }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await pageService.getPageData('home');

        if (data) {
          setFormData(prev => {
            const updatedData = {
              ...prev,
              ...data,
              hero: { ...prev.hero, ...(data.hero || {}), stats: (data.hero?.stats && Array.isArray(data.hero.stats)) ? data.hero.stats : [], images: data.hero?.images || [] },
              featuredCourses: { ...prev.featuredCourses, ...(data.featuredCourses || {}) },
              platformFeatures: { ...prev.platformFeatures, ...(data.platformFeatures || {}), features: (data.platformFeatures?.features && Array.isArray(data.platformFeatures.features)) ? data.platformFeatures.features : [] },
              tracks: { ...prev.tracks, ...(data.tracks || {}) },
              testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
              pricing: { ...prev.pricing, ...(data.pricing || {}), plans: (Array.isArray(data.pricing?.plans) && data.pricing.plans.length > 0) ? data.pricing.plans : prev.pricing.plans },
              faq: Array.isArray(data.faq) ? data.faq : [],
              ctaFinal: { ...prev.ctaFinal, ...(data.ctaFinal || {}), images: (data.ctaFinal?.images && Array.isArray(data.ctaFinal.images)) ? data.ctaFinal.images : [] }
            };

            return updatedData;
          });
        } else {
          // No data found in DB, initialize with defaults
          setFormData(prev => ({ ...prev }));
        }
      } catch (error) {
        logger.error('Error fetching home data:', error);
        dispatch(addToast({ type: 'error', message: 'فشل تحميل البيانات' }));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [dispatch]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Deeply remove undefined values to prevent Firestore crash
      const removeUndefined = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(removeUndefined);
        } else if (obj !== null && typeof obj === 'object') {
          return Object.keys(obj).reduce((acc, key) => {
            if (obj[key] !== undefined) {
              acc[key] = removeUndefined(obj[key]);
            }
            return acc;
          }, {});
        }
        return obj;
      };

      const sanitizedData = removeUndefined(formData);

      await pageService.updatePageData('home', sanitizedData);
      // Invalidate cache so changes appear immediately on refresh
      try { localStorage.removeItem('namaa_page_cache_home'); } catch (_e) { /* ignore */ }
      dispatch(addToast({ type: 'success', message: 'تم تحديث الصفحة الرئيسية بنجاح' }));
    } catch (error) {
      logger.error('Error updating home page:', error);
      dispatch(addToast({ type: 'error', message: 'فشل حفظ التغييرات' }));
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers for Arrays (Testimonials, FAQ, Partners, Plans) ---
  const addItem = (section, template) => {
    // Handle nested arrays (like pricing.plans) vs top-level arrays
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: [...(prev[parent][child] || []), { id: uuidv4(), ...template }]
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: [...(prev[section] || []), { id: uuidv4(), ...template }]
      }));
    }
  };

  const updateItem = (section, id, field, value) => {
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: prev[parent][child].map(item => item.id === id ? { ...item, [field]: value } : item)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].map(item => item.id === id ? { ...item, [field]: value } : item)
      }));
    }
  };

  const removeItem = (section, id) => {
    if (section.includes('.')) {
      const [parent, child] = section.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: prev[parent][child].filter(item => item.id !== id)
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: prev[section].filter(item => item.id !== id)
      }));
    }
  };

  if (loading) return <div>Loading...</div>;

  const tabs = [
    { id: 'hero', label: 'الرئيسية (Hero)' },
    { id: 'featuredCourses', label: 'الدورات المميزة' },
    { id: 'platformFeatures', label: 'مميزات المنصة' },
    { id: 'tracks', label: 'المسارات التعليمية' },
    { id: 'testimonials', label: 'آراء العملاء' },
    { id: 'pricing', label: 'الأسعار' },
    { id: 'faq', label: 'الأسئلة الشائعة' },
    { id: 'cta', label: 'الخاتمة (CTA)' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading-dark">إدارة الصفحة الرئيسية</h1>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-heading-dark font-bold px-6 py-3 rounded-xl hover:bg-accent shadow-lg shadow-primary/20 transition-all"
        >
          <MdSave size={20} />
          <span>حفظ التغييرات</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light min-h-[400px]">

        {/* HERO SECTION */}
        {activeTab === 'hero' && (
          <HeroSectionAdmin data={formData.hero} onChange={handleChange} />
        )}

        {/* FEATURED COURSES SECTION */}
        {activeTab === 'featuredCourses' && (
          <FeaturedCoursesSectionAdmin data={formData.featuredCourses} onChange={handleChange} />
        )}

        {/* PLATFORM FEATURES SECTION */}
        {activeTab === 'platformFeatures' && (
          <PlatformFeaturesSectionAdmin
            data={formData.platformFeatures}
            onChange={handleChange}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        )}

        {/* TRACKS SECTION */}
        {activeTab === 'tracks' && (
          <TracksSectionAdmin
            data={formData.tracks}
            onChange={handleChange}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        )}

        {/* TESTIMONIALS SECTION */}
        {activeTab === 'testimonials' && (
          <TestimonialsSectionAdmin
            data={formData.testimonials}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        )}

        {/* PRICING SECTION */}
        {activeTab === 'pricing' && (
          <PricingSectionAdmin
            data={formData.pricing}
            onChange={handleChange}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        )}

        {/* FAQ SECTION */}
        {activeTab === 'faq' && (
          <FaqSectionAdmin
            data={formData.faq}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        )}

        {/* FINAL CTA SECTION */}
        {activeTab === 'cta' && (
          <CtaSectionAdmin data={formData.ctaFinal} onChange={handleChange} />
        )}

      </div>
    </form>
  );
};

export default HomeEditPage;
