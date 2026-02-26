// frontend/src/components/customer/HeroSlider.jsx
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../../utils/api';

const FALLBACK_SLIDES = [
  {
    _id: '1',
    title: 'New Collection',
    subtitle: 'Crafted for the bold. Made for the refined.',
    ctaText: 'Explore Now',
    ctaLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    overlayOpacity: 0.45,
    textColor: '#ffffff',
  },
  {
    _id: '2',
    title: 'Premium Essentials',
    subtitle: 'Timeless pieces for every occasion.',
    ctaText: 'Shop Now',
    ctaLink: '/shop',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=80',
    overlayOpacity: 0.5,
    textColor: '#ffffff',
  },
  {
    _id: '3',
    title: 'Pre-Order Now',
    subtitle: 'Reserve exclusive items before they sell out.',
    ctaText: 'Pre-Order',
    ctaLink: '/shop?preorder=true',
    imageUrl: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1400&q=80',
    overlayOpacity: 0.4,
    textColor: '#ffffff',
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    api.get('/hero').then(res => {
      if (res.data.data.slides?.length > 0) {
        setSlides(res.data.data.slides);
      }
    }).catch(() => {}); // fallback to default
  }, []);

  const goTo = useCallback((index) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 200);
  }, [transitioning]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  // 5-second auto-advance
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, slides[current]?.interval || 5000);
    return () => clearInterval(timer);
  }, [current, slides, next]);

  const slide = slides[current];

  return (
    <section className="relative h-[75vh] min-h-[520px] overflow-hidden bg-gray-900">
      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${transitioning ? 'opacity-0' : 'opacity-100'}`}
        style={{ backgroundImage: `url(${slide.imageUrl})` }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: slide.overlayColor || '#000', opacity: slide.overlayOpacity }}
      />

      {/* Content */}
      <div className={`relative h-full flex items-center justify-center text-center px-6 transition-all duration-500 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
        <div className="max-w-3xl" style={{ color: slide.textColor }}>
          <p className="font-mono text-xs uppercase tracking-[0.3em] opacity-70 mb-4">
            KIN Store — Season {new Date().getFullYear()}
          </p>
          <h1 className="font-display text-5xl sm:text-7xl font-bold mb-4 leading-tight">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-lg sm:text-xl opacity-80 mb-8 font-body max-w-xl mx-auto">
              {slide.subtitle}
            </p>
          )}
          <Link
            to={slide.ctaLink}
            className="inline-block px-8 py-3.5 bg-kin-600 hover:bg-kin-700 text-white font-semibold rounded-full text-sm transition-all hover:scale-105 shadow-2xl"
          >
            {slide.ctaText}
          </Link>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all">
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-kin-400' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
        <div
          key={current}
          className="h-full bg-kin-400"
          style={{ animation: `progressBar ${slides[current]?.interval || 5000}ms linear` }}
        />
      </div>

      <style>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
