import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MdCloudUpload, MdClose, MdCheckCircle } from 'react-icons/md';
import { cloudinaryService } from '../../../services/cloudinary';
import { normalizeMediaLink } from '../../../services/mediaLinkService';
import clsx from 'clsx';

const MediaUploader = ({
  onUploadComplete,
  label = "Upload Image",
  accept = { 'image/*': [] },
  maxSize = 5242880, // 5MB
  currentUrl,
  folder
}) => {
  const [uploadState, setUploadState] = useState({
    status: 'idle', // idle, uploading, success, error
    progress: 0,
    error: null,
    url: null,
    provider: null,
    type: null
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploadState({ status: 'uploading', progress: 0, error: null, url: null });

    try {
      const url = await cloudinaryService.uploadFile(file, folder || 'uploads', (percent) => {
        setUploadState(prev => ({ ...prev, progress: percent }));
      });

      setUploadState({
        status: 'success',
        progress: 100,
        error: null,
        url,
        provider: 'cloudinary',
        type: file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'raw'
      });

      if (onUploadComplete) {
        const fileType = file.type.startsWith('video/') ? 'video' : file.type.startsWith('image/') ? 'image' : 'raw';
        onUploadComplete({
          url,
          provider: 'cloudinary',
          type: fileType
        });
      }
    } catch (err) {
      setUploadState({
        status: 'error',
        progress: 0,
        error: err.message,
        url: null
      });
    }
  }, [onUploadComplete, folder]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    setUploadState({ status: 'idle', progress: 0, error: null, url: null });
    if (onUploadComplete) onUploadComplete(null);
  };

  const [externalUrl, setExternalUrl] = useState('');

  const handleExternalSubmit = (e) => {
    e.preventDefault();
    if (!externalUrl) return;

    const normalized = normalizeMediaLink(externalUrl);
    if (normalized && !normalized.error) {
      setUploadState({
        status: 'success',
        progress: 100,
        url: normalized.url,
        provider: normalized.provider,
        type: normalized.type,
        error: null
      });
      if (onUploadComplete) onUploadComplete(normalized);
    } else {
      // fallback on raw value for compatibility and show as plain URL
      setUploadState({
        status: 'success',
        progress: 100,
        url: externalUrl,
        provider: 'external',
        type: 'link',
        error: null
      });
      if (onUploadComplete) onUploadComplete({ url: externalUrl, type: 'link', provider: 'external' });
    }

    setExternalUrl('');
  };

  const previewUrl = uploadState.url || currentUrl;
  const previewType = uploadState.type || null;
  const previewProvider = uploadState.provider || null;

  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}

      {/* External Link Input */}
      {!previewUrl && uploadState.status !== 'uploading' && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={externalUrl}
            onChange={e => setExternalUrl(e.target.value)}
            placeholder="أو أدخل رابط مباشر (صورة، فيديو، PDF)"
            className="flex-grow p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary dir-ltr text-left"
          />
          <button
            type="button"
            onClick={handleExternalSubmit}
            disabled={!externalUrl}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shrink-0"
          >
            ربط
          </button>
        </div>
      )}

      <div
        {...getRootProps()}
        className={clsx(
          "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer relative overflow-hidden",
          isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary",
          uploadState.status === 'error' && "border-red-500 bg-red-50"
        )}
      >
        <input {...getInputProps()} />

        {uploadState.status === 'uploading' ? (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-3"></div>
            <p className="text-sm font-medium text-gray-600">جاري الرفع ({uploadState.progress}%)</p>
          </div>
        ) : previewUrl ? (
          <div className="relative group">
            {(previewProvider === 'youtube' || previewUrl.includes('youtube.com') || previewUrl.includes('youtu.be')) ? (
              <div className="text-gray-600 flex flex-col items-center justify-center p-4">
                <span className="font-bold text-red-600 mb-2">▶ YouTube Video Linked</span>
                <span className="text-xs break-all text-gray-400 dir-ltr max-w-full px-4">{previewUrl}</span>
              </div>
            ) : (previewProvider === 'drive' || /drive\.google\.com\/file\/d\/.+\/preview/.test(previewUrl)) ? (
              <iframe
                src={previewUrl}
                className="w-full h-48 mx-auto rounded-lg shadow-sm"
                title="Google Drive Video Preview"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (previewType === 'video' || (accept && Object.keys(accept).some(k => k.startsWith('video')) && previewUrl.match(/\.(mp4|webm|mkv|mov)$/i))) ? (
              <video src={previewUrl} className="max-h-48 mx-auto rounded-lg shadow-sm" controls />
            ) : previewType === 'pdf' || previewUrl.match(/\.(pdf)$/i) ? (
              <div className="p-8 text-red-500 font-bold flex flex-col items-center justify-center">
                <span className="material-symbols-outlined text-4xl mb-2">picture_as_pdf</span>
                ملف PDF مرفق
              </div>
            ) : (
              <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded-lg shadow-sm object-contain" />
            )}

            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MdClose size={16} />
            </button>
            <div className="absolute bottom-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <MdCheckCircle size={16} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-gray-400">
            <MdCloudUpload size={48} className="mb-2" />
            <p className="text-sm">اسحب الملف هنا أو انقر للرفع المباشر</p>
            <p className="text-xs mt-1 text-gray-400">الحد الأقصى: {maxSize >= 1073741824 ? `${(maxSize / 1073741824).toFixed(0)}GB` : `${(maxSize / 1048576).toFixed(0)}MB`}</p>
          </div>
        )}

        {uploadState.status === 'error' && (
          <p className="text-red-500 text-sm mt-2">{uploadState.error}</p>
        )}
      </div>
    </div>
  );
};

export default MediaUploader;
