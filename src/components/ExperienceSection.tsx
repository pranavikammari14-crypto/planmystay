import React from 'react';
import { Sparkles, Layers, ShieldCheck, ArrowRight } from 'lucide-react';

interface ExperienceSectionProps {
  onOpenAI: () => void;
  onExploreHotels: () => void;
  onOpenTrips: () => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  onOpenAI,
  onExploreHotels,
  onOpenTrips,
}) => {
  return (
    <section id="experience" className="py-20 sm:py-28 bg-[#F7F1E8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Block: The PlanMyStay Difference */}
        <div className="mb-20 sm:mb-24">
          <div className="flex items-center gap-2 mb-3 text-[#17201E]/60 text-xs uppercase font-semibold tracking-widest">
            <span className="w-5 h-[2px] bg-[#F27658] inline-block" />
            <span>THE PLANMYSTAY DIFFERENCE</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#17201E] tracking-tight leading-[1.12] mb-6">
            Less searching. <br />
            <span className="italic font-normal text-[#F27658]">More living.</span>
          </h2>

          <p className="text-base sm:text-lg text-[#17201E]/80 max-w-2xl font-light leading-relaxed mb-6">
            Travel is more than a booking. It is the anticipation, the little discoveries, the stories you bring home. PlanMyStay brings every part of your journey into one calm, considered experience.
          </p>

          <button
            onClick={onOpenAI}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#F27658] hover:text-[#d95d40] transition-colors cursor-pointer group"
          >
            <span>See what we can plan</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Bottom Block: Built For The Way You Travel */}
        <div>
          <div className="flex items-center gap-2 mb-3 text-[#17201E]/60 text-xs uppercase font-semibold tracking-widest">
            <span className="w-5 h-[2px] bg-[#F27658] inline-block" />
            <span>BUILT FOR THE WAY YOU TRAVEL</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold text-[#17201E] tracking-tight leading-[1.12] mb-10">
            One trip. <br />
            <span className="italic font-normal text-[#F27658]">Every detail.</span>
          </h2>

          {/* 3 Numbered Feature Cards matching reference video */}
          <div className="space-y-4">
            {/* Card 01 */}
            <div
              onClick={onOpenAI}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EFE7DB] hover:border-[#073D36]/20 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start justify-between gap-4"
            >
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#F7F1E8] flex items-center justify-center text-[#F27658]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E]">
                    Smart trip planner
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
                  Tell us where you're going, what you love and what you'd like to spend. We'll sketch the rest.
                </p>
              </div>

              <div className="flex flex-col items-end justify-between shrink-0 h-full">
                <span className="text-xs font-mono text-neutral-400">01</span>
                <div className="w-9 h-9 mt-6 rounded-full border border-neutral-200 group-hover:border-[#F27658] group-hover:bg-[#F27658] group-hover:text-white flex items-center justify-center text-neutral-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Card 02 */}
            <div
              onClick={onOpenTrips}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EFE7DB] hover:border-[#073D36]/20 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start justify-between gap-4"
            >
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#F7F1E8] flex items-center justify-center text-[#073D36]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E]">
                    One view of it all
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
                  See transport, hotels, activities and your real trip cost in one beautifully simple plan.
                </p>
              </div>

              <div className="flex flex-col items-end justify-between shrink-0 h-full">
                <span className="text-xs font-mono text-neutral-400">02</span>
                <div className="w-9 h-9 mt-6 rounded-full border border-neutral-200 group-hover:border-[#F27658] group-hover:bg-[#F27658] group-hover:text-white flex items-center justify-center text-neutral-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Card 03 */}
            <div
              onClick={onExploreHotels}
              className="p-6 sm:p-8 rounded-3xl bg-white border border-[#EFE7DB] hover:border-[#073D36]/20 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group flex items-start justify-between gap-4"
            >
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-[#F7F1E8] flex items-center justify-center text-[#073D36]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E]">
                    Travel with confidence
                  </h3>
                </div>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-light">
                  Verified stays, honest policies and human support when your journey needs a little help.
                </p>
              </div>

              <div className="flex flex-col items-end justify-between shrink-0 h-full">
                <span className="text-xs font-mono text-neutral-400">03</span>
                <div className="w-9 h-9 mt-6 rounded-full border border-neutral-200 group-hover:border-[#F27658] group-hover:bg-[#F27658] group-hover:text-white flex items-center justify-center text-neutral-400 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
