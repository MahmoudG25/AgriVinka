import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MdSearch, MdEdit, MdDelete, MdAdd, MdMoreVert, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

/* ═══════════════════════════════════════════════
   Row Actions Menu (kebab ⋮)
   ═══════════════════════════════════════════════ */
const RowActionsMenu = ({ item, onEdit, onDelete, customActions }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-heading-dark rounded-lg transition-colors"
      >
        <MdMoreVert size={20} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-border-light rounded-lg shadow-lg z-20 overflow-hidden animate-scale-in origin-top-left">
          {/* Edit */}
          {onEdit && (
            typeof onEdit === 'string' ? (
              <Link
                to={`${onEdit}/${item.id}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors w-full"
              >
                <MdEdit size={16} />
                <span>تعديل</span>
              </Link>
            ) : (
              <button
                onClick={() => { onEdit(item); setOpen(false); }}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors w-full text-right"
              >
                <MdEdit size={16} />
                <span>تعديل</span>
              </button>
            )
          )}

          {/* Custom Actions */}
          {customActions && customActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => { action.onClick(item); setOpen(false); }}
              className={clsx(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors w-full text-right",
                action.danger ? "text-red-500 hover:text-red-600" : "text-gray-600 hover:text-primary"
              )}
            >
              {action.icon && <action.icon size={16} />}
              <span>{action.label}</span>
            </button>
          ))}

          {/* Delete */}
          {onDelete && (
            <button
              onClick={() => { onDelete(item); setOpen(false); }}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-right border-t border-border-light"
            >
              <MdDelete size={16} />
              <span>حذف</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════
   Loading Skeleton Rows
   ═══════════════════════════════════════════════ */
const SkeletonRow = ({ cols }) => (
  <tr className="border-b border-border-light">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="p-4">
        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
      </td>
    ))}
    <td className="p-4"><div className="h-4 w-6 bg-gray-100 rounded animate-pulse" /></td>
  </tr>
);

/* ═══════════════════════════════════════════════
   DataTable
   ═══════════════════════════════════════════════ */
const DataTable = ({
  columns,
  data,
  onDelete,
  onEdit,
  title,
  createLink,
  extraActions,
  customActions,
  loading = false,
  pageSize = 10,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, data]);

  // Filter
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIdx, startIdx + pageSize);

  // Page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="bg-white rounded-xl border border-border-light overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-heading-dark">{title}</h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Search */}
          <div className="relative">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-9 py-2 rounded-lg border border-border-light focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm w-full sm:w-56 transition-colors"
            />
          </div>

          {extraActions}

          {createLink && (
            <Link
              to={createLink}
              className="flex items-center gap-1.5 bg-primary text-white font-medium text-sm px-3.5 py-2 rounded-lg hover:bg-primary-hover transition-colors"
            >
              <MdAdd size={18} />
              <span>جديد</span>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-background-alt sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={columns.length} />
              ))
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className="p-4 text-sm">
                      {col.render ? col.render(item) : item[col.accessor]}
                    </td>
                  ))}
                  <td className="p-4">
                    <RowActionsMenu
                      item={item}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      customActions={customActions}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="py-16 text-center">
                  <div className="text-gray-300 mb-2">
                    <MdSearch size={40} className="mx-auto" />
                  </div>
                  <p className="text-sm text-gray-400">لا توجد بيانات</p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      مسح البحث
                    </button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && filteredData.length > pageSize && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border-light text-sm">
          <p className="text-gray-400 text-xs">
            عرض {startIdx + 1}–{Math.min(startIdx + pageSize, filteredData.length)} من {filteredData.length}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MdChevronRight size={20} />
            </button>

            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                  page === safePage
                    ? "bg-primary text-white"
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <MdChevronLeft size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
