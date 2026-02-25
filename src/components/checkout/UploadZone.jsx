import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FaCloudUploadAlt, FaFileImage, FaTrash } from 'react-icons/fa';

const UploadZone = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    multiple: false
  });

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div className="mt-8">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        إرفاق إيصال التحويل <span className="text-red-500">*</span>
      </label>

      {!file ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-300
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
          `}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-3xl text-gray-400">
            <FaCloudUploadAlt />
          </div>
          <p className="font-bold text-gray-700 text-lg">
            {isDragActive ? 'أفلت الملف هنا' : 'رفع ملف أو اسحب وأفلت هنا'}
          </p>
          <p className="text-gray-400 text-sm mt-2">
            PNG, JPG, PDF بحد أقصى 5MB
          </p>
        </div>
      ) : (
        <div className="border border-border-light rounded-2xl p-4 flex items-center justify-between bg-surface-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xl">
              <FaFileImage />
            </div>
            <div className="text-right">
              <p className="font-bold text-body-text truncate ">{file.name}</p>
              <p className="text-sm text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="text-red-500 hover:text-red-700 p-2 transition-colors"
            title="حذف الملف"
          >
            <FaTrash />
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadZone;
