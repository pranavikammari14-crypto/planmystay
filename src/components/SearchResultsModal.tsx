import React from 'react';
import { Plane, Train, Bus, X, ArrowRight, Check, Clock, Calendar } from 'lucide-react';
import { Flight, Train as TrainType, Bus as BusType } from '../types/travel';
import { FLIGHTS_DATA, TRAINS_DATA, BUSES_DATA } from '../data/travelOptions';

interface SearchResultsModalProps {
  type: 'flights' | 'trains' | 'buses' | null;
  params: any;
  isOpen: boolean;
  onClose: () => void;
  onSelectOption: (title: string, price: number) => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  type,
  params,
  isOpen,
  onClose,
  onSelectOption,
}) => {
  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EFE7DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {type === 'flights' && <Plane className="w-5 h-5 text-[#F27658]" />}
            {type === 'trains' && <Train className="w-5 h-5 text-[#F27658]" />}
            {type === 'buses' && <Bus className="w-5 h-5 text-[#F27658]" />}
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#17201E]">
                {type === 'flights' && `Flights: ${params?.from || 'Hyderabad'} → ${params?.to || 'Mumbai'}`}
                {type === 'trains' && `Trains: ${params?.from || 'Secunderabad'} → ${params?.to || 'Mumbai'}`}
                {type === 'buses' && `Buses: ${params?.from || 'Hyderabad'} → ${params?.to || 'Mumbai'}`}
              </h3>
              <p className="text-xs text-neutral-500">
                Verified live schedules & real-time seat availability
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {type === 'flights' &&
            FLIGHTS_DATA.map((flight) => (
              <div
                key={flight.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm hover:border-[#073D36] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#17201E]">
                      {flight.airline}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      {flight.flightNumber}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Non-stop
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#17201E] pt-1">
                    <span>{flight.departureTime} ({flight.fromCode})</span>
                    <span className="text-neutral-400">→</span>
                    <span>{flight.arrivalTime} ({flight.toCode})</span>
                    <span className="text-xs text-neutral-400 font-normal">({flight.duration})</span>
                  </div>

                  <div className="text-[11px] text-neutral-500 font-light">
                    Includes 15 kg check-in + 7 kg cabin baggage · {flight.cabin}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100 gap-2">
                  <div className="text-left sm:text-right">
                    <div className="font-serif font-bold text-xl text-[#073D36] tabular-nums">
                      ₹{flight.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-neutral-400">per traveller</div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectOption(`${flight.airline} ${flight.flightNumber}`, flight.price);
                      onClose();
                    }}
                    className="px-5 py-2 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Select Flight
                  </button>
                </div>
              </div>
            ))}

          {type === 'trains' &&
            TRAINS_DATA.map((train) => (
              <div
                key={train.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm hover:border-[#073D36] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#17201E]">
                      {train.trainName}
                    </span>
                    <span className="text-xs font-mono text-neutral-400">
                      #{train.trainNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#17201E] pt-1">
                    <span>{train.departureTime}</span>
                    <span className="text-neutral-400">→</span>
                    <span>{train.arrivalTime}</span>
                    <span className="text-xs text-neutral-400 font-normal">({train.duration})</span>
                  </div>

                  {/* Classes */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {train.classes.map((cls) => (
                      <span
                        key={cls.code}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-[#FAF6F0] border border-[#EFE7DB] text-neutral-700"
                      >
                        {cls.code}: ₹{cls.price.toLocaleString('en-IN')} (Available)
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100 gap-2">
                  <div className="text-left sm:text-right">
                    <div className="font-serif font-bold text-xl text-[#073D36] tabular-nums">
                      ₹{train.classes[0].price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-neutral-400">Starting from</div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectOption(`${train.trainName} (#${train.trainNumber})`, train.classes[0].price);
                      onClose();
                    }}
                    className="px-5 py-2 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Book Train
                  </button>
                </div>
              </div>
            ))}

          {type === 'buses' &&
            BUSES_DATA.map((bus) => (
              <div
                key={bus.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm hover:border-[#073D36] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#17201E]">
                      {bus.operator}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                      ★ {bus.rating}
                    </span>
                  </div>

                  <div className="text-xs text-neutral-500 font-light">
                    {bus.busType} · {bus.seatsLeft} seats left
                  </div>

                  <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold text-[#17201E] pt-1">
                    <span>{bus.departureTime}</span>
                    <span className="text-neutral-400">→</span>
                    <span>{bus.arrivalTime}</span>
                    <span className="text-xs text-neutral-400 font-normal">({bus.duration})</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-neutral-100 gap-2">
                  <div className="text-left sm:text-right">
                    <div className="font-serif font-bold text-xl text-[#073D36] tabular-nums">
                      ₹{bus.price.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-neutral-400">per seat</div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectOption(`${bus.operator} Bus`, bus.price);
                      onClose();
                    }}
                    className="px-5 py-2 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white text-xs font-semibold shadow-sm cursor-pointer"
                  >
                    Select Bus
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
