import React, { useRef, memo } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FaStar } from "react-icons/fa";
import { useTheme } from "@/context/ThemeContext";
import AboutStats from "@/components/sections/subSections/AboutStats";
// import InstagramSection from '@/components/sections/subSections/InstagramSection'

/* ---------------- STATIC DATA (MODULE SCOPE) ---------------- */

// Titles/descriptions live in the translations (impact.timeline_list),
// matched by position with this array.
const timelineEvents = [
  {
    year: "2024",
    icon: "🚀",
    color: "#00FF88",
  },
  {
    year: "2024",
    icon: "👥",
    color: "#00D4FF",
  },
  {
    year: "2024",
    icon: "🎤",
    color: "#FF0080",
  },
  {
    year: "2024",
    icon: "🔧",
    color: "#FFD700",
  },
  {
    year: "2024",
    icon: "🎯",
    color: "#8B5CF6",
  },

  {
    year: "2025",
    icon: "🌟",
    color: "#00FF88",
  },
  {
    year: "2025",
    icon: "👥",
    color: "#00D4FF",
  },
  {
    year: "2025",
    icon: "🎤",
    color: "#FF0080",
  },
  {
    year: "2025",
    icon: "🎯",
    color: "#8B5CF6",
  },

  {
    year: "2025",
    icon: "🚀",
    color: "#00FF88",
  },
  {
    year: "2025",
    icon: "💼",
    color: "#14B8A6",
  },
  {
    year: "2026",
    icon: "📱",
    color: "#00D4FF",
  },
  {
    year: "2026",
    icon: "🚀",
    color: "#8B5CF6",
  },
  {
    year: "2026",
    icon: "🏁",
    color: "#FFD700",
  },
  {
    year: "2026",
    icon: "💎",
    color: "#8B5CF6",
  },
  {
    year: "2026",
    icon: "🌟",
    color: "#FF0080",
  },
] as const;

const galleryImages = [
  {
    src: "/media/images/image1.webp",
    caption: "CyberIsrael Conference 2024",
    type: "conference",
  },
  {
    src: "/media/images/image2.webp",
    caption: "CyberIsrael Conference 2024",
    type: "conference",
  },
  {
    src: "/media/images/image3.webp",
    caption: "CyberIsrael Conference 2024",
    type: "conference",
  },
  {
    src: "/media/images/image4.webp",
    caption: "CyberIsrael Conference 2024",
    type: "conference",
  },
  {
    src: "/media/images/image9.webp",
    caption: "CyberIsrael Conference 2024",
    type: "conference",
  },
  {
    src: "/media/images/image6.webp",
    caption: "CyberIsrael Conference 2024",
    type: "conference",
  },
] as const;

type TimelineEventType = (typeof timelineEvents)[number];

/* ---------------- SKELETON ---------------- */

const ImageSkeleton = memo(() => (
  <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800" />
));

/* ---------------- LAZY IMAGE (STABLE) ---------------- */

const LazyImage = memo(function LazyImage({
  src,
  alt,
  className,
  width,
  height,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}) {
  const imgRef = React.useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    // Reset for the incoming src.
    setLoaded(false);

    // Race-condition guard: if the browser already finished loading the image
    // (e.g. it was served from cache and `load` fired synchronously during
    // React's commit phase — before this effect ran), `img.complete` will
    // already be `true` and the `onLoad` event will never fire again.
    // Recover immediately so the skeleton doesn't get permanently stuck.
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className="relative aspect-video w-full overflow-hidden">
      {!loaded && <ImageSkeleton />}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`${className} absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
});

/* ---------------- 🔥 FULLY ISOLATED GALLERY (CRITICAL FIX) ---------------- */

const GallerySection = memo(function GallerySection({
  theme,
}: {
  theme: string;
}) {
  const badgeClass =
    theme === "dark"
      ? "bg-cyber-card/80 text-cyber-teal border border-cyber-teal/30"
      : "bg-white/80 text-light-teal border border-light-teal/30";

  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {galleryImages.map((img) => (
        <div
          key={img.src}
          className="relative group overflow-hidden rounded-xl aspect-video"
        >
          <LazyImage
            src={img.src}
            alt={img.caption}
            width={640}
            height={360}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 will-change-transform"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
            <span className="text-white text-xs font-display">
              {img.caption}
            </span>
          </div>

          <div
            className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-display uppercase ${badgeClass}`}
          >
            {t(`events.labels.${img.type}`)}
          </div>
        </div>
      ))}
    </div>
  );
});

/* ---------------- TIMELINE ITEM ---------------- */

type TimelineEventContent = {
  title: string;
  desc: string;
};

const TimelineItem = memo(function TimelineItem({
  event,
  content,
  index,
}: {
  event: TimelineEventType;
  content?: TimelineEventContent;
  index: number;
}) {
  const isEven = (index & 1) === 0;

  const motionDelay = index > 6 ? 0.3 : index * 0.05;
  const iconDelay = index > 6 ? 0.4 : index * 0.05 + 0.1;

  const textAlign = isEven ? "text-right pr-8" : "text-left pl-8";
  const rowDir = isEven ? "flex-row" : "flex-row-reverse";

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -20 : 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay: motionDelay, duration: 0.35 }}
      className={`relative flex items-center ${rowDir}`}
      style={{ willChange: "transform, opacity" }}
    >
      <div className={`w-5/12 ${textAlign}`}>
        <div
          className="font-display text-xs tracking-widest"
          style={{ color: event.color }}
        >
          {event.year}
        </div>
        <div className="font-display font-bold text-sm mt-1 text-white">
          {content?.title}
        </div>
        <div className="text-xs mt-1 text-slate-400">{content?.desc}</div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: iconDelay, duration: 0.25 }}
          className="w-10 h-10 rounded-full flex items-center justify-center text-lg z-10"
          style={{
            background: `${event.color}20`,
            border: `2px solid ${event.color}60`,
          }}
        >
          {event.icon}
        </motion.div>
      </div>

      <div className="w-5/12" />
    </motion.div>
  );
});

/* ---------------- PAGE ---------------- */

const ImpactPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const timelineRef = useRef<HTMLDivElement>(null);
  const timelineInView = useInView(timelineRef, {
    once: true,
    margin: "-100px",
  });

  const isDark = theme === "dark";

  const text = {
    title: t("impact.title"),
    subtitle: t("impact.subtitle"),
    conferences_section: t("impact.conferences_section"),
    conferences_desc: t("impact.conferences_desc"),
    video_title: t("impact.video_title"),
    video_desc: t("impact.video_desc"),
    timeline_title: t("impact.timeline_title"),
    growth_section: t("impact.growth_section"),
  };

  const safeTimelineContent = (): TimelineEventContent[] => {
    try {
      const value = t("impact.timeline_list", { returnObjects: true });

      if (!Array.isArray(value)) {
        console.error("impact.timeline_list is not an array.");
        console.log("Received value:", value);
        return [];
      }

      return value.filter((item) => {
        const valid =
          item &&
          typeof item === "object" &&
          typeof item.title === "string" &&
          typeof item.desc === "string";

        if (!valid) {
          console.error(`Invalid entry at impact.timeline_list`);
          console.log(item);
        }

        return valid;
      }) as TimelineEventContent[];
    } catch (err) {
      console.error("Failed loading impact.timeline_list");
      console.log(err);
      return [];
    }
  };

  const timelineContent = safeTimelineContent();

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-16"
        >
          <h1 className="section-title">
            <span className={isDark ? "text-white" : "text-light-text"}>
              {text.title}
            </span>
          </h1>

          <p
            className={`text-lg ${isDark ? "text-slate-400" : "text-light-muted"}`}
          >
            {text.subtitle}
          </p>
        </motion.div>

        <AboutStats started={true} />

        {/* 🔥 ISOLATED GALLERY (NO i18n RE-RENDER IMPACT) */}
        <div className="mb-20">
          <h2
            className={`font-display text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-light-text"}`}
          >
            {text.conferences_section}
          </h2>

          <p
            className={`text-sm mb-8 ${isDark ? "text-slate-400" : "text-light-muted"}`}
          >
            {text.conferences_desc}
          </p>

          <GallerySection theme={theme} />
        </div>

        {/* VIDEO */}
        <div className="relative flex justify-center items-center">
          <div
            className={`relative w-fit rounded-3xl overflow-hidden border ${
              isDark
                ? "bg-cyber-card border-cyber-green/30"
                : "bg-white border-light-blue/20 shadow-sm"
            }`}
          >
            <div className="aspect-video w-[800px] max-w-full bg-black/10">
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/1t7jHD319DE"
                title={text.video_title}
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-6">
              <h3
                className={`font-display text-xl font-bold mb-2 ${isDark ? "text-white" : "text-light-text"}`}
              >
                {text.video_title}
              </h3>
              <p
                className={`text-sm ${isDark ? "text-slate-400" : "text-light-muted"}`}
              >
                {text.video_desc}
              </p>
            </div>
          </div>
        </div>

        {/* INSTAGRAM */}

        {/*
        <InstagramSection
          title="CyberIsrael on Instagram"
          subtitle="Real posts from our community"
          columns={3}
          posts={[
            {
              id: '1',
              url: 'https://www.instagram.com/p/DYQCDEDiIRi/?utm_source=ig_embed&amp'
            },
            {
              id: '2',
              url: 'https://www.instagram.com/p/DYQCDEDiIRi/?utm_source=ig_embed&amp'
            },
            {
              id: '3',
              url: 'https://www.instagram.com/p/DYQCDEDiIRi/?utm_source=ig_embed&amp'
            }
          ]}
        />
        */}

        {/* TIMELINE */}
        <div ref={timelineRef} className="mt-20">
          <h2
            className={`font-display text-2xl font-bold mb-2 text-center ${isDark ? "text-white" : "text-light-text"}`}
          >
            {text.timeline_title}
          </h2>

          <div className="relative mt-10">
            <div
              className={`absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 ${
                isDark ? "bg-cyber-border/50" : "bg-light-border"
              }`}
            />

            <div className="space-y-10">
              {timelineInView &&
                timelineEvents.map((event, i) => (
                  <TimelineItem
                    key={`${event.year}-${i}`}
                    event={event}
                    index={i}
                    content={timelineContent[i]}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* GROWTH */}
        <div className="mt-20 text-center">
          <h2
            className={`font-display text-2xl font-bold mb-4 ${isDark ? "text-white" : "text-light-text"}`}
          >
            {text.growth_section}
          </h2>

          <div
            className={`p-8 rounded-2xl border ${
              isDark
                ? "bg-cyber-card border-cyber-green/20"
                : "bg-white border-light-blue/20 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaStar className="text-yellow-400" />
              <span className="font-display text-5xl font-black gradient-text">
                2,000+
              </span>
              <FaStar className="text-yellow-400" />
            </div>

            <p
              className={`text-sm font-display tracking-widest uppercase ${
                isDark ? "text-slate-400" : "text-light-muted"
              }`}
            >
              {t("impact.community_members")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(ImpactPage);
