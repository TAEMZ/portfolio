import React, { useRef } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Keyboard } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import ScrambleText from "./ScrambleText";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "./Skills.css";

export default function Skills() {
  const { data: skills = {}, isLoading } = useQuery({
    queryKey: ["skills"],
    queryFn: async () => {
      const response = await fetch("/api/get-data?table=skills");
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      return data.reduce((acc, curr) => {
        acc[curr.category] = curr.items;
        return acc;
      }, {});
    },
  });

  const swiperRef = useRef(null);
  const entries = Object.entries(skills);
  const totalCards = entries.length;
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const useCarousel = totalCards > 1;

  const handlePrev = () => {
    const swiper = swiperRef.current;
    if (swiper && !swiper.destroyed) {
      swiper.slidePrev();
    }
  };

  const handleNext = () => {
    const swiper = swiperRef.current;
    if (swiper && !swiper.destroyed) {
      swiper.slideNext();
    }
  };

  if (isLoading) {
    return (
      <section className="skills-section" id="skills">
        Loading...
      </section>
    );
  }

  if (totalCards === 0) {
    return (
      <section className="skills-section" id="skills">
        <ScrambleText as="h2" className="skills-title" text="SKILLS" />
        <div className="skill-groups">
          <p>No skills found.</p>
        </div>
        <div className="skills-glow"></div>
        <div className="cyber-grid"></div>
      </section>
    );
  }

  if (!useCarousel) {
    return (
      <section className="skills-section" id="skills">
        <ScrambleText as="h2" className="skills-title" text="SKILLS" />
        <div className="skill-groups">
          {entries.map(([category, items], index) => (
            <div className="skill-group" key={category || index}>
              <div className="skill-group-header">
                <h3 className="category-title">{category}</h3>
              </div>
              <div className="skill-chips">
                {Array.isArray(items) && items.map((item, idx) => (
                  <span className="skill-chip" key={idx} data-text={item}>
                    <span className="skill-chip-inner">{item}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="skills-glow"></div>
        <div className="cyber-grid"></div>
      </section>
    );
  }

  return (
    <section className="skills-section" id="skills">
      <ScrambleText as="h2" className="skills-title" text="SKILLS" />

      <motion.div
        className="skills-carousel-wrapper"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <Swiper
          key={`skills-swiper-${totalCards}`}
          onSwiper={(instance) => {
            swiperRef.current = instance;
          }}
          spaceBetween={0}
          autoplay={false}
          speed={prefersReducedMotion ? 0 : 300}
          effect="coverflow"
          grabCursor={true}
          slidesPerView="auto"
          centeredSlides={true}
          slideToClickedSlide={true}
          threshold={5}
          keyboard={{ enabled: true }}
          observer={true}
          observeParents={true}
          watchSlidesProgress={true}
          initialSlide={totalCards === 3 ? 1 : 0}
          loop={totalCards >= 4}
          loopPreventsSliding={false}
          rewind={totalCards > 1 && totalCards < 4}
          coverflowEffect={{
            rotate: 40,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          pagination={{
            clickable: true,
          }}
          className="skills-coverflow-swiper"
          modules={[EffectCoverflow, Pagination, Keyboard]}
        >
          {entries.map(([category, items], index) => (
            <SwiperSlide className="skills-carousel-slide" key={category || index}>
              <div className="skill-group">
                <div className="skill-group-header">
                  <h3 className="category-title">{category}</h3>
                  <span className="skill-card-index">
                    {String(index + 1).padStart(2, "0")} / {String(totalCards).padStart(2, "0")}
                  </span>
                </div>
                <div className="skill-chips">
                  {Array.isArray(items) && items.map((item, idx) => (
                    <span className="skill-chip" key={idx} data-text={item}>
                      <span className="skill-chip-inner">{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          type="button"
          className="skills-nav-btn skills-nav-prev"
          aria-label="Previous skill category"
          onClick={handlePrev}
        >
          <FiChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          className="skills-nav-btn skills-nav-next"
          aria-label="Next skill category"
          onClick={handleNext}
        >
          <FiChevronRight aria-hidden="true" />
        </button>
      </motion.div>

      <div className="skills-glow"></div>
      <div className="cyber-grid"></div>
    </section>
  );
}

/**
 * Inspired by Skiper 49 Carousel_003 — React + Swiper
 * Original author: @gurvinder-singh02 (https://gxuri.me)
 */
