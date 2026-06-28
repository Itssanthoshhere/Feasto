import { useState, useEffect } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { ORDER_ACTIONS } from "../utils/overflow";

interface Props {
  order: IOrder;
  onStatusUpdate?: () => void;
}

const STATUS_META: Record<
  string,
  {
    label: string;
    icon: string;
    accent: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
  placed: {
    label: "New Order",
    icon: "🔔",
    accent: "from-amber-400 to-orange-400",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  accepted: {
    label: "Accepted",
    icon: "✅",
    accent: "from-emerald-400 to-teal-400",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  preparing: {
    label: "Preparing",
    icon: "👨‍🍳",
    accent: "from-blue-400 to-cyan-400",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  ready_for_rider: {
    label: "Ready",
    icon: "📦",
    accent: "from-indigo-400 to-violet-400",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
  },
  rider_assigned: {
    label: "Rider Assigned",
    icon: "🏍️",
    accent: "from-violet-400 to-purple-400",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
  },
  picked_up: {
    label: "Picked Up",
    icon: "🚀",
    accent: "from-purple-400 to-pink-400",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  delivered: {
    label: "Delivered",
    icon: "🎉",
    accent: "from-green-400 to-emerald-400",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  cancelled: {
    label: "Cancelled",
    icon: "❌",
    accent: "from-red-400 to-rose-400",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
};

const ACTION_META: Record<string, { label: string; icon: string }> = {
  accepted: { label: "Accept", icon: "✓" },
  preparing: { label: "Start Preparing", icon: "🍳" },
  ready_for_rider: { label: "Mark Ready", icon: "📦" },
};

const OrderCard = ({ order, onStatusUpdate }: Props) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [retryVisible, setRetryVisible] = useState(false);

  useEffect(() => {
    if (order.status !== "ready_for_rider" || loading) {
      setRetryVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setRetryVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [order.status, loading]);

  const actions = ORDER_ACTIONS[order.status] || [];
  const meta = STATUS_META[order.status] || STATUS_META.placed;
  const isNew = order.status === "placed";

  const updateStatus = async (status: string) => {
    try {
      setLoading(true);
      setRetryVisible(false);

      await axios.put(
        `${restaurantService}/api/order/${order._id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success("Order updated");
      onStatusUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  };

  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div
      className={`group relative rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-md ${
        isNew
          ? "border-amber-200 bg-amber-50/30 shadow-sm shadow-amber-100/50"
          : "border-slate-200 bg-white"
      }`}
    >
      {/* Accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${meta.accent}`} />

      <div className="p-4 space-y-3">
        {/* ── Row 1: Order ID + Status Badge ── */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              {isNew && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              )}
              <span className="text-sm font-bold text-gray-900 font-mono tracking-tight">
                #{order._id.slice(-6).toUpperCase()}
              </span>
              <span className="text-[11px] text-gray-400 font-medium">
                {timeAgo(order.createdAt)}
              </span>
            </div>
          </div>

          <span
            className={`shrink-0 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold border ${meta.bg} ${meta.text} ${meta.border}`}
          >
            {meta.icon} {meta.label}
          </span>
        </div>

        {/* ── Row 2: Items ── */}
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {totalQty} item{totalQty > 1 ? "s" : ""}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-gray-300 transition-transform duration-200 ${
                expanded ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {expanded ? (
            <div className="mt-2 space-y-1">
              {order.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-[#FF5A1F]/10 text-[10px] font-bold text-[#FF5A1F]">
                      {item.quantity}
                    </span>
                    <span className="text-gray-700 font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs font-medium">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-[13px] text-gray-500 line-clamp-1">
              {order.items
                .map((item) => `${item.name} × ${item.quantity}`)
                .join(" · ")}
            </p>
          )}
        </div>

        {/* ── Row 3: Price + Payment ── */}
        <div className="flex items-center justify-between pt-1 border-t border-dashed border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold text-gray-900">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </span>
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                order.paymentStatus === "paid"
                  ? "bg-emerald-50 text-emerald-600"
                  : order.paymentStatus === "failed"
                    ? "bg-red-50 text-red-600"
                    : "bg-amber-50 text-amber-600"
              }`}
            >
              {order.paymentStatus === "paid"
                ? "✓ PAID"
                : order.paymentStatus === "failed"
                  ? "✗ FAILED"
                  : "⏳ PENDING"}
            </span>
          </div>

          {order.deliveryAddress && (
            <span
              className="text-[11px] text-gray-400 max-w-[120px] truncate"
              title={order.deliveryAddress.formattedAddress}
            >
              📍 {order.deliveryAddress.formattedAddress.split(",")[0]}
            </span>
          )}
        </div>

        {/* ── Row 4: Customer Info ── */}
        {order.deliveryAddress?.mobile && (
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span>📞 {order.deliveryAddress.mobile}</span>
            {order.riderName && (
              <>
                <span className="text-gray-200">|</span>
                <span>🏍️ {order.riderName}</span>
              </>
            )}
          </div>
        )}

        {/* ── Action Buttons ── */}
        {order.paymentStatus === "paid" && actions.length > 0 && (
          <div className="flex gap-2 pt-1">
            {actions.map((status) => {
              const actionMeta = ACTION_META[status];
              return (
                <button
                  key={status}
                  disabled={loading}
                  onClick={() => updateStatus(status)}
                  className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[13px] font-bold transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${
                    loading
                      ? "bg-gray-100 text-gray-400"
                      : isNew
                        ? "bg-gradient-to-r from-[#FF5A1F] to-[#e14b14] text-white shadow-md shadow-[#FF5A1F]/25 hover:shadow-lg hover:shadow-[#FF5A1F]/30 hover:-translate-y-0.5"
                        : "bg-gray-900 text-white hover:bg-gray-800 hover:-translate-y-0.5"
                  }`}
                >
                  {loading ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <>
                      <span className="text-xs">{actionMeta?.icon ?? "→"}</span>
                      {actionMeta?.label ?? status.replaceAll("_", " ")}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {order.status === "ready_for_rider" && retryVisible && (
          <div className="pt-2">
            <button
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-[#FF5A1F] bg-transparent py-2.5 text-[13px] font-bold text-[#FF5A1F] transition-all duration-200 hover:bg-[#FF5A1F]/5 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={() => updateStatus("ready_for_rider")}
            >
              {loading ? (
                "🔁"
              ) : (
                <>
                  <span className="text-xs">🔄</span>
                  Retry Ready for Rider
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
