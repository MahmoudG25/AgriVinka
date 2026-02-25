import React from 'react';
import { Link } from 'react-router-dom';

const PathBreadcrumbs = ({ title }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-[1.5rem] mt-[4.5rem]">
      <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1 group">
        <span className="material-symbols-outlined text-lg mb-0.5 text-gray-400 group-hover:text-primary transition-colors">home</span>
        <span className="group-hover:text-primary transition-colors">الرئيسية</span>
      </Link>

      <span className="material-symbols-outlined text-sm rtl:rotate-180 text-gray-300 mx-1">chevron_right</span>

      <Link to="/learning-paths" className="hover:text-primary transition-colors">
        مسارات التعلم
      </Link>

      <span className="material-symbols-outlined text-sm rtl:rotate-180 text-gray-300 mx-1">chevron_right</span>

      <span className="text-heading-dark font-bold truncate ">
        {title}
      </span>
    </div>
  );
};

export default PathBreadcrumbs;
