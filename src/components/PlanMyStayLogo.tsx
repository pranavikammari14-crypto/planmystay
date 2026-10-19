import React from 'react';

interface PlanMyStayLogoProps {
  className?: string;
  height?: number | string;
  showTagline?: boolean;
}

export const PlanMyStayLogo: React.FC<PlanMyStayLogoProps> = ({
  className = 'h-8 sm:h-9 w-auto',
  height,
  showTagline = false,
}) => {
  return (
    <div className="inline-flex flex-col items-start leading-none select-none">
      <svg
        viewBox="0 0 460 120"
        className={className}
        style={height ? { height: typeof height === 'number' ? `${height}px` : height, width: 'auto' } : undefined}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="PlanMyStay.in Logo"
      >
        {/* Navy "plan" */}
        <text
          x="12"
          y="78"
          fill="#1d2d50"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="68"
          letterSpacing="-1.5px"
        >
          plan
        </text>

        {/* Distinctive Organic Red Badge for "mystay" */}
        <path
          d="M 180 32 
             C 152 32, 140 46, 140 65 
             C 140 84, 152 98, 180 98 
             C 212 96, 228 88, 252 88 
             C 276 88, 292 96, 324 98 
             C 352 98, 364 84, 364 65 
             C 364 46, 352 32, 324 32 
             C 292 34, 276 42, 252 42 
             C 228 42, 212 34, 180 32 Z"
          fill="#b82424"
        />

        {/* White "mystay" */}
        <text
          x="252"
          y="76"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="56"
          letterSpacing="-1px"
        >
          mystay
        </text>

        {/* Navy ".in" */}
        <text
          x="376"
          y="78"
          fill="#1d2d50"
          fontFamily="Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
          fontWeight="800"
          fontSize="68"
          letterSpacing="-1.5px"
        >
          .in
        </text>
      </svg>
      {showTagline && (
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#1d2d50]/70 pl-3 -mt-1">
          India's Curated & Affordable Stays
        </span>
      )}
    </div>
  );
};
