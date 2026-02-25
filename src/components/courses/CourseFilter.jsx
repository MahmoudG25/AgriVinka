import React from 'react';

const CourseFilter = ({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortOption,
  onSortChange
}) => {
  return (
    <div className="relative top-20 z-40 bg-surface-white/90 backdrop-blur-xl border-y border-border-light shadow-sm mb-10 py-4 transition-all duration-300">
      <div className="container-layout">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">

          {/* Search */}
          <div className="w-full md:w-1/3 relative">
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="ابحث عن كورس..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 pr-12 pl-6 text-sm font-medium focus:outline-none focus:border-primary focus:bg-white transition-all text-[#000]"
            />
          </div>

          {/* Categories (Desktop) */}
          <div className="hidden md:flex items-center gap-2 overflow-x-auto hide-scroll flex-1 justify-center px-4">
            <button
              onClick={() => onCategoryChange('All')}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === 'All' ? 'bg-heading-dark text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-heading-dark'}`}
            >
              الكل
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-bold transition-all ${activeCategory === cat ? 'bg-heading-dark text-white shadow-md' : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-heading-dark'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Categories Dropdown (Visible only on small screens) */}
          <div className="md:hidden w-full">
            <select
              value={activeCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-3 px-6 text-sm font-bold text-gray-700 outline-none"
            >
              <option value="All">جميع التخصصات</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="w-full md:w-auto flex items-center justify-end gap-2 shrink-0">
            <label className="text-xs font-bold text-gray-400 whitespace-nowrap hidden lg:block">ترتيب حسب:</label>
            <div className="relative">
              <select
                value={sortOption}
                onChange={(e) => onSortChange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl py-2.5 pr-4 pl-10 text-xs font-bold text-heading-dark focus:outline-none focus:border-primary cursor-pointer hover:bg-gray-50"
              >
                <option value="newest">الأحدث</option>
                <option value="price-asc">الأقل سعراً</option>
                <option value="price-desc">الأعلى سعراً</option>
                <option value="popular">الأكثر شعبية</option>
              </select>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined text-lg pointer-events-none">sort</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CourseFilter;
