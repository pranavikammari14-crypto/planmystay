import React, { useState } from 'react';
import { Sparkles, X, MapPin, Calendar, Users, IndianRupee, Compass, ChevronRight, Loader2, BookmarkCheck, ArrowRight } from 'lucide-react';
import { AITripPlan } from '../types/travel';

interface AIPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookHotelNamed?: (hotelName: string) => void;
}

export const AIPlannerModal: React.FC<AIPlannerModalProps> = ({
  isOpen,
  onClose,
  onBookHotelNamed,
}) => {
  const [destination, setDestination] = useState('Kerala');
  const [days, setDays] = useState('5');
  const [travellers, setTravellers] = useState('2');
  const [budget, setBudget] = useState('₹40,000');
  const [travelStyle, setTravelStyle] = useState('Luxury & Heritage');
  const [interests, setInterests] = useState<string[]>(['Culture', 'Local Food', 'Scenic Views']);
  const [customPrompt, setCustomPrompt] = useState('');

  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<AITripPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const availableInterests = [
    'Culture',
    'Local Food',
    'Scenic Views',
    'Palaces & Forts',
    'Ayurveda & Spa',
    'Beaches',
    'Wildlife',
    'Shopping & Bazaars',
  ];

  const presetPrompts = [
    'Plan a 5-day trip to Kerala under ₹40,000',
    '3-day Royal Heritage weekend in Udaipur & Lake Pichola',
    '4-day Hyderabad Biryani & Nizami architecture immersion',
    'Weekend nature & coffee plantation retreat in Coorg',
  ];

  const handleApplyPreset = (preset: string) => {
    if (preset.includes('Kerala')) {
      setDestination('Kerala');
      setDays('5');
      setBudget('₹40,000');
      setTravelStyle('Nature & Backwaters');
    } else if (preset.includes('Udaipur')) {
      setDestination('Udaipur');
      setDays('3');
      setBudget('₹35,000');
      setTravelStyle('Luxury & Heritage');
    } else if (preset.includes('Hyderabad')) {
      setDestination('Hyderabad');
      setDays('4');
      setBudget('₹28,000');
      setTravelStyle('Heritage & Culinary');
    } else {
      setDestination('Coorg');
      setDays('3');
      setBudget('₹25,000');
      setTravelStyle('Plantation & Wellness');
    }
  };

  const toggleInterest = (item: string) => {
    if (interests.includes(item)) {
      setInterests(interests.filter((i) => i !== item));
    } else {
      setInterests([...interests, item]);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    setError(null);
    setPlan(null);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/ai/trip-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          days: Number(days) || 4,
          travellers: Number(travellers) || 2,
          budget,
          travelStyle,
          interests,
          customPrompt,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate itinerary. Please try again.');
      }

      const data = await res.json();
      if (data.plan) {
        setPlan(data.plan);
      } else {
        throw new Error('No itinerary plan returned.');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong creating your trip plan.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#073D36] text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#F27658] tracking-widest uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI TRAVEL CONCIERGE</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-white">
              PlanMyStay AI
            </h2>
            <p className="text-xs sm:text-sm text-[#EFE7DB]/80 font-light mt-0.5">
              Personalized, unhurried itineraries tailored to your style and budget.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1 space-y-6">
          {/* Quick Presets */}
          {!plan && (
            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                Popular Inquiries
              </label>
              <div className="flex flex-wrap gap-2">
                {presetPrompts.map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handleApplyPreset(preset)}
                    className="px-3 py-1.5 rounded-full bg-white border border-[#EFE7DB] text-xs font-medium text-[#17201E] hover:border-[#073D36] hover:text-[#073D36] transition-colors cursor-pointer text-left"
                  >
                    ✨ {preset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          {!plan && (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Destination */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#EFE7DB]">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Destination in India
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#F27658] shrink-0" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Kerala, Udaipur, Goa, Hyderabad"
                      className="w-full text-sm font-semibold text-[#17201E] focus:outline-none bg-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Duration */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#EFE7DB]">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Trip Duration
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <select
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full text-sm font-semibold text-[#17201E] focus:outline-none bg-transparent cursor-pointer"
                    >
                      <option value="2">2 Days (Weekend Trip)</option>
                      <option value="3">3 Days (Extended Weekend)</option>
                      <option value="4">4 Days (Relaxed Gateway)</option>
                      <option value="5">5 Days (Complete Holiday)</option>
                      <option value="7">7 Days (Full Grand Tour)</option>
                    </select>
                  </div>
                </div>

                {/* Travellers */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#EFE7DB]">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Number of Travellers
                  </label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                    <select
                      value={travellers}
                      onChange={(e) => setTravellers(e.target.value)}
                      className="w-full text-sm font-semibold text-[#17201E] focus:outline-none bg-transparent cursor-pointer"
                    >
                      <option value="1">Solo Traveller</option>
                      <option value="2">Couple (2 Travellers)</option>
                      <option value="3">Small Group (3 Travellers)</option>
                      <option value="4">Family / Friends (4+)</option>
                    </select>
                  </div>
                </div>

                {/* Budget */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#EFE7DB]">
                  <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                    Target Budget (₹ INR)
                  </label>
                  <div className="flex items-center gap-2">
                    <IndianRupee className="w-4 h-4 text-[#073D36] shrink-0" />
                    <input
                      type="text"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="e.g. ₹40,000"
                      className="w-full text-sm font-semibold text-[#17201E] focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Style */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Preferred Travel Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {['Luxury & Heritage', 'Nature & Wellness', 'Culinary & Street Food', 'Relaxed Beach', 'Art & Photography'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTravelStyle(style)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all cursor-pointer ${
                        travelStyle === style
                          ? 'border-[#073D36] bg-[#073D36] text-white'
                          : 'border-[#EFE7DB] bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Trip Interests & Focus
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableInterests.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                        interests.includes(item)
                          ? 'border-[#073D36] bg-[#073D36]/10 text-[#073D36]'
                          : 'border-[#EFE7DB] bg-white text-neutral-600 hover:border-neutral-300'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#F27658] hover:bg-[#e06547] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Curating your bespoke Indian itinerary...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Create Custom Itinerary</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Generated Plan View */}
          {plan && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Plan Banner */}
              <div className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[#F27658] uppercase tracking-wider">
                      {plan.travelStyle} · {plan.duration}
                    </span>
                    <h3 className="font-serif font-bold text-2xl text-[#17201E]">
                      {plan.destination} Crafted Journey
                    </h3>
                  </div>
                  <div className="px-3.5 py-1.5 rounded-full bg-[#073D36]/10 text-[#073D36] text-xs font-bold">
                    {plan.budgetSummary}
                  </div>
                </div>

                <p className="text-sm text-neutral-600 font-light leading-relaxed mb-4">
                  {plan.overview}
                </p>

                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#EFE7DB] text-xs text-neutral-700">
                  <span className="font-semibold text-[#073D36]">Transit Advice: </span>
                  {plan.recommendedTransport}
                </div>
              </div>

              {/* Day-by-Day Itinerary */}
              <div className="space-y-4">
                <h4 className="font-serif font-bold text-lg text-[#17201E]">
                  Day-by-Day Experience
                </h4>

                {plan.days.map((day) => (
                  <div
                    key={day.day}
                    className="p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#073D36] text-white flex items-center justify-center text-xs font-bold">
                          {day.day}
                        </span>
                        <span className="font-serif font-bold text-base text-[#17201E]">
                          {day.title}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-neutral-500 tabular-nums">
                        {day.estimatedCost}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-neutral-600">
                      <div className="p-2.5 rounded-xl bg-[#FAF6F0]/60">
                        <span className="font-bold text-[#073D36] block mb-1">
                          🌅 Morning
                        </span>
                        {day.morning}
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF6F0]/60">
                        <span className="font-bold text-[#073D36] block mb-1">
                          ☀️ Afternoon
                        </span>
                        {day.afternoon}
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF6F0]/60">
                        <span className="font-bold text-[#073D36] block mb-1">
                          🌙 Evening
                        </span>
                        {day.evening}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-neutral-100">
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="font-semibold text-[#073D36]">Recommended Stays:</span>
                        <span>{day.recommendedStays.join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <span className="font-semibold text-[#073D36]">Iconic Dining:</span>
                        <span>{day.diningSpots.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Local Tips */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB]">
                <h5 className="font-bold text-xs text-[#073D36] uppercase tracking-wider mb-2">
                  PlanMyStay Insider Advice
                </h5>
                <ul className="space-y-1.5 text-xs text-neutral-600">
                  {plan.localInsiderTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#F27658]">✦</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setPlan(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  ← Plan another trip
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setSavedSuccess(true)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                    <span>{savedSuccess ? 'Saved to My Trips!' : 'Save Itinerary'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onClose();
                      const element = document.getElementById('hotels');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Browse Matching Stays</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
