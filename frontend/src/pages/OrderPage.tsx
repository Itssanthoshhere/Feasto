import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import { useEffect, useState } from "react";
import type { IOrder } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import {
  BiArrowBack,
  BiMap,
  BiStore,
  BiPhone,
  BiPackage,
} from "react-icons/bi";
import { STATUS_FLOW, STATUS_META } from "../config/orderConstants";

const OrderPage = () => {
  const { id } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError(null);
      setNotFound(false);
      const { data } = await axios.get(`${restaurantService}/api/order/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setOrder(data);
    } catch (err) {
      console.log(err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(err.response?.data?.message || "Failed to load order.");
        }
      } else {
        setError("Failed to load order.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  useEffect(() => {
    if (!socket) return;

    const onOrderUpdate = () => {
      fetchOrder();
    };

    socket.on("order:update", onOrderUpdate);
    socket.on("order:rider_assigned", onOrderUpdate);

    return () => {
      socket.off("order:update", onOrderUpdate);
      socket.off("order:rider_assigned", onOrderUpdate);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-[#FF5A1F]/20 border-t-[#FF5A1F] animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-500">
            Loading your order...
          </p>
        </div>
      </div>
    );
  }

  if (notFound || (!order && !loading && !error)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
          🤷‍♂️
        </div>
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-slate-500 max-w-sm">
          We couldn't find the order you were looking for. It may have been
          deleted or the link is invalid.
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-3xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-slate-800">
          Failed to Load Order
        </h2>
        <p className="text-slate-500 max-w-sm">{error}</p>
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => navigate("/orders")}
            className="px-6 py-2.5 rounded-xl bg-slate-200 text-slate-800 font-medium hover:bg-slate-300 transition"
          >
            Go Back
          </button>
          <button
            onClick={fetchOrder}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl">
          🤷‍♂️
        </div>
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <p className="text-slate-500 max-w-sm">
          We couldn't find the order you were looking for. It may have been
          deleted or the link is invalid.
        </p>
        <button
          onClick={() => navigate("/orders")}
          className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const meta = STATUS_META[order.status] || STATUS_META.placed;
  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* ── Top App Bar ── */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors text-slate-600"
            >
              <BiArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Order Details
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                #{order._id.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-5">
        {/* ── Status Banner ── */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className={`h-1.5 w-full bg-gradient-to-r ${meta.accent}`} />

          <div className="p-6 text-center space-y-4">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${meta.bg} border-4 ${meta.border} shadow-inner`}
            >
              <span className="text-4xl">{meta.icon}</span>
            </div>

            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {meta.label}
              </h2>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                {isCancelled
                  ? "This order was cancelled."
                  : currentStepIndex === STATUS_FLOW.length - 1
                    ? "Hope you enjoy your meal!"
                    : "Your order is being processed and will be with you shortly."}
              </p>
            </div>

            {!isCancelled && (
              <div className="pt-4 max-w-md mx-auto">
                <div className="flex items-center gap-1.5 w-full">
                  {STATUS_FLOW.slice(0, 6).map((step, i) => (
                    <div
                      key={step}
                      className="relative h-2 flex-1 rounded-full overflow-hidden bg-slate-100"
                    >
                      <div
                        className={`absolute inset-y-0 left-0 bg-gradient-to-r ${meta.accent} transition-all duration-1000 ease-out`}
                        style={{
                          width:
                            i < currentStepIndex
                              ? "100%"
                              : i === currentStepIndex
                                ? "100%"
                                : "0%",
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Placed</span>
                  <span>Preparing</span>
                  <span>Delivered</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Info Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Restaurant Info */}
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <BiStore className="text-orange-500" size={24} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Restaurant
              </h3>
              <p className="font-bold text-slate-900">{order.restaurantName}</p>
              <p className="text-sm text-slate-500 mt-0.5">
                {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Delivery Info */}
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <BiMap className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Delivery Address
              </h3>
              <p className="font-bold text-slate-900 text-sm line-clamp-2">
                {order.deliveryAddress?.formattedAddress}
              </p>
              {order.deliveryAddress?.mobile && (
                <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                  <BiPhone /> {order.deliveryAddress.mobile}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center gap-3">
            <BiPackage className="text-slate-400" size={24} />
            <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Items List */}
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start gap-4">
                  <div className="flex gap-3">
                    <span className="w-6 h-6 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0 mt-0.5">
                      {item.quantity}
                    </span>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">
                        ₹{item.price} each
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-slate-900">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-100 my-4" />

            {/* Bill Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium text-slate-900">
                  ₹{order.subtotal}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee</span>
                <span className="font-medium text-slate-900">
                  ₹{order.deliveryFee}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Platform Fee</span>
                <span className="font-medium text-slate-900">
                  ₹{order.platformFee}
                </span>
              </div>
            </div>
          </div>

          {/* Grand Total */}
          <div className="bg-slate-50 p-5 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Grand Total
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : order.paymentStatus === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.paymentStatus === "paid"
                    ? "PAID"
                    : order.paymentStatus === "failed"
                      ? "FAILED"
                      : "PENDING"}
                </span>
                <span className="text-xs font-medium text-slate-500 capitalize">
                  via {order.paymentMethod}
                </span>
              </div>
            </div>

            <div className="text-3xl font-black text-slate-900">
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* ── Rider Info (if assigned) ── */}
        {order.riderName && (
          <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-3xl p-1 shadow-lg shadow-violet-500/20">
            <div className="bg-white/95 backdrop-blur rounded-[22px] p-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center shrink-0 border-2 border-violet-200">
                <span className="text-2xl">🏍️</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 mb-1">
                  Your Delivery Partner
                </h3>
                <p className="font-bold text-slate-900 text-lg truncate">
                  {order.riderName}
                </p>
              </div>
              {order.riderPhone && (
                <a
                  href={`tel:${order.riderPhone}`}
                  className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center hover:bg-violet-200 transition-colors shrink-0"
                >
                  <BiPhone size={20} />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderPage;
