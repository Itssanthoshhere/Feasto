import axios from "axios";
import type { IOrder } from "../types";
import { riderService } from "../main";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  BiStore,
  BiMap,
  BiPhoneCall,
  BiCheckCircle,
  BiCurrentLocation,
} from "react-icons/bi";

interface Props {
  order: IOrder;
  onStatusUpdate: () => void;
}

const RiderCurrentOrder = ({ order, onStatusUpdate }: Props) => {
  const [updating, setUpdating] = useState(false);

  const updateStatus = async () => {
    try {
      setUpdating(true);
      await axios.put(
        `${riderService}/api/rider/order/update/${order._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Order status updated");
      onStatusUpdate();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="rounded-3xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden relative">
      {/* ── Header ── */}
      <div className="bg-slate-50 p-5 border-b border-slate-100 flex items-start justify-between">
        <div>
          <h1 className="font-bold text-slate-900 tracking-tight">
            Active Delivery
          </h1>
          <p className="text-xs font-mono text-slate-500 mt-1">
            #{order._id.slice(-6).toUpperCase()}
          </p>
        </div>
        <div className="bg-green-100 border border-green-200 text-green-700 px-3 py-1.5 rounded-lg flex flex-col items-center shadow-sm">
          <span className="text-[10px] uppercase font-bold tracking-wider">
            Earnings
          </span>
          <span className="font-black text-sm">₹{order.riderAmount}</span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        {/* ── Timeline ── */}
        <div className="relative pl-4 space-y-6">
          {/* Timeline Line */}
          <div className="absolute top-4 bottom-4 left-[11px] w-0.5 bg-slate-200"></div>

          {/* Pickup */}
          <div className="relative flex gap-4 items-start">
            <div className="absolute -left-[14.5px] top-1 w-7 h-7 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-orange-500 shadow-sm z-10">
              <BiStore size={14} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pickup
              </p>
              <p className="font-semibold text-slate-900 leading-tight mt-0.5">
                {order.restaurantName}
              </p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="relative flex gap-4 items-start">
            <div className="absolute -left-[14.5px] top-1 w-7 h-7 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-blue-500 shadow-sm z-10">
              <BiMap size={14} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Dropoff
              </p>
              <p className="font-medium text-slate-700 text-sm leading-tight mt-0.5">
                {order.deliveryAddress.formattedAddress}
              </p>
            </div>
          </div>
        </div>

        {/* ── Customer Contact ── */}
        {order.deliveryAddress.mobile && (
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 border border-slate-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <BiPhoneCall size={20} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customer
                </p>
                <p className="font-bold text-slate-900">
                  {order.deliveryAddress.mobile}
                </p>
              </div>
            </div>
            <a
              href={`tel:${order.deliveryAddress.mobile}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition"
            >
              Call
            </a>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="pt-2">
          {order.status === "rider_assigned" && (
            <button
              onClick={updateStatus}
              disabled={updating}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl py-3.5 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {updating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <BiCurrentLocation size={20} />
              )}
              {updating ? "Updating..." : "Reached Restaurant"}
            </button>
          )}

          {order.status === "picked_up" && (
            <button
              onClick={updateStatus}
              disabled={updating}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl py-3.5 font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            >
              {updating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <BiCheckCircle size={20} />
              )}
              {updating ? "Updating..." : "Mark as Delivered"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderCurrentOrder;
