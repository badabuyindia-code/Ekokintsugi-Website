import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";
import { useLanguage } from "../lib/LanguageContext";

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { t } = useLanguage();

  const slides = [
    {
      id: 1,
      tag: t("hero.slide1.tag"),
      title: t("hero.slide1.title"),
      description: t("hero.slide1.desc"),
      image: "/images/hero/hero-1.jpg",
      actionText: t("hero.slide1.btn"),
      tagline: t("hero.slide1.tagline")
    },
    {
      id: 2,
      tag: t("hero.slide2.tag"),
      title: t("hero.slide2.title"),
      description: t("hero.slide2.desc"),
      image: "/images/products/wallet-zip.jpg",
      actionText: t("hero.slide2.btn"),
      tagline: t("hero.slide2.tagline")
    },
    {
      id: 3,
      tag: t("hero.slide3.tag"),
      title: t("hero.slide3.title"),
      description: t("hero.slide3.desc"),
      image: "https://adykwrunnuwgwmbzfsxj.supabase.co/storage/v1/object/public/product-images/products/indigo-floral-ballet-flats.jpeg",
      actionText: t("hero.slide3.btn"),
      tagline: t("hero.slide3.tagline")
    },
    {
      id: 4,
      tag: t("hero.slide4.tag"),
      title: t("hero.slide4.title"),
      description: t("hero.slide4.desc"),
      image: "/images/products/signature-sneaker.jpg",
      actionText: t("hero.slide4.btn"),
      tagline: t("hero.slide4.tagline")
    }
  ];

  useEffect(() => {
    if (isAutoplayPaused) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [isAutoplayPaused, slides.length]);

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleMouseEnter = () => setIsAutoplayPaused(true);
  const handleMouseLeave = () => setIsAutoplayPaused(false);

  return (
    <section className="w-full max-w-6xl mx-auto px-6 py-8 md:py-10">
      <div 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        className={`relative h-[480px] md:h-[560px] rounded-[2.5rem] overflow-hidden border group shadow-strong transition-all duration-500 ${
          isDark ? "border-white/10 bg-zinc-950" : "border-slate-200 bg-white"
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <motion.div 
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: 4, ease: "easeOut" }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[index].image})` }}
            />
            {/* Rich dark gradient overlays in both light and dark modes for perfect contrast and clean look */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent transition-all duration-500" />
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/60 to-transparent transition-all duration-500" />
            
            <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 md:px-24 max-w-3xl">
              {/* Category tag */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex items-center gap-3 mb-4 md:mb-6"
              >
                <div className="w-10 h-0.5 bg-accent" />
                <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-accent font-black">
                  {slides[index].tag}
                </span>
              </motion.div>
              
              {/* Title split with premium typography styling */}
              <motion.h1 
                initial={{ y: 25, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-4 md:mb-6 leading-[1.1] md:leading-[0.95] tracking-tight transition-colors duration-500"
              >
                {slides[index].title.split(' ')[0]}<br />
                <span className="text-accent italic font-normal">{slides[index].title.split(' ').slice(1).join(' ')}</span>
              </motion.h1>
              
              {/* Description */}
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-sm sm:text-base md:text-lg font-sans mb-6 md:mb-10 max-w-lg leading-relaxed font-medium text-zinc-200 transition-colors duration-500 line-clamp-3 sm:line-clamp-none"
              >
                {slides[index].description}
              </motion.p>
              
              {/* Action and verification */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6"
              >
                <button 
                  onClick={() => navigate('/products')}
                  className="bg-accent text-accent-foreground px-8 py-3.5 sm:px-10 sm:py-4 rounded-full text-[10px] font-mono tracking-widest uppercase font-black hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 shadow-xl cursor-pointer w-fit"
                >
                  {slides[index].actionText}
                </button>
                <div className="hidden sm:block w-12 h-px bg-white/20 transition-colors duration-500" />
                <span className="text-[9px] font-mono tracking-widest uppercase font-bold flex items-center gap-2 text-zinc-400 transition-colors duration-500">
                  <Sparkles className="w-3.5 h-3.5 text-accent animate-pulse" /> {slides[index].tagline}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Premium Sliding Navigation Arrows */}
        <div className="absolute inset-y-0 left-2 right-2 sm:left-4 sm:right-4 flex items-center justify-between pointer-events-none z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="pointer-events-auto p-2.5 sm:p-3.5 rounded-full backdrop-blur-md border bg-black/25 border-white/10 text-white hover:bg-accent hover:text-accent-foreground hover:border-accent/40 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 cursor-pointer shadow-lg"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="pointer-events-auto p-2.5 sm:p-3.5 rounded-full backdrop-blur-md border bg-black/25 border-white/10 text-white hover:bg-accent hover:text-accent-foreground hover:border-accent/40 hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 cursor-pointer shadow-lg"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Dynamic Horizontal Progress Bar Indicators */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-6 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setIndex(i);
              }}
              className="group relative flex flex-col items-center cursor-pointer"
            >
              <div className="w-8 sm:w-16 h-1 rounded-full overflow-hidden mb-1.5 sm:mb-2 relative transition-colors duration-500 bg-white/20">
                {i === index && (
                  <motion.div
                    key={`${index}-${isAutoplayPaused}`}
                    initial={{ width: 0 }}
                    animate={{ width: isAutoplayPaused ? "0%" : "100%" }}
                    transition={{
                      duration: isAutoplayPaused ? 0 : 4,
                      ease: "linear"
                    }}
                    className="absolute inset-y-0 left-0 bg-accent"
                  />
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] font-mono tracking-wider font-bold transition-all duration-300 ${
                i === index ? "text-accent" : "text-white/40 group-hover:text-white"
              }`}>
                0{i + 1}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
