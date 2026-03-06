import React, { useState, useEffect } from 'react';
import { useTopOfferBar } from '../../hooks/useTopOfferBar';
import { FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const TopOfferBar = () => {
  const { offerData, loading } = useTopOfferBar();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (loading || !offerData || !offerData.enabled) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed in localStorage
    const dismissedOfferId = localStorage.getItem('dismissedOfferId');
    if (dismissedOfferId === offerData.offerId) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
  }, [offerData, loading]);

  useEffect(() => {
    if (!isVisible || !offerData?.endAt) return;

    const calculateTimeLeft = () => {
      // Handle Firestore Timestamp object or Date object or milliseconds
      let endAtDate;
      if (offerData.endAt?.seconds) {
        endAtDate = new Date(offerData.endAt.seconds * 1000);
      } else if (offerData.endAt instanceof Date) {
        endAtDate = offerData.endAt;
      } else {
        endAtDate = new Date(offerData.endAt);
      }

      const difference = endAtDate - new Date();

      if (difference <= 0) {
        setIsExpired(true);
        setIsVisible(false);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setIsExpired(false);
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Calculate immediately
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, offerData?.endAt]);

  const handleClose = () => {
    setIsVisible(false);
    if (offerData?.offerId) {
      localStorage.setItem('dismissedOfferId', offerData.offerId);
    }
  };

  if (!isVisible || isExpired) return null;

  // Determine theme classes
  const themeClasses = {
    primary: 'bg-primary text-white border-b border-primary-dark',
    dark: 'bg-heading-dark text-white border-b border-gray-800',
    light: 'bg-primary/5 text-primary border-b border-primary/20',
  };

  const currentThemeClasses = themeClasses[offerData.theme] || themeClasses.primary;

  return (
    <div id="top-offer-bar" className={`w-full relative z-[60] py-2.5 px-4 ${currentThemeClasses}`}>
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-center relative md:px-8 gap-2 md:gap-4 lg:gap-8">

        {/* Close Button (Absolute on Mobile, Static on Desktop) */}
        {offerData.showClose && (
          <button
            onClick={handleClose}
            className="absolute left-0 lg:-left-4 md:static top-1/2 -translate-y-1/2 md:translate-y-0 p-1.5 opacity-70 hover:opacity-100 transition-opacity hover:bg-black/10 rounded-full"
            aria-label="Close offer bar"
          >
            <FaTimes size={14} />
          </button>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-6 text-center w-full">
          {/* Main Message */}
          <p className="font-bold text-sm md:text-base leading-tight md:leading-normal">
            {offerData.message}
          </p>

          {/* Countdown Timer */}
          {offerData.endAt && (
            <div className="flex items-center gap-2 rtl:flex-row-reverse bg-black/10 dark:bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold shrink-0">
              <span className="opacity-80">متبقي:</span>
              <div className="flex gap-1" dir="ltr">
                {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
                <span>
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {/* CTA Button */}
          {offerData.ctaEnabled && offerData.ctaText && offerData.ctaLink && (
            <div className="shrink-0 mt-1 sm:mt-0">
              {offerData.ctaLink.startsWith('http') ? (
                <a
                  href={offerData.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-1.5 bg-white text-heading-dark text-xs font-bold rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                >
                  {offerData.ctaText}
                </a>
              ) : (
                <Link
                  to={offerData.ctaLink}
                  className="inline-block px-4 py-1.5 bg-white text-heading-dark text-xs font-bold rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                >
                  {offerData.ctaText}
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopOfferBar;
