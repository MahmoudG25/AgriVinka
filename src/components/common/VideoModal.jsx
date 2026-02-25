import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

const VideoModal = ({ isOpen, onClose, videoUrl }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Helper to get embed URL
  const getEmbedUrl = (url) => {
    if (!url) return '';
    const cleanUrl = url.trim();

    // Check for YouTube (standard, short, mobile, embed)
    // This regex handles:
    // - youtu.be/VIDEO_ID
    // - youtube.com/watch?v=VIDEO_ID (and ?v= anywhere in query string)
    // - youtube.com/embed/VIDEO_ID
    // - youtube.com/shorts/VIDEO_ID
    // - m.youtube.com/watch?v=VIDEO_ID
    const ytMatch = cleanUrl.match(/(?:https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?(?:[^&]+&)*v=|embed\/|shorts\/|v\/))([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
    }

    // Check for Vimeo
    const vimeoMatch = cleanUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
    }

    return cleanUrl;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-[90vw] md:w-[80vw]  aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {(() => {
            const isNative = embedUrl.match(/\.(mp4|webm|ogg)$|cloudinary\.com|firebasestorage\.googleapis\.com/) && !embedUrl.includes('youtube') && !embedUrl.includes('vimeo');
            const isYoutube = embedUrl.includes('youtube.com/embed');
            const isVimeo = embedUrl.includes('player.vimeo.com');

            if (isNative) {
              return (
                <video
                  src={embedUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                >
                  Your browser does not support the video tag.
                </video>
              );
            }

            if (isYoutube || isVimeo) {
              return (
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  title="Video Player"
                ></iframe>
              );
            }

            return (
              <div className="flex flex-col items-center justify-center w-full h-full text-white p-6 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">error_outline</span>
                <h3 className="text-xl font-bold mb-2">رابط الفيديو غير مدعوم</h3>
                <p className="text-gray-400">يرجى استخدام رابط YouTube أو Vimeo أو رفع فيديو مباشرة.</p>
              </div>
            );
          })()}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default VideoModal;
