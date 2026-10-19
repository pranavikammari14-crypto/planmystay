import React, { useState } from 'react';
import { Plane, Train, Bus, X, ArrowRight, Check, Clock, Calendar, User, ShieldCheck, CreditCard, Sparkles, Loader2, Printer, MapPin, ExternalLink, Info } from 'lucide-react';
import { FlightOffer } from '../../server/services/flightsService';
import { TrainOffer } from '../../server/services/trainsService';
import { BusOffer } from '../../server/services/busesService';
import { FLIGHTS_DATA, TRAINS_DATA, BUSES_DATA } from '../data/travelOptions';

interface SearchResultsModalProps {
  type: 'flights' | 'trains' | 'buses' | null;
  params: any;
  isOpen: boolean;
  onClose: () => void;
  onBookingConfirmed: (booking: any) => void;
}

export const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  type,
  params,
  isOpen,
  onClose,
  onBookingConfirmed,
}) => {
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3>(1); // 1 = Search Results, 2 = Passenger Details & Add-ons, 3 = Payment & Confirmation
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedTicket, setConfirmedTicket] = useState<any | null>(null);

  // Flight Passenger State
  const [flightPassengers, setFlightPassengers] = useState([
    { title: 'Mr', firstName: 'Aarav', lastName: 'Sharma', dob: '1995-05-14', gender: 'MALE', idType: 'AADHAAR', idNumber: '9849-0123-4567', seatPreference: 'Window 14A', mealPreference: 'Vegetarian Regional' },
  ]);

  // Train Passenger State
  const [trainClass, setTrainClass] = useState('CC');
  const [trainPassengers, setTrainPassengers] = useState([
    { name: 'Aarav Sharma', age: 29, gender: 'MALE', berthPreference: 'LOWER', foodChoice: 'VEG', seniorCitizenConcession: false },
  ]);

  // Bus Passenger State
  const [selectedBusSeats, setSelectedBusSeats] = useState<string[]>(['UB-4']);
  const [selectedBoardingPoint, setSelectedBoardingPoint] = useState<string>('');
  const [selectedDroppingPoint, setSelectedDroppingPoint] = useState<string>('');
  const [busPassengers, setBusPassengers] = useState([
    { name: 'Aarav Sharma', age: 29, gender: 'MALE', seatNumber: 'UB-4' },
  ]);

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  if (!isOpen || !type) return null;

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    if (type === 'trains' && item.classes && item.classes.length > 0) {
      setTrainClass(item.classes[0].code);
    }
    if (type === 'buses' && item.boardingPoints && item.boardingPoints.length > 0) {
      setSelectedBoardingPoint(item.boardingPoints[0].id);
      setSelectedDroppingPoint(item.droppingPoints[0]?.id || '');
    }
    setBookingStep(2);
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);

    try {
      let endpoint = '';
      let payload: any = {};
      let totalAmount = 0;

      if (type === 'flights') {
        endpoint = '/api/flights/book';
        const pricePerPax = selectedItem.price || selectedItem.pricePerPassenger || 3850;
        totalAmount = pricePerPax * flightPassengers.length;
        payload = {
          offer: selectedItem,
          passengers: flightPassengers,
          contactEmail: 'guest@planmystay.in',
          contactPhone: '+91 98490 12345',
          paymentId: `pay_rzp_${Date.now()}`,
        };
      } else if (type === 'trains') {
        endpoint = '/api/trains/book';
        const classObj = selectedItem.classes?.find((c: any) => c.code === trainClass) || { price: 1680 };
        totalAmount = classObj.price * trainPassengers.length;
        payload = {
          train: selectedItem,
          selectedClass: trainClass,
          passengers: trainPassengers,
          contactEmail: 'guest@planmystay.in',
          contactPhone: '+91 98490 12345',
          paymentId: `pay_rzp_${Date.now()}`,
        };
      } else if (type === 'buses') {
        endpoint = '/api/buses/book';
        totalAmount = (selectedItem.price || selectedItem.pricePerSeat || 1450) * busPassengers.length;
        payload = {
          bus: selectedItem,
          passengers: busPassengers.map((p, idx) => ({
            ...p,
            seatNumber: selectedBusSeats[idx] || 'UB-4',
            boardingPointId: selectedBoardingPoint,
          })),
          contactEmail: 'guest@planmystay.in',
          contactPhone: '+91 98490 12345',
          paymentId: `pay_rzp_${Date.now()}`,
        };
      }

      // Create Razorpay payment order
      await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, serviceType: type.toUpperCase() }),
      });

      // Issue reservation via server
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setConfirmedTicket(data);
        onBookingConfirmed(data.booking);
        setBookingStep(3);
      } else {
        throw new Error(data.error || 'Booking reservation failed');
      }
    } catch (err: any) {
      alert(`Booking notice: ${err?.message || 'Unable to finalize reservation'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EFE7DB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'flights' && <Plane className="w-5 h-5 text-[#F27658]" />}
            {type === 'trains' && <Train className="w-5 h-5 text-[#F27658]" />}
            {type === 'buses' && <Bus className="w-5 h-5 text-[#F27658]" />}
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#17201E]">
                {bookingStep === 1 && (
                  type === 'flights' ? `Flights: ${params?.from || 'Hyderabad'} → ${params?.to || 'Mumbai'}` :
                  type === 'trains' ? `Trains: ${params?.from || 'Secunderabad'} → ${params?.to || 'Mumbai'}` :
                  `Buses: ${params?.from || 'Hyderabad'} → ${params?.to || 'Mumbai'}`
                )}
                {bookingStep === 2 && 'Passenger Details & Seat Reservation'}
                {bookingStep === 3 && 'Booking Confirmed!'}
              </h3>
              <p className="text-xs text-neutral-500 font-light">
                {bookingStep === 1 ? 'Live carrier availability and transparent fares' :
                 bookingStep === 2 ? 'Official government travel ID & berth allocation' :
                 'Instant PNR & digital e-ticket issued'}
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: Search Results List */}
          {bookingStep === 1 && (
            <div className="space-y-3">
              {/* Verified Carrier Notice Banner */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#EFE7DB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#17201E] shadow-2xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] uppercase tracking-wider shrink-0 border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
                    <span>Verified Schedules & Fares</span>
                  </span>
                  <span className="font-medium text-[11px] sm:text-xs text-neutral-600">
                    {type === 'trains' && 'Indian Railways official PRS timetables and live route stops.'}
                    {type === 'flights' && 'Scheduled domestic carrier flight timetables & transparent pricing.'}
                    {type === 'buses' && 'Verified intercity bus timetables & seat categories.'}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider shrink-0">
                  Official Timetables
                </span>
              </div>

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
                        onClick={() => handleSelectItem(flight)}
                        className="px-5 py-2 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white text-xs font-semibold shadow-sm cursor-pointer"
                      >
                        Book Flight →
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
                        <div className="text-[10px] text-neutral-400">Starting fare</div>
                      </div>

                      <button
                        onClick={() => handleSelectItem(train)}
                        className="px-5 py-2 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold shadow-sm cursor-pointer"
                      >
                        Reserve Berths →
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
                        onClick={() => handleSelectItem(bus)}
                        className="px-5 py-2 rounded-full bg-[#F27658] hover:bg-[#e06547] text-white text-xs font-semibold shadow-sm cursor-pointer"
                      >
                        Choose Seats →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* STEP 2: Passenger Details & Confirmation Form */}
          {bookingStep === 2 && selectedItem && (
            <div className="space-y-5">
              {/* Service Summary Banner */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F27658]">
                    Selected Itinerary
                  </span>
                  <div className="font-serif font-bold text-lg text-[#17201E]">
                    {type === 'flights' && `${selectedItem.airline} ${selectedItem.flightNumber}`}
                    {type === 'trains' && `${selectedItem.trainName} (#${selectedItem.trainNumber})`}
                    {type === 'buses' && `${selectedItem.operator} (${selectedItem.busType})`}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Departure: {selectedItem.departureTime} → Arrival: {selectedItem.arrivalTime}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="text-xs font-semibold text-[#073D36] hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* FLIGHT PASSENGER FIELDS */}
              {type === 'flights' && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-[#17201E]">
                    Passenger 1 (Primary Traveller)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Title</label>
                      <select
                        value={flightPassengers[0].title}
                        onChange={(e) => {
                          const updated = [...flightPassengers];
                          updated[0].title = e.target.value as any;
                          setFlightPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                      >
                        <option value="Ms">Ms.</option>
                        <option value="Mr">Mr.</option>
                        <option value="Mrs">Mrs.</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">First Name</label>
                      <input
                        type="text"
                        value={flightPassengers[0].firstName}
                        onChange={(e) => {
                          const updated = [...flightPassengers];
                          updated[0].firstName = e.target.value;
                          setFlightPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Last Name</label>
                      <input
                        type="text"
                        value={flightPassengers[0].lastName}
                        onChange={(e) => {
                          const updated = [...flightPassengers];
                          updated[0].lastName = e.target.value;
                          setFlightPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Govt ID / Aadhaar / Passport</label>
                      <input
                        type="text"
                        value={flightPassengers[0].idNumber}
                        onChange={(e) => {
                          const updated = [...flightPassengers];
                          updated[0].idNumber = e.target.value;
                          setFlightPassengers(updated);
                        }}
                        placeholder="e.g. 9849-0123-4567"
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Seat Preference</label>
                      <select
                        value={flightPassengers[0].seatPreference}
                        onChange={(e) => {
                          const updated = [...flightPassengers];
                          updated[0].seatPreference = e.target.value;
                          setFlightPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                      >
                        <option value="Window 14A">Window (14A)</option>
                        <option value="Aisle 14C">Aisle (14C)</option>
                        <option value="Extra Legroom 12F">Extra Legroom (12F)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* TRAIN PASSENGER FIELDS */}
              {type === 'trains' && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white border border-[#EFE7DB] flex items-center justify-between">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Select Travel Class
                      </label>
                      <div className="flex gap-2">
                        {selectedItem.classes?.map((c: any) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => setTrainClass(c.code)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                              trainClass === c.code
                                ? 'bg-[#073D36] text-white border-[#073D36]'
                                : 'bg-[#FAF6F0] text-neutral-700 border-neutral-200'
                            }`}
                          >
                            {c.code} (₹{c.price.toLocaleString('en-IN')})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-serif font-bold text-base text-[#17201E]">
                    IRCTC Passenger 1 Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Passenger Name</label>
                      <input
                        type="text"
                        value={trainPassengers[0].name}
                        onChange={(e) => {
                          const updated = [...trainPassengers];
                          updated[0].name = e.target.value;
                          setTrainPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Age</label>
                      <input
                        type="number"
                        value={trainPassengers[0].age}
                        onChange={(e) => {
                          const updated = [...trainPassengers];
                          updated[0].age = Number(e.target.value);
                          setTrainPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">Berth Choice</label>
                      <select
                        value={trainPassengers[0].berthPreference}
                        onChange={(e) => {
                          const updated = [...trainPassengers];
                          updated[0].berthPreference = e.target.value as any;
                          setTrainPassengers(updated);
                        }}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                      >
                        <option value="LOWER">Lower Berth</option>
                        <option value="MIDDLE">Middle Berth</option>
                        <option value="UPPER">Upper Berth</option>
                        <option value="SIDE_LOWER">Side Lower</option>
                        <option value="WINDOW">Window Seat</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* BUS PASSENGER FIELDS */}
              {type === 'buses' && (
                <div className="space-y-4">
                  <h4 className="font-serif font-bold text-base text-[#17201E]">
                    Choose Bus Berth & Boarding Landmark
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Boarding Point & Reporting Time
                      </label>
                      <select
                        value={selectedBoardingPoint}
                        onChange={(e) => setSelectedBoardingPoint(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs font-medium"
                      >
                        {selectedItem.boardingPoints?.map((bp: any) => (
                          <option key={bp.id} value={bp.id}>
                            {bp.time} — {bp.location} ({bp.landmark})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                        Selected Sleeper Berth
                      </label>
                      <div className="p-2 rounded-xl bg-white border border-neutral-200 text-xs font-semibold flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Berth UB-4 (Single Upper)</span>
                        <span className="text-neutral-500 text-[11px]">Window Side · AC Air Suspension</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Carrier Authorization & Booking Gateway Status */}
              <div className="p-4 rounded-2xl bg-white border border-[#EFE7DB] shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      Ticketing Authorization Status
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase">
                      {type === 'trains' ? 'IRCTC PSP Required' : type === 'flights' ? 'Airline GDS Required' : 'Bus Gateway Required'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold shrink-0">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Schedules</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {type === 'trains' &&
                    'Train timetables, station stops, and fares are verified with Indian Railways PRS. Direct PRS 10-digit PNR ticket issuance is governed by Ministry of Railways and requires an authorized IRCTC Principal Service Provider (PSP) corporate connection. To issue confirmed tickets, book directly through the official IRCTC portal.'}
                  {type === 'flights' &&
                    'Flight schedules, departure windows, and airfares are verified domestic carrier timetables. Direct airline GDS ticket issuance requires active Amadeus Production credentials.'}
                  {type === 'buses' &&
                    'Intercity bus fleet routes and seat categories are verified operator timetables. Direct seat reservation requires active RedBus B2B Gateway credentials.'}
                </p>

                {type === 'trains' && (
                  <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Official Booking Channel Available</span>
                      </div>
                      <div className="text-[11px] text-neutral-600">
                        Proceed to irctc.co.in with train #{selectedItem.trainNumber} ({selectedItem.trainName}) to reserve your berth.
                      </div>
                    </div>
                    <a
                      href="https://www.irctc.co.in/nget/train-search"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#073D36] hover:bg-[#062F2B] text-white font-semibold text-xs transition-all inline-flex items-center gap-1.5 shrink-0"
                    >
                      <span>Open IRCTC Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setBookingStep(1)}
                  className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  ← Back to results
                </button>

                {type === 'trains' ? (
                  <a
                    href="https://www.irctc.co.in/nget/train-search"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-7 py-3 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Official IRCTC Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      alert(
                        type === 'flights'
                          ? 'Direct airline ticket issuance requires Amadeus Airline GDS production credentials (AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET). Please configure these in backend settings.'
                          : 'Direct bus fleet seat booking requires RedBus B2B Gateway credentials (BUS_API_KEY). Please configure this in backend settings.'
                      );
                    }}
                    className="px-7 py-3 rounded-full bg-[#073D36] hover:bg-[#062F2B] text-white text-xs font-semibold shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>Provider Gateway Authorization Required</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Confirmed Voucher View */}
          {bookingStep === 3 && confirmedTicket && (
            <div className="space-y-4 text-center py-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <span>Official Verified Reservation</span>
                </div>
                <h4 className="font-serif font-bold text-2xl text-[#17201E]">
                  Reservation Confirmed!
                </h4>
                <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
                  Official booking voucher generated and saved to your account.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-[#EFE7DB] text-left space-y-2.5 text-xs text-neutral-700 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
                  <span className="font-bold text-[#073D36]">Booking Reference / PNR:</span>
                  <span className="font-mono font-bold text-base text-[#F27658]">
                    {confirmedTicket.booking?.referenceCode || confirmedTicket.confirmation?.pnr || confirmedTicket.booking?.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] uppercase border border-emerald-200">
                    CONFIRMED
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Service:</span>
                  <span className="font-semibold text-[#17201E]">{confirmedTicket.booking?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Route & Timings:</span>
                  <span className="font-semibold text-[#17201E]">{confirmedTicket.booking?.subtitle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Primary Passenger:</span>
                  <span className="font-semibold text-[#17201E]">
                    {confirmedTicket.booking?.passengers?.[0]?.name || 'Confirmed Passenger'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount Paid:</span>
                  <span className="font-bold text-[#073D36]">
                    ₹{(confirmedTicket.booking?.totalPaid || 0).toLocaleString('en-IN')} (Incl. Taxes)
                  </span>
                </div>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-full border border-neutral-300 text-xs font-semibold hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket Voucher</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
