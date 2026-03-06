import React, { useEffect, useState } from 'react';
import { pageService } from '../../../services/firestore/pageService';
import { defaultSteps, defaultRoadmapData } from '../../../components/home/Roadmap';
import { v4 as uuidv4 } from 'uuid';

const SeedRoadmapPage = () => {
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    const seed = async () => {
      setStatus('Seeding...');
      try {
        // Ensure IDs
        const stepsWithIds = defaultSteps.map(step => ({
          ...step,
          id: step.id || uuidv4()
        }));

        await pageService.updatePageData('home', {
          roadmap: {
            ...defaultRoadmapData,
            steps: stepsWithIds
          }
        });
        setStatus('Success! Database Updated with Roadmap Content.');
      } catch (e) {
        console.error(e);
        setStatus('Error: ' + e.message);
      }
    };
    seed();
  }, []);

  return (
    <div className="p-12 text-center">
      <h1 className="text-3xl font-bold mb-6 text-heading-dark">Roadmap Database Seeder</h1>
      <div className={`text-xl font-mono p-4 rounded-lg inline-block ${status.includes('Success') ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
        {status}
      </div>
      {status.includes('Success') && (
        <p className="mt-4 text-gray-500">You can now go back to <a href="/features/admin/home" className="text-primary underline">Admin Home</a>.</p>
      )}
    </div>
  );
};

export default SeedRoadmapPage;
