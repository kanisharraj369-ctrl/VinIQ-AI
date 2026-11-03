import React from "react";

interface VyniqLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  variant?: "full" | "horizontal" | "stacked" | "icon";
  subtitle?: string;
  showSubtitle?: boolean;
  className?: string;
  animate?: boolean;
}

export const VyniqLogoIcon: React.FC<{ size?: number | string; className?: string; animated?: boolean }> = ({
  size = 40,
  className = "",
  animated = false,
}) => {
  const idSuffix = React.useId().replace(/:/g, "_");
  const emeraldGradId = `vyniq-emerald-${idSuffix}`;
  const tealGradId = `vyniq-teal-${idSuffix}`;
  const glowGradId = `vyniq-glow-${idSuffix}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-300 ${animated ? "hover:scale-105" : ""} ${className}`}
    >
      <defs>
        {/* Emerald Eco Gradient for Left Wing */}
        <linearGradient id={emeraldGradId} x1="20%" y1="0%" x2="90%" y2="100%">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="75%" stopColor="#059669" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Teal & Mint Gradient for Right Wing */}
        <linearGradient id={tealGradId} x1="10%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A7F3D0" />
          <stop offset="45%" stopColor="#14B8A6" />
          <stop offset="80%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#0F766E" />
        </linearGradient>

        {/* Ambient Subtle Eco Glow */}
        <linearGradient id={glowGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* Ambient background soft glow */}
      <circle cx="100" cy="95" r="70" fill={`url(#${glowGradId})`} filter="blur(16px)" opacity="0.5" />

      {/* LEFT WING: Angled Polygon with Emerald-to-Teal gradient */}
      <path
        d="M 38 36 
           L 78 36 
           L 58 98 
           L 80 78 
           L 100 152 
           L 72 152 
           L 38 36 Z"
        fill={`url(#${emeraldGradId})`}
      />

      {/* RIGHT WING: Angled Polygon with Inward Fold and Teal-Mint gradient */}
      <path
        d="M 162 36 
           L 122 36 
           L 102 78 
           L 122 78 
           L 100 152 
           L 128 152 
           L 162 36 Z"
        fill={`url(#${tealGradId})`}
      />

      {/* Top right angular arrow chevron fold */}
      <path
        d="M 122 36 
           L 96 36 
           L 114 78 
           L 134 78 
           Z"
        fill="#A7F3D0"
        opacity="0.95"
      />
    </svg>
  );
};

export const VyniqLogo: React.FC<VyniqLogoProps> = ({
  size = "md",
  variant = "horizontal",
  subtitle = "TECHNOLOGIES",
  showSubtitle = true,
  className = "",
  animate = true,
}) => {
  const sizeMap = {
    xs: { iconSize: 22, text: "text-sm", sub: "text-[8px] tracking-[0.25em]" },
    sm: { iconSize: 28, text: "text-base", sub: "text-[9px] tracking-[0.28em]" },
    md: { iconSize: 38, text: "text-lg", sub: "text-[10px] tracking-[0.3em]" },
    lg: { iconSize: 50, text: "text-2xl", sub: "text-xs tracking-[0.32em]" },
    xl: { iconSize: 64, text: "text-3xl", sub: "text-sm tracking-[0.35em]" },
    hero: { iconSize: 84, text: "text-4xl sm:text-5xl", sub: "text-sm sm:text-base tracking-[0.4em]" },
  };

  const currentSize = sizeMap[size];

  if (variant === "icon") {
    return <VyniqLogoIcon size={currentSize.iconSize} className={className} animated={animate} />;
  }

  if (variant === "stacked") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <VyniqLogoIcon size={currentSize.iconSize} animated={animate} />
        <div className="mt-2">
          <div className={`font-bold font-sans text-white tracking-tight ${currentSize.text} leading-none`}>
            Vyniq
          </div>
          {showSubtitle && (
            <div className={`font-medium uppercase text-emerald-400/80 font-sans mt-1.5 ${currentSize.sub} leading-none`}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <VyniqLogoIcon size={currentSize.iconSize} animated={animate} />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold font-sans text-white tracking-tight leading-none ${currentSize.text}`}>
            Vyniq
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-semibold uppercase tracking-wider">
            CBSE 2026–27
          </span>
        </div>
        {showSubtitle && (
          <div className={`font-semibold uppercase text-emerald-400/80 font-sans mt-1 ${currentSize.sub} leading-none`}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
