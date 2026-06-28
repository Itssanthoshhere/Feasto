import { useEffect, useState } from "react";
import { riderService } from "../main";
import axios from "axios";
import toast from "react-hot-toast";
import { BiTimer, BiPackage } from "react-icons/bi";

interface Props {
  orderId: string;
  onAccepted: () => void;
}

const RiderOrderRequest = ({ orderId, onAccepted }: Props) => {
  const [accepting, setAccepting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onAccepted();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAccepted]);

  const acceptOrder = async () => {
    try {
      setAccepting(true);
      await axios.post(
        `${riderService}/api/rider/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Order Accepted");
      onAccepted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept");
      onAccepted();
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="relative rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-green-100 overflow-hidden transform transition-all hover:-translate-y-1">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 opacity-5 rounded-full -mr-10 -mt-10 blur-2xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
          <BiPackage size={16} className="animate-bounce" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            New Request
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100 font-mono text-sm">
          <BiTimer size={16} />
          <span className="font-bold">{secondsLeft}s</span>
        </div>
      </div>

      <div className="space-y-1 relative z-10 mt-2">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Order ID
        </p>
        <p className="text-2xl font-black text-slate-900 font-mono tracking-tight">
          #{orderId.slice(-6).toUpperCase()}
        </p>
      </div>

      <button
        disabled={accepting}
        onClick={acceptOrder}
        className="mt-6 w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:shadow-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-70 disabled:cursor-wait transition-all relative z-10 flex justify-center items-center gap-2"
      >
        {accepting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Accepting...
          </>
        ) : (
          "Accept Order"
        )}
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-linear"
          style={{ width: `${(secondsLeft / 10) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default RiderOrderRequest;
