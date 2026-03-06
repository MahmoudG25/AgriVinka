import React from 'react';

const SectionWrapper = ({ children, className = '', id = '' }) => {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;
