import React, { useState } from 'react';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

interface NeighborhoodMapProps {
  onSelectNeighborhood: (neighborhood: string) => void;
}

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({ onSelectNeighborhood }) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>('Bandra West');

  const hotspots = [
    {
      id: 'airport',
      name: 'Airport',
      stays: '21 stays',
      query: 'Airport',
      top: '68%',
      left: '22%',
      desc: 'Top business hotels with luxury express soundproofing & 24h shuttles',
    },
    {
      id: 'bandra',
      name: 'Bandra West',
      stays: '14 stays',
      query: 'Bandra',
      top: '38%',
      left: '48%',
      desc: 'Chic seaside promenades, bohemian cafes, and heritage villas',
    },
    {
      id: 'juhu',
      name: 'Juhu Beach',
      stays: '5 stays',
      query: 'Juhu',
      top: '46%',
      left: '72%',
      desc: 'Sunset sea-facing terraces, Arabian sea breeze and luxury dining',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#F7F1E8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Dark Forest Green Card matching the video */}
        <div className="rounded-3xl bg-[#073D36] text-white p-6 sm:p-10 shadow-xl overflow-hidden relative border border-[#062F2B]">
          {/* Subtle background ambient glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,rgba(242,118,88,0.15),transparent_70%)] pointer-events-none" />

          {/* Top text block */}
          <div className="max-w-xl mb-8 relative z-10">
            <div className="flex items-center gap-2 mb-3 text-[#EFE7DB]/80 text-xs uppercase font-semibold tracking-widest">
              <span className="w-5 h-[2px] bg-[#F27658] inline-block" />
              <span>DISCOVER AROUND YOU</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-4">
              Good stays <br />
              <span className="italic font-normal text-[#F27658]">know the neighbourhood.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#EFE7DB]/80 font-light leading-relaxed mb-6">
              Explore hotels near airports, stations, business districts and the places you actually came to see.
            </p>

            <button
              onClick={() => onSelectNeighborhood(activeHotspot || 'Bandra')}
              className="px-6 py-3 rounded-full bg-white text-[#073D36] hover:bg-[#FAF6F0] font-semibold text-xs sm:text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-[#F27658]" />
              <span>Explore map</span>
            </button>
          </div>

          {/* Stylized Street & Neighbourhood Map Canvas matching video */}
          <div className="relative w-full h-72 sm:h-80 rounded-2xl bg-[#EBE5DB] overflow-hidden border border-white/10 shadow-inner">
            {/* Stylized vector street grid lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="10%" y1="0" x2="10%" y2="100%" stroke="#D3C9BD" strokeWidth="6" />
              <line x1="30%" y1="0" x2="45%" y2="100%" stroke="#D3C9BD" strokeWidth="8" />
              <line x1="60%" y1="0" x2="50%" y2="100%" stroke="#D3C9BD" strokeWidth="5" />
              <line x1="85%" y1="0" x2="90%" y2="100%" stroke="#D3C9BD" strokeWidth="6" />

              <line x1="0" y1="20%" x2="100%" y2="30%" stroke="#D3C9BD" strokeWidth="6" />
              <line x1="0" y1="55%" x2="100%" y2="50%" stroke="#D3C9BD" strokeWidth="8" />
              <line x1="0" y1="80%" x2="100%" y2="75%" stroke="#D3C9BD" strokeWidth="5" />

              {/* Diagonal connecting boulevard */}
              <line x1="0" y1="10%" x2="100%" y2="90%" stroke="#FAF6F0" strokeWidth="5" />
              <line x1="15%" y1="90%" x2="85%" y2="10%" stroke="#FAF6F0" strokeWidth="4" />
            </svg>

            {/* Hotspot Badges matching video */}
            {hotspots.map((spot) => {
              const isSelected = activeHotspot === spot.name;
              return (
                <div
                  key={spot.id}
                  style={{ top: spot.top, left: spot.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  onClick={() => {
                    setActiveHotspot(spot.name);
                    onSelectNeighborhood(spot.query);
                  }}
                >
                  {/* Pin Dot with pulse */}
                  <div className="relative flex items-center justify-center">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#F27658] border-2 border-white shadow-md block" />
                    <span className="absolute w-6 h-6 rounded-full bg-[#F27658]/30 animate-ping pointer-events-none" />
                  </div>

                  {/* Tooltip / Badge Card matching video */}
                  <div
                    className={`mt-1.5 px-3 py-1.5 rounded-xl bg-white shadow-lg border border-neutral-200 transition-all whitespace-nowrap text-left ${
                      isSelected
                        ? 'ring-2 ring-[#073D36] scale-105'
                        : 'group-hover:scale-105'
                    }`}
                  >
                    <div className="font-semibold text-xs text-[#17201E] flex items-center gap-1">
                      <span>{spot.name}</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-light">
                      {spot.stays}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Hint overlay on bottom right */}
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] text-neutral-600 font-medium shadow-sm">
              Tap any hotspot to filter stays
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
