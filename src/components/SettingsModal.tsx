import React, { useState } from 'react';
import { UserProfile } from '../types/travel';
import { Settings, X, Save, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone || '+91 98490 12345');
  const [mealPref, setMealPref] = useState(user.preferences?.mealPref || 'North Indian & Continental');
  const [seatPref, setSeatPref] = useState(user.preferences?.seatPref || 'Window / Lower Berth');
  const [hotelClass, setHotelClass] = useState(user.preferences?.hotelClass || '5-Star Luxury & Heritage');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      phone,
      preferences: {
        mealPref,
        seatPref,
        hotelClass,
      },
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EFE7DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#073D36]" />
            <h3 className="font-serif font-bold text-xl text-[#17201E]">
              Account Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="bg-white p-4 rounded-2xl border border-[#EFE7DB] space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#073D36]">
              Personal Details
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full p-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-[#EFE7DB] space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#073D36]">
              Travel & Concierge Preferences
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Dining & Meal Preference
              </label>
              <input
                type="text"
                value={mealPref}
                onChange={(e) => setMealPref(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Flight / Train Seat Preference
              </label>
              <input
                type="text"
                value={seatPref}
                onChange={(e) => setSeatPref(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Preferred Stay Category
              </label>
              <input
                type="text"
                value={hotelClass}
                onChange={(e) => setHotelClass(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-sm font-medium focus:outline-none focus:border-[#073D36]"
              />
            </div>
          </div>

          {saved && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-neutral-300 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#073D36] text-white text-xs font-semibold hover:bg-[#062F2B] flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
