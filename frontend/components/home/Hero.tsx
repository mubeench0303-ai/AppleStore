"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import SplitReveal from "@/components/motion/SplitReveal";
import MagneticLink from "@/components/motion/MagneticLink";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import type { Product } from "@/types";

const SLIDE_INTERVAL_MS = 4500;

const FALLBACK_SLIDES: Product[] = [
  {
    id: 0,
    name: "iPhone 16 Pro",
    slug: "iphone-16-pro",
    description: "The most advanced iPhone yet. A18 Pro chip, pro camera system, and a beautiful titanium design.",
    price: 999,
    stock_quantity: 1,
    category_id: 0,
    category_name: "iPhone",
    image_url: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=1000",
    model_variant: "",
    is_active: true,
    created_at: "",
    updated_at: "",
  },
];

function headlineLines(name: string): string[] {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) return [name];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

const slideVariants = {
  enter: { opacity: 0, x: 72 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -72 },
};

function HeroProductImage({ slide, priority }: { slide: Product; priority?: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full w-full max-h-[440px] max-w-[440px] aspect-square">
        <Image
          src={slide.image_url}
          alt={slide.name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 88vw, 440px"
          className="object-cover object-center drop-shadow-2xl"
        />
      </div>
    </div>
  );
}

function HeroImageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full max-w-[440px] aspect-square mx-auto md:mx-0 md:ml-auto shrink-0 overflow-hidden">
      {children}
    </div>
  );
}

function SlideText({ slide }: { slide: Product }) {
  return (
    <>
      <p className="text-accent text-[13px] font-medium tracking-wide uppercase mb-4">
        {slide.category_name || "Featured"}
      </p>
      <SplitReveal
        key={slide.id}
        as="h1"
        lines={headlineLines(slide.name)}
        className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]"
      />
      <p className="text-white/60 text-lg mt-6 max-w-md line-clamp-3">{slide.description}</p>
      <div className="flex items-center gap-4 mt-8">
        <MagneticLink
          href={`/products/${slide.slug}`}
          className="bg-accent hover:bg-accent-hover text-white rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors"
        >
          Buy from ${slide.price.toLocaleString()}
        </MagneticLink>
        <MagneticLink
          href={`/products/${slide.slug}`}
          strength={0.25}
          className="text-white/90 hover:text-white text-[15px] font-medium underline underline-offset-4"
        >
          Learn more
        </MagneticLink>
      </div>
    </>
  );
}

function SlideTextStatic({ slide }: { slide: Product }) {
  return (
    <>
      <p className="text-accent text-[13px] font-medium tracking-wide uppercase mb-4">
        {slide.category_name || "Featured"}
      </p>
      <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.02]">
        {headlineLines(slide.name).map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h1>
      <p className="text-white/60 text-lg mt-6 max-w-md line-clamp-3">{slide.description}</p>
      <div className="flex items-center gap-4 mt-8">
        <Link
          href={`/products/${slide.slug}`}
          className="bg-accent hover:bg-accent-hover text-white rounded-full px-7 py-3.5 text-[15px] font-medium transition-colors"
        >
          Buy from ${slide.price.toLocaleString()}
        </Link>
        <Link
          href={`/products/${slide.slug}`}
          className="text-white/90 hover:text-white text-[15px] font-medium underline underline-offset-4"
        >
          Learn more
        </Link>
      </div>
    </>
  );
}

export default function Hero({ products = [] }: { products?: Product[] }) {
  const slides = products.length > 0 ? products : FALLBACK_SLIDES;
  const containerRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const activeSlide = slides[activeIndex % slides.length];

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const imageScale = useTransform(scrollYProgress, [0, 1], reduced ? [1, 1] : [1, 1.4]);
  const imageY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.25]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0]);

  useEffect(() => {
    if (slides.length <= 1 || paused) return;

    const timer = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [slides.length, paused]);

  const slideTransition = { duration: 0.55, ease: [0.32, 0.72, 0, 1] as const };

  if (reduced) {
    return (
      <section
        className="dark-section text-white overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="container-page py-20 sm:py-28 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
              >
                <SlideTextStatic slide={activeSlide} />
              </motion.div>
            </AnimatePresence>
            {slides.length > 1 && (
              <SlideDots slides={slides} activeIndex={activeIndex} onSelect={setActiveIndex} />
            )}
          </div>
          <HeroImageFrame>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="absolute inset-0"
              >
                <HeroProductImage slide={activeSlide} priority={activeIndex === 0} />
              </motion.div>
            </AnimatePresence>
          </HeroImageFrame>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      className="relative h-[190vh] md:h-[240vh]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="sticky top-0 h-screen dark-section text-white overflow-hidden">
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/30 blur-[120px]"
          style={{ opacity: glowOpacity }}
        />

        <div className="container-page h-full grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div style={{ y: textY, opacity: textOpacity }}>
            <div className="relative min-h-[320px] sm:min-h-[360px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                  className="absolute inset-0"
                >
                  <SlideText slide={activeSlide} />
                </motion.div>
              </AnimatePresence>
            </div>
            {slides.length > 1 && (
              <SlideDots slides={slides} activeIndex={activeIndex} onSelect={setActiveIndex} />
            )}
          </motion.div>

          <motion.div
            style={{ scale: imageScale, y: imageY, opacity: imageOpacity }}
            className="[perspective:1200px]"
          >
            <HeroImageFrame>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.id}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={slideTransition}
                  className="absolute inset-0"
                >
                  <HeroProductImage slide={activeSlide} priority={activeIndex === 0} />
                </motion.div>
              </AnimatePresence>
            </HeroImageFrame>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function SlideDots({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: Product[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 mt-8" role="tablist" aria-label="Featured products">
      {slides.map((slide, i) => (
        <button
          key={slide.id}
          type="button"
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Show ${slide.category_name || slide.name}`}
          onClick={() => onSelect(i)}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === activeIndex ? "w-7 bg-accent" : "w-2 bg-white/30 hover:bg-white/50"
          }`}
        />
      ))}
    </div>
  );
}
