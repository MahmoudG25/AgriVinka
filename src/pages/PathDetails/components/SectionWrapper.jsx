import React from 'react';

const SectionWrapper = ({ children, className = '', id = '' }) => {
  return (
    <section id={id} className={`py-12 md:py-16 ${className}`}>
      <div className="container-layout">
        {children}
      </div>
    </section>
  );
};

export default SectionWrapper;
