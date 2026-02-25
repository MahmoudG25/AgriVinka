import React from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '../../utils/imageUtils';

const RoadmapModules = ({ modules }) => {
  return (
    <div className="relative border-r-2 border-primary/20 mr-8 lg:mr-12 space-y-12 pb-12">
      {/* Timeline Start Decoration */}
      <div className="absolute -right-[9px] -top-2 w-4 h-4 rounded-full bg-primary ring-4 ring-white z-10"></div>

      {modules.map((module, index) => {
        // Hybrid Image Logic:
        // 1. If it's a full URL (http/https), use it directly (Cloudinary/Firebase).
        // 2. If it's a legacy filename (e.g. 'react.png'), prepend the assets path.
        // 3. Defaults to empty string if missing.
        let imagePath = '';
        if (module.image) {
          if (module.image.startsWith('http') || module.image.startsWith('/') || module.image.includes('cloudinary')) {
            imagePath = module.image;
          } else {
            // Assume legacy local asset
            imagePath = `/src/assets/coures-photo/${module.image}`;
          }
        }

        return (
          <div key={module.id || index} className="relative pl-0 lg:pl-0">
            {/* Horizontal Connector */}
            <div className="absolute -right-8 top-8 w-8 h-[2px] bg-primary/20"></div>
            <div className="absolute -right-[41px] top-[26px] w-4 h-4 rounded-full border-2 border-primary bg-white z-10"></div>

            <Link to={`/courses/${module.courseId}`} className="block bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all group">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Course Image */}
                <div className="w-full md:w-56 h-36 shrink-0 rounded-xl overflow-hidden relative bg-gray-100 border border-gray-100">
                  {imagePath ? (
                    <ImageWithFallback
                      src={imagePath}
                      alt={module.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <span className="material-symbols-outlined text-5xl">image</span>
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-white text-xs px-2 py-1 rounded-[1rem]">
                    {module.duration}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-primary font-bold text-xs uppercase tracking-wider">
                      المرحلة {index + 1}
                    </span>
                    {module.locked ? (
                      <span className="material-symbols-outlined text-gray-300">lock</span>
                    ) : (
                      <span className="material-symbols-outlined text-primary">lock_open</span>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-heading-dark mb-2 group-hover:text-primary transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2">
                    {module.description}
                  </p>

                  {/* Mini outcomes */}
                  {module.outcomes && (
                    <div className="flex flex-col gap-1.5">
                      {module.outcomes.slice(0, 2).map((out, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                          <span className="material-symbols-outlined text-green-500 text-sm">check</span>
                          <span>{out}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        );
      })}

      {/* Timeline End Decoration */}
      <div className="absolute -right-[7px] bottom-0 w-3 h-3 rounded-full bg-gray-300"></div>
    </div>
  );
};

export default RoadmapModules;
