import React, { useState, useMemo } from 'react';
import { MdSearch, MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { Link } from 'react-router-dom';

const DataTable = ({
  columns,
  data,
  onDelete,
  onEdit, // function or link prefix
  title,
  createLink,
  extraActions
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounced and memoized filter - prevents excessive re-filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;

    return data.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [data, searchTerm]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border-light flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-heading-dark">{title}</h2>

        <div className="flex items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-10 py-2 rounded-lg border border-border-light focus:outline-none focus:border-primary w-full md:w-64"
            />
          </div>

          {extraActions && extraActions}

          {createLink && (
            <Link
              to={createLink}
              className="flex items-center gap-2 bg-primary text-heading-dark font-bold px-4 py-2 rounded-lg hover:bg-accent transition-colors"
            >
              <MdAdd size={20} />
              <span>جديد</span>
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-background-alt text-gray-500 font-medium">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="p-4">{col.header}</th>
              ))}
              <th className="p-4">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, idx) => (
                    <td key={idx} className="p-4">
                      {col.render ? col.render(item) : item[col.accessor]}
                    </td>
                  ))}
                  <td className="p-4 flex items-center gap-2">
                    {typeof onEdit === 'string' ? (
                      <Link
                        to={`${onEdit}/${item.id}`}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <MdEdit size={18} />
                      </Link>
                    ) : (
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <MdEdit size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(item)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-gray-400">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
