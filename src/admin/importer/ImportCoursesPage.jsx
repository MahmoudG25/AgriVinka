import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { MdCloudUpload, MdCheckCircle, MdError, MdWarning, MdArrowBack, MdSave, MdDelete, MdFileDownload } from 'react-icons/md';
import { addToast } from '../../store/slices/uiSlice';

import { parseJsonCourses } from './parsers/parseJsonCourses';
import { parseCsvCourses } from './parsers/parseCsvCourses';
import { normalizeCourse } from './normalizers/normalizeCourse';
import { validateCourse } from './validators/validateCourse';
import { saveCoursesBatch } from './firebase/saveCoursesBatch';

const ImportCoursesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [step, setStep] = useState('upload'); // upload, preview, importing, result
  const [data, setData] = useState([]); // { raw, normalized, validation, id (temp) }
  const [stats, setStats] = useState({ total: 0, valid: 0, invalid: 0, warnings: 0 });
  const [duplicatePolicy, setDuplicatePolicy] = useState('skip'); // 'skip', 'overwrite'
  const [importResult, setImportResult] = useState(null);

  // --- 1. File Upload ---
  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const text = await file.text();
    let result = { items: [], errors: [] };

    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      result = parseJsonCourses(text);
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      result = parseCsvCourses(text);
    } else {
      dispatch(addToast({ type: 'error', message: 'Unsupported file type. Use JSON or CSV.' }));
      return;
    }

    if (result.errors.length > 0) {
      dispatch(addToast({ type: 'error', message: result.errors.join(', ') }));
      return;
    }

    // Process items
    const processed = result.items.map((raw, idx) => {
      const normalized = normalizeCourse(raw);
      const validation = validateCourse(normalized);
      return {
        id: `row-${idx}`,
        raw,
        normalized,
        validation,
        selected: true // for future multi-select
      };
    });

    setData(processed);
    updateStats(processed);
    setStep('preview');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  // --- 2. Stats & Management ---
  const updateStats = (items) => {
    const summary = items.reduce((acc, item) => {
      acc.total++;
      if (item.validation.isValid) acc.valid++;
      else acc.invalid++;
      if (item.validation.warnings.length > 0) acc.warnings++;
      return acc;
    }, { total: 0, valid: 0, invalid: 0, warnings: 0 });
    setStats(summary);
  };

  const removeRow = (id) => {
    const newData = data.filter(item => item.id !== id);
    setData(newData);
    updateStats(newData);
  };

  // --- 3. Import Action ---
  const handleImport = async () => {
    const validItems = data.filter(item => item.validation.isValid).map(item => item.normalized);
    if (validItems.length === 0) return;

    setStep('importing');

    // Save to Firestore
    const result = await saveCoursesBatch(validItems, duplicatePolicy);

    setImportResult(result);
    setStep('result');

    if (result.errors.length === 0) {
      dispatch(addToast({ type: 'success', message: `Successfully imported ${result.saved} courses` }));
    } else {
      dispatch(addToast({ type: 'warning', message: `Imported with some errors` }));
    }
  };

  // --- 4. Utilities ---
  const downloadTemplate = (type) => {
    if (type === 'csv') {
      const headers = 'title,description,price,original_price,thumbnail,preview_video,instructor_name,instructor_title';
      const row = '"Example Course","Detailed description here...",50,100,"https://example.com/img.jpg","https://example.com/video.mp4","John Doe","Senior Instructor"';
      const blob = new Blob([`${headers}\n${row}`], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'courses_template.csv';
      a.click();
    } else {
      const template = [{
        title: "Example Course",
        description: "Detailed description here...",
        pricing: { price: 50, original_price: 100 },
        media: { thumbnail: "https://example.com/img.jpg" },
        instructor: { name: "John Doe" }
      }];
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'courses_template.json';
      a.click();
    }
  };

  // --- Renderers ---
  const renderUpload = () => (
    <div className=" mx-auto mt-10">
      <div
        {...getRootProps()}
        className={`border-3 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <MdCloudUpload size={64} className={isDragActive ? 'text-primary' : 'text-gray-300'} />
          <div>
            <p className="text-xl font-bold mb-2">Drop CSV or JSON here</p>
            <p className="text-sm">or click to browse files</p>
          </div>
          <div className="text-xs bg-gray-100 px-3 py-1 rounded-full">
            Supports: .json, .csv
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4 justify-center">
        <button onClick={() => downloadTemplate('csv')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
          <MdFileDownload /> Template CSV
        </button>
        <button onClick={() => downloadTemplate('json')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors">
          <MdFileDownload /> Template JSON
        </button>
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-border-light">
          <div className="text-sm text-gray-500 mb-1">Total Found</div>
          <div className="text-2xl font-bold text-heading-dark">{stats.total}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 bg-green-50/50">
          <div className="text-sm text-green-600 mb-1">Valid</div>
          <div className="text-2xl font-bold text-green-700">{stats.valid}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 bg-red-50/50">
          <div className="text-sm text-red-600 mb-1">Invalid (Will Skip)</div>
          <div className="text-2xl font-bold text-red-700">{stats.invalid}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-yellow-100 bg-yellow-50/50">
          <div className="text-sm text-yellow-600 mb-1">Warnings</div>
          <div className="text-2xl font-bold text-yellow-700">{stats.warnings}</div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-border-light">
        <div className="flex items-center gap-4">
          <label className="text-sm font-bold text-gray-700">Duplicate Policy:</label>
          <select
            value={duplicatePolicy}
            onChange={(e) => setDuplicatePolicy(e.target.value)}
            className="p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-primary"
          >
            <option value="skip">Skip duplicates (by ID)</option>
            <option value="overwrite">Overwrite existing IDs</option>
          </select>
        </div>

        <button
          onClick={handleImport}
          disabled={stats.valid === 0}
          className="flex items-center gap-2 bg-primary text-heading-dark font-bold px-6 py-2 rounded-xl hover:bg-accent shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none"
        >
          <MdSave size={20} />
          <span>Import {stats.valid} Courses</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-border-light overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-right text-sm">
            <thead className="bg-background-alt text-gray-500 font-medium sticky top-0 z-10">
              <tr>
                <th className="p-4">Status</th>
                <th className="p-4">Title</th>
                <th className="p-4">ID (Slug)</th>
                <th className="p-4">Price</th>
                <th className="p-4">Issues</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {data.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.validation.isValid ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 align-top w-12 text-center">
                    {item.validation.isValid ? (
                      item.validation.warnings.length > 0 ? (
                        <MdWarning className="text-yellow-500 mx-auto" size={20} title="Valid with warnings" />
                      ) : (
                        <MdCheckCircle className="text-green-500 mx-auto" size={20} title="Valid" />
                      )
                    ) : (
                      <MdError className="text-red-500 mx-auto" size={20} title="Invalid" />
                    )}
                  </td>
                  <td className="p-4 align-top font-bold text-heading-dark  truncate">
                    {item.normalized.title || <span className="text-gray-300 italic">No Title</span>}
                  </td>
                  <td className="p-4 align-top font-mono text-xs text-gray-500">
                    {item.normalized.id || '-'}
                  </td>
                  <td className="p-4 align-top">
                    {item.normalized.pricing?.price}
                  </td>
                  <td className="p-4 align-top ">
                    {item.validation.errors.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {item.validation.errors.map((e, i) => (
                          <div key={i} className="text-xs text-red-600 flex items-start gap-1">
                            <MdError size={12} className="mt-0.5 shrink-0" /> {e}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.validation.warnings.length > 0 && (
                      <div className="space-y-1">
                        {item.validation.warnings.map((w, i) => (
                          <div key={i} className="text-xs text-yellow-600 flex items-start gap-1">
                            <MdWarning size={12} className="mt-0.5 shrink-0" /> {w}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top text-center">
                    <button onClick={() => removeRow(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className=" mx-auto text-center space-y-8 mt-10">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-border-light">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <MdCheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-heading-dark mb-2">Import Complete</h2>
        <p className="text-gray-500 mb-8">
          See the summary below for details.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-green-50 rounded-2xl">
            <div className="text-2xl font-bold text-green-700">{importResult?.saved}</div>
            <div className="text-xs font-bold text-green-600 uppercase">Saved</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-2xl">
            <div className="text-2xl font-bold text-gray-700">{importResult?.skipped}</div>
            <div className="text-xs font-bold text-gray-500 uppercase">Skipped</div>
          </div>
          <div className="p-4 bg-red-50 rounded-2xl">
            <div className="text-2xl font-bold text-red-700">{importResult?.errors?.length || 0}</div>
            <div className="text-xs font-bold text-red-600 uppercase">Errors</div>
          </div>
        </div>

        {importResult?.errors?.length > 0 && (
          <div className="text-left text-xs text-red-600 bg-red-50 p-4 rounded-xl mb-8 max-h-40 overflow-y-auto">
            {importResult.errors.map((e, i) => (
              <div key={i} className="mb-1">• {e}</div>
            ))}
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate('/admin/courses')} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors">
            View Courses
          </button>
          <button onClick={() => { setStep('upload'); setData([]); setImportResult(null); }} className="px-6 py-2 text-primary hover:text-accent font-bold transition-colors">
            Import More
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MdArrowBack size={24} />
        </button>
        <h1 className="text-2xl font-bold text-heading-dark">Validating & Importing Courses</h1>
      </div>

      {step === 'upload' && renderUpload()}
      {step === 'preview' && renderPreview()}
      {step === 'importing' && (
        <div className="text-center py-20">
          <div className="text-4xl animate-bounce mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-700">Importing courses...</h2>
          <p className="text-gray-500">Please wait while we save to Firestore.</p>
        </div>
      )}
      {step === 'result' && renderResult()}
    </div>
  );
};

export default ImportCoursesPage;
