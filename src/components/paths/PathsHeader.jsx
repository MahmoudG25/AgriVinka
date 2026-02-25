import React, { useState } from 'react';

const PathsHeader = ({ searchQuery, setSearchQuery, filters, setFilters, onClear }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleDropdown = (key) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActiveDropdown(null);
  };

  const dropdowns = [
    {
      key: 'category',
      label: 'المجال',
      options: ['الكل', 'تصميم وتطوير الويب', 'دخل بالدولار', 'الأكثر طلباً'],
      // Note: 'Web Design', 'Frontend' etc are mapped from data tags/categories
    },
    {
      key: 'level',
      label: 'المستوى',
      options: ['الكل', 'من المبتدئ إلى المحترف', 'خبير', 'متوسط - متقدم'],
    },
    {
      key: 'duration',
      label: 'المدة',
      type: 'sort',
      options: [
        { label: 'الأقصر أولاً', value: 'asc' },
        { label: 'الأطول أولاً', value: 'desc' },
      ],
    },
    {
      key: 'price',
      label: 'السعر',
      type: 'sort',
      options: [
        { label: 'الأقل سعراً', value: 'asc' },
        { label: 'الأعلى سعراً', value: 'desc' },
      ]
    }
  ];

  return (
    <div className="mb-12">
      <h1 className="text-4xl lg:text-5xl font-extrabold text-heading-dark mb-6">المسارات التعليمية</h1>
      <p className="text-xl text-gray-500 mb-8 ">اختر مسارك المهني وابدأ رحلة التعلم من الصفر حتى الاحتراف مع أفضل المصادر العالمية المترجمة.</p>

      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 material-symbols-outlined">search</span>
          <input
            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-700 placeholder-gray-400 font-medium"
            placeholder="ابحث عن مسار أو مهارة..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 w-full lg:w-auto relative z-20">
          {dropdowns.map((dropdown) => (
            <div key={dropdown.key} className="relative">
              <button
                onClick={() => toggleDropdown(dropdown.key)}
                className={`flex items-center gap-2 px-5 py-2.5 border rounded-full font-medium transition-all duration-300
                  ${filters[dropdown.key] || (dropdown.type === 'sort' && filters.sort === dropdown.key)
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <span>{dropdown.label}</span>
                <span className={`material-symbols-outlined text-sm transition-transform ${activeDropdown === dropdown.key ? 'rotate-180' : ''}`}>
                  keyboard_arrow_down
                </span>
              </button>

              {/* Dropdown Menu */}
              {activeDropdown === dropdown.key && (
                <div className="absolute top-full mt-2 left-0 min-w-[180px] bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  {dropdown.options.map((option, idx) => {
                    const isSort = dropdown.type === 'sort';
                    const value = isSort ? option.value : option;
                    const label = isSort ? option.label : option;
                    const isActive = isSort
                      ? filters.sort === dropdown.key && filters.order === value
                      : filters[dropdown.key] === value;

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isSort) {
                            setFilters(prev => ({ ...prev, sort: dropdown.key, order: value }));
                          } else {
                            updateFilter(dropdown.key, value === 'الكل' ? null : value);
                          }
                          setActiveDropdown(null);
                        }}
                        className={`w-full text-right px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors
                            ${isActive ? 'text-primary bg-primary/5' : 'text-gray-600'}
                        `}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={onClear}
            className="text-gray-400 hover:text-red-500 text-sm font-medium mr-2 self-center transition-colors"
          >
            مسح الكل
          </button>
        </div>
      </div>
    </div>
  );
};

export default PathsHeader;
