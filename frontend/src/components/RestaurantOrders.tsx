import { useEffect, useRef, useState } from "react";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import audioOrderRecieve from "../assets/order-recieved.mp3";
import axios from "axios";
import { restaurantService } from "../main";
import OrderCard from "./OrderCard";
import toast from "react-hot-toast";
import { NotificationDropdown } from "./NotificationDropdown";
import { ACTIVE_STATUSES } from "../config/orderConstants";

type FilterKey =
  | "all"
  | "placed"
  | "accepted"
  | "preparing"
  | "ready_for_rider"
  | "completed";

const FILTER_TABS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "all", label: "All Active", icon: "📋" },
  { key: "placed", label: "New", icon: "🔔" },
  { key: "accepted", label: "Accepted", icon: "✅" },
  { key: "preparing", label: "Preparing", icon: "👨‍🍳" },
  { key: "ready_for_rider", label: "Ready for Rider", icon: "📦" },
  { key: "completed", label: "History", icon: "✓" },
];

const RestaurantOrders = ({ restaurantId }: { restaurantId: string }) => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(() => {
    return localStorage.getItem("soundEnabled") === "true";
  });
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [newOrderFlash, setNewOrderFlash] = useState(false);

  const { socket } = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(audioOrderRecieve);
    audioRef.current.load();
  }, []);

  const toggleAudio = () => {
    const newState = !audioUnlocked;
    setAudioUnlocked(newState);
    localStorage.setItem("soundEnabled", String(newState));

    if (newState) {
      toast.success("Sound notifications enabled", { id: "sound-toggle" });
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current!.pause();
            audioRef.current!.currentTime = 0;
          })
          .catch((err) => {
            console.log("Failed to unlock audio: ", err);
          });
      }
    } else {
      toast.success("Sound notifications disabled", { id: "sound-toggle" });
    }
  };

  const fetchOrders = async () => {
    try {
      setError(null);
      const { data } = await axios.get(
        `${restaurantService}/api/order/restaurant/${restaurantId}`,
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
  }, [restaurantId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("joinRestaurantRoom", restaurantId);

    const onOrderEvent = () => {
      console.log("Order event received socket");

      // Flash the new order indicator
      setNewOrderFlash(true);
      setActiveFilter("placed");
      setTimeout(() => setNewOrderFlash(false), 4000);

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((err) => {
          console.error("Audio play failed:", err);
          setAudioUnlocked(false);
          localStorage.setItem("soundEnabled", "false");
          toast.error("Browser blocked audio. Please enable sound again.", {
            id: "audio-block",
          });
        });
      }

      fetchOrders();
    };

    socket.on("order:new", onOrderEvent);
    socket.on("order:update", onOrderEvent);

    return () => {
      socket.off("order:new", onOrderEvent);
      socket.off("order:update", onOrderEvent);
    };
  }, [socket, audioUnlocked, restaurantId]);

  useEffect(() => {
    if (!socket) return;

    const onUpdateOrder = () => {
      fetchOrders();
    };

    socket.on("order:rider_assigned", onUpdateOrder);

    return () => {
      socket.off("order:rider_assigned", onUpdateOrder);
    };
  }, [socket, restaurantId]);

  // Derived data
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter(
    (o) => !ACTIVE_STATUSES.includes(o.status),
  );
  const placedOrders = activeOrders.filter((o) => o.status === "placed");
  const acceptedOrders = activeOrders.filter((o) => o.status === "accepted");
  const preparingOrders = activeOrders.filter((o) => o.status === "preparing");
  const readyOrders = activeOrders.filter((o) =>
    ["ready_for_rider", "rider_assigned", "picked_up"].includes(o.status),
  );

  const countByFilter: Record<FilterKey, number> = {
    all: activeOrders.length,
    placed: placedOrders.length,
    accepted: acceptedOrders.length,
    preparing: preparingOrders.length,
    ready_for_rider: readyOrders.length,
    completed: completedOrders.length,
  };

  const getFilteredOrders = (): IOrder[] => {
    switch (activeFilter) {
      case "placed":
        return placedOrders;
      case "accepted":
        return acceptedOrders;
      case "preparing":
        return preparingOrders;
      case "ready_for_rider":
        return readyOrders;
      case "completed":
        return completedOrders;
      default:
        return activeOrders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Stats
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const avgOrderValue =
    orders.length > 0
      ? Math.round(
          totalRevenue /
            orders.filter((o) => o.paymentStatus === "paid").length,
        ) || 0
      : 0;

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      {/* ── Dashboard Header ── */}
      <div className="border-b border-slate-100 px-6 py-5 sm:px-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF5A1F] to-[#e14b14] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/15">
              <span className="text-white text-lg">🧑‍🍳</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                Order Management
              </h2>
              <p className="text-xs text-gray-400">
                Real-time order tracking & actions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationDropdown
              fetchUrl={`${restaurantService}/api/restaurant/notifications`}
              storageKey="lastViewedRestaurantNotificationId"
            />

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                Live
              </span>
            </div>

            {/* Sound toggle */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                audioUnlocked
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {audioUnlocked ? "🔊 Sound On" : "🔇 Sound Off"}
            </button>
          </div>
        </div>
      </div>

      {/* ── New Order Alert ── */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-out ${
          newOrderFlash ? "max-h-16 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-3 text-white sm:px-8">
          <span className="animate-bounce text-base">🔔</span>
          <p className="font-semibold text-sm">
            New order received! Action required.
          </p>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-slate-100 border-b border-slate-100">
          {[
            {
              label: "Active Orders",
              value: activeOrders.length.toString(),
              highlight: activeOrders.length > 0,
              color: "text-[#FF5A1F]",
            },
            {
              label: "Needs Action",
              value: placedOrders.length.toString(),
              highlight: placedOrders.length > 0,
              color: "text-amber-600",
            },
            {
              label: "Total Revenue",
              value: `₹${totalRevenue.toLocaleString("en-IN")}`,
              highlight: false,
              color: "text-emerald-600",
            },
            {
              label: "Avg. Order Value",
              value: `₹${avgOrderValue.toLocaleString("en-IN")}`,
              highlight: false,
              color: "text-blue-600",
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white px-5 py-4 flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                {stat.label}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-extrabold ${stat.color}`}>
                  {stat.value}
                </span>
                {stat.highlight && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5A1F] opacity-40" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5A1F]" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filter Tabs ── */}
      <div className="border-b border-slate-100 px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 py-2 min-w-max">
          {FILTER_TABS.map((tab) => {
            const count = countByFilter[tab.key];
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-[#FF5A1F] text-white shadow-sm shadow-[#FF5A1F]/20"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <span className="text-xs">{tab.icon}</span>
                {tab.label}
                {count > 0 && (
                  <span
                    className={`inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full px-1 text-[10px] font-bold ${
                      isActive
                        ? "bg-white/25 text-white"
                        : tab.key === "placed" && count > 0
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Order List ── */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-gray-50 h-52"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <span className="text-4xl mb-4">⚠️</span>
            <p className="text-base font-bold text-gray-700">
              Failed to load orders
            </p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
            <button
              onClick={fetchOrders}
              className="mt-4 text-[#FF5A1F] font-semibold text-sm hover:underline"
            >
              Try Again
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
              <span className="text-2xl">
                {activeFilter === "completed" ? "✅" : "📋"}
              </span>
            </div>
            <p className="text-sm font-bold text-gray-700 mb-1">
              {activeFilter === "all"
                ? "No active orders right now"
                : activeFilter === "completed"
                  ? "No completed orders yet"
                  : `No ${FILTER_TABS.find((t) => t.key === activeFilter)?.label.toLowerCase()} orders`}
            </p>
            <p className="text-xs text-gray-400 max-w-[300px]">
              {activeFilter === "completed"
                ? "Delivered and completed orders will appear here."
                : "Orders will appear here in real-time as customers place them."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onStatusUpdate={fetchOrders}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrders;
