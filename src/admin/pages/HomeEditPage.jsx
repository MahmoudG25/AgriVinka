import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../utils/logger';
import { addToast } from '../../store/slices/uiSlice';
import { MdSave, MdAdd, MdDelete, MdExpandMore, MdExpandLess } from 'react-icons/md';
import { pageService } from '../../services/pageService';
import MediaUploader from '../components/MediaUploader';
import { v4 as uuidv4 } from 'uuid';
import { defaultRoadmapData, defaultSteps } from '../../components/home/Roadmap';

// Subcomponents
import HeroSectionAdmin from '../components/home/HeroSectionAdmin';
import PartnersSectionAdmin from '../components/home/PartnersSectionAdmin';
import DiagnosisSectionAdmin from '../components/home/DiagnosisSectionAdmin';
import TracksSectionAdmin from '../components/home/TracksSectionAdmin';
import RoadmapSectionAdmin from '../components/home/RoadmapSectionAdmin';
import TestimonialsSectionAdmin from '../components/home/TestimonialsSectionAdmin';
import FaqSectionAdmin from '../components/home/FaqSectionAdmin';
import PricingSectionAdmin from '../components/home/PricingSectionAdmin';
import AboutSectionAdmin from '../components/home/AboutSectionAdmin';
import CtaSectionAdmin from '../components/home/CtaSectionAdmin';

const HomeEditPage = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hero');
  const [formData, setFormData] = useState({
    hero: { title: '', subtitle: '', ctaText: '', ctaLink: '/paths', stats: [], bgImage: '', images: [], badge: '', videoUrl: '' }, // Added badge & videoUrl
    partners: [],
    mission: { title: '', description: '', features: [] },
    diagnosis: { title: '', subtitle: '', items: [] }, // NEW: Problem Agitation
    tracks: { title: '', subtitle: '', items: [] },
    trackFeatures: [],
    roadmap: { title: '', subtitle: '', steps: [] }, // NEW: Journey
    testimonials: [],
    faq: [],
    pricing: { title: 'Pricing', subtitle: 'Choose your plan', plans: [] },
    about: { title: '', content: '', image1: '', image2: '' }, // NEW: About Preview
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
              partners: Array.isArray(data.partners) ? data.partners : [],
              mission: { ...prev.mission, ...(data.mission || {}), features: (data.mission?.features && Array.isArray(data.mission.features)) ? data.mission.features : [] },
              diagnosis: { ...prev.diagnosis, ...(data.diagnosis || {}), items: (data.diagnosis?.items && Array.isArray(data.diagnosis.items)) ? data.diagnosis.items : [] },
              testimonials: Array.isArray(data.testimonials) ? data.testimonials : [],
              faq: Array.isArray(data.faq) ? data.faq : [],
              pricing: { ...prev.pricing, ...(data.pricing || {}), plans: Array.isArray(data.pricing?.plans) ? data.pricing.plans : [] },
              about: { ...prev.about, ...(data.about || {}) },
              ctaFinal: { ...prev.ctaFinal, ...(data.ctaFinal || {}), images: (data.ctaFinal?.images && Array.isArray(data.ctaFinal.images)) ? data.ctaFinal.images : [] }
            };

            // Check and initialize roadmap if missing
            if (!updatedData.roadmap || Object.keys(updatedData.roadmap).length === 0 || !updatedData.roadmap.steps || updatedData.roadmap.steps.length === 0) {
              updatedData.roadmap = {
                ...defaultRoadmapData,
                steps: defaultSteps.map(step => ({ ...step, id: step.id || uuidv4() })) // Ensure IDs for default steps
              };
            } else {
              // If roadmap exists, ensure steps format
              updatedData.roadmap = {
                ...updatedData.roadmap,
                steps: (updatedData.roadmap.steps && Array.isArray(updatedData.roadmap.steps)) ? updatedData.roadmap.steps : []
              };
            }

            return updatedData;
          });
        } else {
          // No data found in DB, initialize with defaults
          setFormData(prev => ({
            ...prev,
            roadmap: {
              ...defaultRoadmapData,
              steps: defaultSteps.map(step => ({ ...step, id: step.id || uuidv4() }))
            }
          }));
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
      await pageService.updatePageData('home', formData);
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
    { id: 'partners', label: 'الشركاء' },
    { id: 'diagnosis', label: 'المشكلة (Diagnosis)' }, // New
    { id: 'tracks', label: 'المسارات (Tracks)' },
    { id: 'roadmap', label: 'الرحلة (Roadmap)' }, // New
    { id: 'testimonials', label: 'آراء العملاء' },
    { id: 'faq', label: 'الأسئلة الشائعة' },
    { id: 'pricing', label: 'الأسعار' },
    { id: 'about', label: 'من نحن (About)' },
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

        {/* PARTNERS SECTION */}
        {activeTab === 'partners' && (
          <PartnersSectionAdmin
            data={formData.partners}
            onAddItem={addItem}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
          />
        )}

        {/* DIAGNOSIS SECTION (NEW) */}
        {activeTab === 'diagnosis' && (
          <DiagnosisSectionAdmin
            data={formData.diagnosis}
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

        {/* ROADMAP SECTION (NEW) */}
        {activeTab === 'roadmap' && (
          <RoadmapSectionAdmin
            data={formData.roadmap}
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

        {/* FAQ SECTION */}
        {activeTab === 'faq' && (
          <FaqSectionAdmin
            data={formData.faq}
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

        {/* ABOUT SECTION */}
        {activeTab === 'about' && (
          <AboutSectionAdmin data={formData.about} onChange={handleChange} />
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
