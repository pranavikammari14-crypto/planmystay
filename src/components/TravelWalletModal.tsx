import React, { useState } from 'react';
import { Wallet, X, Sparkles, Check, ArrowDownLeft, ArrowUpRight, Copy } from 'lucide-react';
import { WalletState } from '../types/travel';

interface TravelWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: WalletState;
}

export const TravelWalletModal: React.FC<TravelWalletModalProps> = ({
  isOpen,
  onClose,
  wallet,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF6F0] rounded-3xl shadow-2xl border border-[#EFE7DB] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#EFE7DB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#073D36]" />
            <h3 className="font-serif font-bold text-xl text-[#17201E]">
              PlanMyStay Travel Wallet
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
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Balance Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#073D36] to-[#062F2B] text-white shadow-lg relative overflow-hidden">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#EFE7DB]/80 mb-1">
              Available Travel Credits
            </div>
            <div className="font-serif font-bold text-4xl tabular-nums mb-3">
              ₹{wallet.balance.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-[#EFE7DB]/80 font-light">
              Automatically applicable on checkout for any hotel or flight in India.
            </div>
          </div>

          {/* Active Promo Coupons */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#17201E] mb-3">
              Active Member Coupons
            </h4>
            <div className="space-y-2.5">
              {wallet.coupons.map((c) => (
                <div
                  key={c.code}
                  className="p-3.5 rounded-2xl bg-white border border-[#EFE7DB] flex items-center justify-between gap-3 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-[#FAF6F0] text-[#073D36] border border-[#EFE7DB]">
                        {c.code}
                      </span>
                      <span className="font-bold text-xs text-[#F27658]">{c.discount}</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1">{c.desc}</div>
                  </div>

                  <button
                    onClick={() => handleCopy(c.code)}
                    className="px-3 py-1.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedCode === c.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Credits History */}
          <div>
            <h4 className="font-serif font-bold text-base text-[#17201E] mb-3">
              Transaction History
            </h4>
            <div className="space-y-2">
              {wallet.credits.map((cr) => (
                <div
                  key={cr.id}
                  className="p-3 rounded-xl bg-white border border-[#EFE7DB] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-[#17201E]">{cr.desc}</div>
                      <div className="text-[10px] text-neutral-400">{cr.date}</div>
                    </div>
                  </div>
                  <div className="font-bold text-emerald-700 tabular-nums">
                    +₹{cr.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
