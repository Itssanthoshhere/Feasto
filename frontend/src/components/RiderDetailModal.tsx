import { useState } from "react";
import {
  BiX,
  BiIdCard,
  BiCar,
  BiWallet,
  BiPackage,
  BiShow,
  BiHide,
} from "react-icons/bi";

const RiderDetailModal = ({
  rider,
  onClose,
}: {
  rider: any;
  onClose: () => void;
}) => {
  const [showPII, setShowPII] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header with avatar */}
        <div className="relative px-6 pt-5 pb-6 shrink-0 bg-gradient-to-br from-orange-400 to-amber-500">
          <button
            onClick={onClose}
            className="absolute z-10 p-2 text-white transition-colors rounded-full top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md"
          >
            <BiX size={24} />
          </button>

          <div className="flex items-end gap-4 mt-8">
            <img
              src={rider.picture}
              className="object-cover w-20 h-20 border-4 border-white rounded-full shadow-lg shrink-0"
              alt="Rider profile"
            />
            <div className="pb-1">
              <h2 className="text-2xl font-black text-white drop-shadow-sm">
                {rider.phoneNumber}
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full backdrop-blur-sm ${rider.isVerified ? "bg-white/30 text-white" : "bg-white/30 text-white"}`}
                >
                  {rider.isVerified ? "✓ Verified" : "⏳ Pending"}
                </span>
                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full backdrop-blur-sm ${rider.isAvailble ? "bg-white/30 text-white" : "bg-white/20 text-white/80"}`}
                >
                  {rider.isAvailble ? "● Online" : "○ Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-1 text-slate-500">
                <BiWallet size={18} className="text-emerald-500" />
                <span className="text-sm font-semibold">Total Earnings</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                ₹{rider.totalEarnings || 0}
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
              <div className="flex items-center gap-2 mb-1 text-slate-500">
                <BiPackage size={18} className="text-blue-500" />
                <span className="text-sm font-semibold">Total Deliveries</span>
              </div>
              <p className="text-2xl font-black text-slate-900">
                {rider.totalDeliveries || 0}
              </p>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              Verification Documents
            </h3>

            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] space-y-4 relative">
              <button
                onClick={() => setShowPII(!showPII)}
                className="absolute transition-colors top-4 right-4 text-slate-400 hover:text-slate-600"
                title={showPII ? "Hide Details" : "Show Details"}
                aria-label={showPII ? "Hide Details" : "Show Details"}
                aria-pressed={showPII}
              >
                {showPII ? <BiHide size={20} /> : <BiShow size={20} />}
              </button>
              <div className="flex flex-col gap-1 pr-8">
                <div className="flex items-center gap-2 font-semibold text-slate-600">
                  <BiIdCard size={20} className="text-orange-500" /> Aadhaar
                  Number
                </div>
                <p className="text-lg font-medium tracking-wider text-slate-900 pl-7">
                  {rider.aadhaarNumber || rider.aadharNumber ? (
                    showPII ? (
                      rider.aadhaarNumber || rider.aadharNumber
                    ) : (
                      "•••• •••• " +
                      String(rider.aadhaarNumber || rider.aadharNumber).slice(
                        -4,
                      )
                    )
                  ) : (
                    <span className="text-sm font-normal text-slate-400 italic">
                      Not provided
                    </span>
                  )}
                </p>
              </div>

              <div className="w-full h-px bg-slate-100" />

              <div className="flex flex-col gap-1 pr-8">
                <div className="flex items-center gap-2 font-semibold text-slate-600">
                  <BiCar size={20} className="text-blue-500" /> Driving License
                </div>
                <p className="text-lg font-medium tracking-wider text-slate-900 pl-7">
                  {rider.drivingLicenseNumber ? (
                    showPII ? (
                      rider.drivingLicenseNumber
                    ) : (
                      "••••••••" + String(rider.drivingLicenseNumber).slice(-4)
                    )
                  ) : (
                    <span className="text-sm font-normal text-slate-400 italic">
                      Not provided
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderDetailModal;
