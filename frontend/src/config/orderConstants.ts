export const ACTIVE_STATUSES = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
];

export const STATUS_FLOW = [
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
  "delivered",
];

export const STATUS_META: Record<
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
    label: "Order Placed",
    icon: "📋",
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
    label: "Ready for Pickup",
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
    label: "On the Way",
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
