import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import heroBackground from '../assets/images/hero_indian_palace_1790355024750.jpg';

interface HeroProps {
  onStartPlanning: () => void;
  onPlanWithAI: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartPlanning, onPlanWithAI }) => {
  return (
    <section className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center overflow-hidden text-white">
      {/* Background Image with Measured Scrim Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBackground}
          alt="Palace resort in India at twilight"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        {/* Dark Forest Green Scrim matching reference video */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#062F2B]/92 via-[#073D36]/88 to-[#062F2B]/96 backdrop-brightness-90" />
        {/* Subtle texture glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(242,118,88,0.12),transparent_50%)]" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-28 text-center sm:text-left flex flex-col items-center sm:items-start">
        {/* Eyebrow */}
        <div className="flex items-center gap-2 mb-4 text-[#F7F1E8]/90 tracking-widest text-xs uppercase font-semibold">
          <span className="w-6 h-[2px] bg-[#F27658] inline-block" />
          <span>INDIA, YOUR WAY</span>
        </div>

        {/* Headline matching video with serif italic styling */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#FFFFFF] leading-[1.08] max-w-3xl mb-6">
          Your journey <br className="hidden sm:inline" />
          <span className="italic font-normal font-serif text-[#F7F1E8]">Starts Here.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-[#EFE7DB]/90 max-w-2xl font-light leading-relaxed mb-8 text-balance">
          Flights, trains, buses and stays — everything you need for a seamless trip.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-12">
          <button
            onClick={onStartPlanning}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-[#073D36] hover:bg-[#F7F1E8] font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start planning</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#073D36]" />
          </button>

          <button
            onClick={onPlanWithAI}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white backdrop-blur-md border border-white/20 font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#F27658]" />
            <span>Plan with AI</span>
          </button>
        </div>

        {/* Quick Stats matching the video */}
        <div className="grid grid-cols-3 gap-6 sm:gap-12 pt-6 border-t border-white/15 w-full sm:w-auto">
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white tabular-nums">
              50+
            </div>
            <div className="text-xs sm:text-sm text-[#EFE7DB]/75 font-normal mt-0.5">
              handpicked hotels
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white tabular-nums">
              4
            </div>
            <div className="text-xs sm:text-sm text-[#EFE7DB]/75 font-normal mt-0.5">
              ways to travel
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-serif font-bold text-white tabular-nums">
              24/7
            </div>
            <div className="text-xs sm:text-sm text-[#EFE7DB]/75 font-normal mt-0.5">
              trip support
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
