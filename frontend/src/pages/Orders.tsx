import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService } from "../main";
import { BiChevronRight } from "react-icons/bi";
import {
  ACTIVE_STATUSES,
  STATUS_FLOW,
  STATUS_META,
} from "../config/orderConstants";

type TabKey = "active" | "completed";

const Orders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { fetchCart } = useAppData();

  const fetchOrders = async () => {
    try {
      setError(null);
      const { data } = await axios.get(
        `${restaurantService}/api/order/myorder`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setOrders(data.orders || []);
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to fetch orders");
      } else {
        setError("Failed to fetch orders");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrders();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status),
  );

  const handleReorder = async (orderId: string) => {
    try {
      setLoading(true);
      await axios.post(
        `${restaurantService}/api/cart/reorder`,
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      await fetchCart();
      navigate("/cart");
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.message || "Failed to reorder");
      } else {
        alert("Failed to reorder");
      }
      setLoading(false);
    }
  };

  const tabs: { key: TabKey; label: string; count: number; icon: string }[] = [
    { key: "active", label: "Active", count: activeOrders.length, icon: "🔴" },
    {
      key: "completed",
      label: "Past Orders",
      count: completedOrders.length,
      icon: "✅",
    },
  ];

  const displayedOrders =
    activeTab === "active" ? activeOrders : completedOrders;

  const totalSpent = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Header Bar ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-5xl px-4 py-5 mx-auto sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">
                My Orders
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                Track your orders in real-time
              </p>
            </div>

            {/* Live indicator */}
            {activeOrders.length > 0 && (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400" />
                  <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-semibold text-emerald-700">
                  {activeOrders.length} Live
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl px-4 py-5 mx-auto space-y-5 sm:px-6">
        {/* ── Stats Strip ── */}
        {!loading && orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Active",
                value: activeOrders.length.toString(),
                color: "text-[#FF5A1F]",
                bg: "bg-orange-50",
                border: "border-orange-100",
                hasLive: activeOrders.length > 0,
              },
              {
                label: "Total Orders",
                value: orders.length.toString(),
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
                hasLive: false,
              },
              {
                label: "Total Spent",
                value: `₹${totalSpent.toLocaleString("en-IN")}`,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-100",
                hasLive: false,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className={`${stat.bg} border ${stat.border} rounded-2xl px-4 py-3 flex flex-col`}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {stat.label}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-lg font-extrabold ${stat.color}`}>
                    {stat.value}
                  </span>
                  {stat.hasLive && (
                    <span className="relative flex w-2 h-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-40" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5A1F]" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.03)] overflow-hidden">
          <div className="flex border-b border-slate-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-bold transition-all ${
                  activeTab === tab.key
                    ? "border-b-2 border-[#FF5A1F] text-[#FF5A1F] bg-[#FF5A1F]/5"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 rounded-full px-1.5 text-[10px] font-bold ${
                    activeTab === tab.key
                      ? "bg-[#FF5A1F] text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl bg-gray-50 h-28"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <div className="flex items-center justify-center w-16 h-16 text-3xl rounded-full bg-red-50">
                  ⚠️
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  Failed to load orders
                </h2>
                <p className="max-w-sm text-slate-500">{error}</p>
                <button
                  onClick={fetchOrders}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
                >
                  Try Again
                </button>
              </div>
            ) : displayedOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex items-center justify-center w-16 h-16 mb-4 border border-gray-100 rounded-2xl bg-gray-50">
                  <span className="text-2xl">
                    {activeTab === "active" ? "🍽️" : "📦"}
                  </span>
                </div>
                <p className="mb-1 text-sm font-bold text-gray-700">
                  {activeTab === "active"
                    ? "No active orders"
                    : "No past orders yet"}
                </p>
                <p className="text-xs text-gray-400 max-w-[260px]">
                  {activeTab === "active"
                    ? "When you place an order, it will show up here with live tracking."
                    : "Your delivered and completed orders will appear here."}
                </p>
                {activeTab === "active" && (
                  <button
                    onClick={() => navigate("/")}
                    className="mt-5 rounded-xl bg-gradient-to-r from-[#FF5A1F] to-[#e14b14] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF5A1F]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#FF5A1F]/30 active:scale-[0.97]"
                  >
                    Browse Restaurants
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {displayedOrders.map((order) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    onClick={() => navigate(`/order/${order._id}`)}
                    onReorder={() => handleReorder(order._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;

/* ─────────── Order Row Card ─────────── */

const OrderRow = ({
  order,
  onClick,
  onReorder,
}: {
  order: IOrder;
  onClick: () => void;
  onReorder: () => void;
}) => {
  const meta = STATUS_META[order.status] || STATUS_META.placed;
  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const isActive = ACTIVE_STATUSES.includes(order.status);

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

  const itemsSummary = order.items
    .slice(0, 3)
    .map((item) => item.name)
    .join(", ");

  const moreCount = order.items.length > 3 ? order.items.length - 3 : 0;

  return (
    <button
      className={`w-full text-left group rounded-xl border overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2 ${
        isActive ? `${meta.border} bg-white` : "border-gray-100 bg-gray-50/50"
      }`}
      onClick={onClick}
    >
      {/* Accent */}
      {isActive && (
        <div className={`h-0.5 w-full bg-gradient-to-r ${meta.accent}`} />
      )}

      <div className="flex flex-col gap-4 p-5 sm:p-6 sm:flex-row sm:items-center">
        {/* Left icon */}
        <div
          className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xl ${meta.bg} border ${meta.border}`}
        >
          {meta.icon}
        </div>

        {/* Center content */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Row 1: Restaurant + time */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-base font-bold text-gray-900 truncate">
              {order.restaurantName}
            </span>
            <span className="shrink-0 text-[11px] text-gray-400 font-medium">
              {timeAgo(order.createdAt)}
            </span>
          </div>

          {/* Row 2: Items */}
          <p className="text-xs text-gray-500 truncate">
            {totalQty} item{totalQty > 1 ? "s" : ""} · {itemsSummary}
            {moreCount > 0 && (
              <span className="text-gray-400"> +{moreCount} more</span>
            )}
          </p>

          {/* Row 3: Progress (active) or status + price */}
          <div className="flex items-center gap-3">
            {isActive ? (
              <>
                {/* Mini progress bar */}
                <div className="flex items-center gap-0.5 flex-1 max-w-[120px]">
                  {STATUS_FLOW.slice(0, 6).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i <= currentStepIndex
                          ? `bg-gradient-to-r ${meta.accent}`
                          : "bg-gray-100"
                      }`}
                    />
                  ))}
                </div>

                {/* Status label */}
                <span className={`text-[11px] font-bold ${meta.text}`}>
                  {meta.label}
                </span>
              </>
            ) : (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${meta.bg} ${meta.text}`}
              >
                {meta.icon} {meta.label}
              </span>
            )}

            <span className="ml-auto text-base font-extrabold text-gray-900">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </span>
          </div>

          {/* Rider strip */}
          {order.riderName && isActive && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span>🏍️</span>
              <span className="font-semibold text-violet-700">
                {order.riderName}
              </span>
              {order.riderPhone && (
                <>
                  <span className="text-gray-200">·</span>
                  <span className="text-violet-500">📞 {order.riderPhone}</span>
                </>
              )}
            </div>
          )}

          {/* Reorder Button */}
          {!isActive && (
            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReorder();
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-[#FF5A1F] hover:text-white transition-colors"
              >
                Reorder
              </button>
            </div>
          )}
        </div>

        {/* Right arrow */}
        <BiChevronRight
          className="shrink-0 text-gray-300 group-hover:text-[#FF5A1F] group-hover:translate-x-0.5 transition-all"
          size={20}
        />
      </div>
    </button>
  );
};
