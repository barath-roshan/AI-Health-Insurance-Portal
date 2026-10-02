import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink, ShieldCheck, ArrowRight, Pause, Play } from 'lucide-react';
import { getSchemeImage } from '../lib/schemeImages';
import Badge from './ui/Badge';
import Button from './ui/Button';

const SchemeCarousel = ({ schemes = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [userInteracted, setUserInteracted] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const containerRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const totalSlides = schemes.length;

  const handleNext = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const handlePrev = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Handle Autoplay timer
  useEffect(() => {
    if (!isAutoPlaying || userInteracted || reducedMotion || totalSlides <= 1) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, userInteracted, reducedMotion, totalSlides, handleNext]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      setUserInteracted(true);
      if (distance > 0) {
        handleNext(); // Swiped left -> Next slide
      } else {
        handlePrev(); // Swiped right -> Previous slide
      }
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      setUserInteracted(true);
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      setUserInteracted(true);
      handleNext();
    }
  };

  if (!schemes || schemes.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      {/* Header & Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#102A43] tracking-tight flex items-center gap-2">
            <span>Featured Government Schemes</span>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2.5 py-0.5 rounded-full font-mono font-semibold">
              LIVE CATALOGUE
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore active healthcare entitlements across Central and State jurisdictions.
          </p>
        </div>

        {/* Carousel Navigation Buttons & Autoplay Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setIsAutoPlaying(!isAutoPlaying);
              setUserInteracted(true);
            }}
            className="p-2 text-slate-500 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            aria-label={isAutoPlaying ? 'Pause carousel auto-play' : 'Start carousel auto-play'}
            title={isAutoPlaying ? 'Pause Auto-play' : 'Play Auto-play'}
          >
            {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setUserInteracted(true);
              handlePrev();
            }}
            className="p-2 text-slate-700 hover:text-[#0F766E] bg-white hover:bg-teal-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            aria-label="Previous scheme slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              setUserInteracted(true);
              handleNext();
            }}
            className="p-2 text-slate-700 hover:text-[#0F766E] bg-white hover:bg-teal-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
            aria-label="Next scheme slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Sliding Container */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => !userInteracted && setIsAutoPlaying(true)}
        onFocus={() => setIsAutoPlaying(false)}
        onBlur={() => !userInteracted && setIsAutoPlaying(true)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex="0"
        className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-md focus:outline-none focus:ring-2 focus:ring-[#0F766E]"
        aria-roledescription="carousel"
        aria-label="Government Health Schemes Showcase"
      >
        <div
          className={`flex transition-transform ${
            reducedMotion ? 'duration-0' : 'duration-500 ease-out'
          }`}
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {schemes.map((scheme, idx) => {
            const imgInfo = getSchemeImage(scheme.scheme_code || scheme.scheme_id);
            const officialUrl = scheme.official_url || scheme.source_url;
            const isVerified = scheme.verification_status === 'VERIFIED_OFFICIAL' || scheme.verification_status === 'verified';

            return (
              <div
                key={scheme.id || scheme.scheme_id || idx}
                className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch"
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${idx + 1} of ${totalSlides}: ${scheme.scheme_name}`}
              >
                {/* Image Section */}
                <div className="lg:col-span-5 relative min-h-[220px] sm:min-h-[300px] bg-slate-900 overflow-hidden">
                  <img
                    src={imgInfo.url}
                    alt={imgInfo.alt}
                    width="600"
                    height="400"
                    loading={idx === 0 ? "eager" : "lazy"}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#102A43]/80 via-transparent to-transparent lg:hidden" />
                  
                  {/* Badge overlays */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <span className="bg-[#102A43]/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-xs">
                      {scheme.state_or_region || scheme.jurisdiction || 'India'}
                    </span>
                    <span className="bg-[#0F766E]/90 backdrop-blur-md text-teal-100 text-[11px] font-semibold px-3 py-1 rounded-full border border-teal-300/30">
                      {imgInfo.category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                        SCHEME ID: {scheme.scheme_code || scheme.scheme_id}
                      </span>
                      {isVerified && (
                        <Badge variant="verified" size="sm" showDot>
                          Official Government Verified
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#102A43] leading-snug">
                      {scheme.scheme_name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                      {scheme.description || scheme.short_description || scheme.brief_details}
                    </p>

                    {scheme.eligibility_summary && (
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-700 flex items-start space-x-2">
                        <ShieldCheck className="w-4 h-4 text-[#0F766E] flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#102A43] block font-semibold mb-0.5">Eligibility Summary:</strong>
                          <span className="line-clamp-2">{scheme.eligibility_summary}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
                    <Link to={`/schemes/${scheme.scheme_code || scheme.scheme_id || scheme.id}`}>
                      <Button variant="primary" icon={ArrowRight}>
                        View Full Details
                      </Button>
                    </Link>

                    {officialUrl && officialUrl.startsWith('http') && (
                      <a
                        href={officialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#0B3C49] bg-teal-50 hover:bg-teal-100/70 border border-teal-200 px-3.5 py-2 rounded-xl transition-colors"
                      >
                        <span>Official Portal</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-3 right-4 z-10 flex items-center space-x-1.5 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full">
          {schemes.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => {
                setUserInteracted(true);
                setCurrentIndex(dotIdx);
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === dotIdx ? 'w-6 bg-teal-400' : 'w-2 bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to scheme slide ${dotIdx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SchemeCarousel;
