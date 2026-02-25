import React from 'react';

const PathsPagination = () => {
  return (
    <div className="mt-16 flex justify-center gap-2">
      <button className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors disabled:opacity-50">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
      <button className="w-10 h-10 rounded-full bg-heading-dark text-white flex items-center justify-center font-bold shadow-md">
        ١
      </button>
      <button className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center text-heading-dark hover:bg-gold-light hover:border-primary/20 transition-colors font-medium">
        ٢
      </button>
      <button className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center text-heading-dark hover:bg-gold-light hover:border-primary/20 transition-colors font-medium">
        ٣
      </button>
      <button className="w-10 h-10 rounded-full border border-border-light flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-colors">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
    </div>
  );
};

export default PathsPagination;
