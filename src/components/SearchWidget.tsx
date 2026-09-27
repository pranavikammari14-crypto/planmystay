import React, { useState } from 'react';
import { Plane, Train, Bus, Hotel, Search, ArrowRightLeft, Calendar, User, Check, Sparkles } from 'lucide-react';
import { INDIAN_CITIES } from '../data/travelOptions';

interface SearchWidgetProps {
  activeTab: 'flights' | 'trains' | 'buses' | 'hotels';
  onTabChange: (tab: 'flights' | 'trains' | 'buses' | 'hotels') => void;
  onSearchFlights: (params: any) => void;
  onSearchTrains: (params: any) => void;
  onSearchBuses: (params: any) => void;
  onSearchHotels: (params: any) => void;
  onOpenAI: () => void;
}

export const SearchWidget: React.FC<SearchWidgetProps> = ({
  activeTab,
  onTabChange,
  onSearchFlights,
  onSearchTrains,
  onSearchBuses,
  onSearchHotels,
  onOpenAI,
}) => {
  // Flights state
  const [flightType, setFlightType] = useState<'oneway' | 'roundtrip' | 'multicity'>('oneway');
  const [flightFrom, setFlightFrom] = useState('Hyderabad (HYD)');
  const [flightTo, setFlightTo] = useState('Mumbai (BOM)');
  const [flightDeparture, setFlightDeparture] = useState('2026-09-26');
  const [flightReturn, setFlightReturn] = useState('2026-09-30');
  const [flightTravellers, setFlightTravellers] = useState('1 Traveller · Economy');
  const [directOnly, setDirectOnly] = useState(true);

  // Trains state
  const [trainFrom, setTrainFrom] = useState('Secunderabad (SC)');
  const [trainTo, setTrainTo] = useState('Mumbai CSMT (CSMT)');
  const [trainDate, setTrainDate] = useState('2026-09-27');
  const [trainClass, setTrainClass] = useState('All Classes');

  // Buses state
  const [busFrom, setBusFrom] = useState('Hyderabad');
  const [busTo, setBusTo] = useState('Mumbai');
  const [busDate, setBusDate] = useState('2026-09-26');

  // Hotels state
  const [hotelDestination, setHotelDestination] = useState('Hyderabad');
  const [checkInDate, setCheckInDate] = useState('2026-10-15');
  const [checkOutDate, setCheckOutDate] = useState('2026-10-18');
  const [hotelGuests, setHotelGuests] = useState('2 Guests · 1 Room');

  const swapLocations = () => {
    if (activeTab === 'flights') {
      const temp = flightFrom;
      setFlightFrom(flightTo);
      setFlightTo(temp);
    } else if (activeTab === 'trains') {
      const temp = trainFrom;
      setTrainFrom(trainTo);
      setTrainTo(temp);
    } else if (activeTab === 'buses') {
      const temp = busFrom;
      setBusFrom(busTo);
      setBusTo(temp);
    }
  };

  const handleFlightSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchFlights({
      from: flightFrom,
      to: flightTo,
      date: flightDeparture,
      type: flightType,
      directOnly,
      travellers: flightTravellers,
    });
  };

  const handleTrainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchTrains({
      from: trainFrom,
      to: trainTo,
      date: trainDate,
      classType: trainClass,
    });
  };

  const handleBusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchBuses({
      from: busFrom,
      to: busTo,
      date: busDate,
    });
  };

  const handleHotelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchHotels({
      destination: hotelDestination,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: hotelGuests,
    });
  };

  return (
    <div className="relative -mt-12 sm:-mt-16 z-20 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-3xl shadow-xl border border-[#EFE7DB] overflow-hidden">
        {/* Navigation Tabs matching the video */}
        <div className="grid grid-cols-4 border-b border-[#EFE7DB] bg-[#FAF6F0]/60">
          <button
            onClick={() => onTabChange('flights')}
            className={`py-4 px-2 sm:px-6 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'flights'
                ? 'border-[#F27658] text-[#17201E] bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Plane className={`w-4 h-4 ${activeTab === 'flights' ? 'text-[#F27658]' : ''}`} />
            <span>Flights</span>
          </button>

          <button
            onClick={() => onTabChange('trains')}
            className={`py-4 px-2 sm:px-6 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'trains'
                ? 'border-[#F27658] text-[#17201E] bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Train className={`w-4 h-4 ${activeTab === 'trains' ? 'text-[#F27658]' : ''}`} />
            <span>Trains</span>
          </button>

          <button
            onClick={() => onTabChange('buses')}
            className={`py-4 px-2 sm:px-6 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'buses'
                ? 'border-[#F27658] text-[#17201E] bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Bus className={`w-4 h-4 ${activeTab === 'buses' ? 'text-[#F27658]' : ''}`} />
            <span>Buses</span>
          </button>

          <button
            onClick={() => onTabChange('hotels')}
            className={`py-4 px-2 sm:px-6 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all border-b-2 cursor-pointer ${
              activeTab === 'hotels'
                ? 'border-[#F27658] text-[#17201E] bg-white'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Hotel className={`w-4 h-4 ${activeTab === 'hotels' ? 'text-[#F27658]' : ''}`} />
            <span>Hotels</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 sm:p-7">
          {/* FLIGHTS TAB */}
          {activeTab === 'flights' && (
            <div>
              <div className="mb-4">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E]">
                  Book a flight
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Best prices, flexible options, no hidden surprises.
                </p>
              </div>

              {/* Flight Type Radios */}
              <div className="flex items-center gap-6 mb-5 text-xs sm:text-sm font-medium text-neutral-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    checked={flightType === 'oneway'}
                    onChange={() => setFlightType('oneway')}
                    className="accent-[#F27658] w-4 h-4"
                  />
                  <span>One way</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    checked={flightType === 'roundtrip'}
                    onChange={() => setFlightType('roundtrip')}
                    className="accent-[#F27658] w-4 h-4"
                  />
                  <span>Round trip</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="flightType"
                    checked={flightType === 'multicity'}
                    onChange={() => setFlightType('multicity')}
                    className="accent-[#F27658] w-4 h-4"
                  />
                  <span>Multi-city</span>
                </label>
              </div>

              {/* Form Fields Grid */}
              <form onSubmit={handleFlightSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                  {/* FROM */}
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40 focus-within:border-[#073D36] transition-colors relative">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      FROM
                    </label>
                    <select
                      value={flightFrom}
                      onChange={(e) => setFlightFrom(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm sm:text-base text-[#17201E] focus:outline-none cursor-pointer"
                    >
                      {INDIAN_CITIES.map((c) => (
                        <option key={c.code} value={`${c.name} (${c.code})`}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TO with Swap Icon */}
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40 focus-within:border-[#073D36] transition-colors relative">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      TO
                    </label>
                    <div className="flex items-center justify-between">
                      <select
                        value={flightTo}
                        onChange={(e) => setFlightTo(e.target.value)}
                        className="w-full bg-transparent font-semibold text-sm sm:text-base text-[#17201E] focus:outline-none cursor-pointer"
                      >
                        {INDIAN_CITIES.map((c) => (
                          <option key={c.code} value={`${c.name} (${c.code})`}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={swapLocations}
                        className="p-1 rounded-full hover:bg-neutral-200 text-neutral-500 cursor-pointer shrink-0"
                        title="Swap locations"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* DEPARTURE */}
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40 focus-within:border-[#073D36] transition-colors">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      DEPARTURE
                    </label>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                      <input
                        type="date"
                        value={flightDeparture}
                        onChange={(e) => setFlightDeparture(e.target.value)}
                        className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* TRAVELLERS & CLASS */}
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40 focus-within:border-[#073D36] transition-colors">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      TRAVELLERS & CLASS
                    </label>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-neutral-400 shrink-0" />
                      <select
                        value={flightTravellers}
                        onChange={(e) => setFlightTravellers(e.target.value)}
                        className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                      >
                        <option value="1 Traveller · Economy">1 Traveller · Economy</option>
                        <option value="2 Travellers · Economy">2 Travellers · Economy</option>
                        <option value="3 Travellers · Economy">3 Travellers · Economy</option>
                        <option value="1 Traveller · Premium Economy">1 Traveller · Premium Economy</option>
                        <option value="2 Travellers · Business">2 Travellers · Business</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bottom Row with Direct Only Checkbox & Search Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                  <label className="flex items-center gap-2.5 text-xs sm:text-sm text-neutral-600 font-medium cursor-pointer self-start sm:self-auto">
                    <input
                      type="checkbox"
                      checked={directOnly}
                      onChange={(e) => setDirectOnly(e.target.checked)}
                      className="accent-[#F27658] w-4 h-4 rounded"
                    />
                    <span>Direct routes only</span>
                  </label>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onOpenAI}
                      className="px-4 py-3 rounded-2xl bg-[#073D36]/10 text-[#073D36] font-semibold text-xs sm:text-sm hover:bg-[#073D36]/15 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#F27658]" />
                      <span>Ask AI</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-8 py-3.5 rounded-2xl bg-[#F27658] hover:bg-[#e06547] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TRAINS TAB */}
          {activeTab === 'trains' && (
            <div>
              <div className="mb-4">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E]">
                  Book train tickets
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Vande Bharat, Rajdhani, and Shatabdi routes with verified live availability.
                </p>
              </div>

              <form onSubmit={handleTrainSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      FROM
                    </label>
                    <input
                      type="text"
                      value={trainFrom}
                      onChange={(e) => setTrainFrom(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm sm:text-base text-[#17201E] focus:outline-none"
                    />
                  </div>
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      TO
                    </label>
                    <input
                      type="text"
                      value={trainTo}
                      onChange={(e) => setTrainTo(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm sm:text-base text-[#17201E] focus:outline-none"
                    />
                  </div>
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      JOURNEY DATE
                    </label>
                    <input
                      type="date"
                      value={trainDate}
                      onChange={(e) => setTrainDate(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      CLASS
                    </label>
                    <select
                      value={trainClass}
                      onChange={(e) => setTrainClass(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                    >
                      <option value="All Classes">All Classes</option>
                      <option value="1A">Executive / First AC (1A)</option>
                      <option value="2A">AC 2 Tier (2A)</option>
                      <option value="3A">AC 3 Tier (3A)</option>
                      <option value="CC">AC Chair Car (CC)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#F27658] hover:bg-[#e06547] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search trains</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* BUSES TAB */}
          {activeTab === 'buses' && (
            <div>
              <div className="mb-4">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E]">
                  Book bus tickets
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Volvo Multi-Axle, BharatBenz sleepers, and luxury express coaches.
                </p>
              </div>

              <form onSubmit={handleBusSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      FROM
                    </label>
                    <input
                      type="text"
                      value={busFrom}
                      onChange={(e) => setBusFrom(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm sm:text-base text-[#17201E] focus:outline-none"
                    />
                  </div>
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      TO
                    </label>
                    <input
                      type="text"
                      value={busTo}
                      onChange={(e) => setBusTo(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm sm:text-base text-[#17201E] focus:outline-none"
                    />
                  </div>
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      TRAVEL DATE
                    </label>
                    <input
                      type="date"
                      value={busDate}
                      onChange={(e) => setBusDate(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#F27658] hover:bg-[#e06547] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search buses</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* HOTELS TAB */}
          {activeTab === 'hotels' && (
            <div>
              <div className="mb-4">
                <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#17201E]">
                  Find a luxury stay
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                  Over 50 handpicked heritage palaces, beachfront resorts, and boutique city hotels.
                </p>
              </div>

              <form onSubmit={handleHotelSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      DESTINATION / CITY
                    </label>
                    <select
                      value={hotelDestination}
                      onChange={(e) => setHotelDestination(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm sm:text-base text-[#17201E] focus:outline-none cursor-pointer"
                    >
                      <option value="">All Destinations (India)</option>
                      {INDIAN_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}, {c.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      CHECK-IN
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      CHECK-OUT
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                    />
                  </div>

                  <div className="border border-[#EFE7DB] rounded-2xl p-3 bg-[#FAF6F0]/40">
                    <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">
                      GUESTS
                    </label>
                    <select
                      value={hotelGuests}
                      onChange={(e) => setHotelGuests(e.target.value)}
                      className="w-full bg-transparent font-semibold text-sm text-[#17201E] focus:outline-none cursor-pointer"
                    >
                      <option value="1 Guest · 1 Room">1 Guest · 1 Room</option>
                      <option value="2 Guests · 1 Room">2 Guests · 1 Room</option>
                      <option value="3 Guests · 1 Room">3 Guests · 1 Room</option>
                      <option value="4 Guests · 2 Rooms">4 Guests · 2 Rooms</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#F27658] hover:bg-[#e06547] text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search stays</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Micro Assurance Badge matching video */}
          <div className="mt-4 pt-3 border-t border-[#EFE7DB] flex items-center gap-2 text-xs text-neutral-500">
            <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
              ✓
            </span>
            <span>
              Every result shows transparent pricing, cancellation terms and verified partner details.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
