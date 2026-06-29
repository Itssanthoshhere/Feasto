import { useState } from "react";

const statusOptions = [
  "all",
  "placed",
  "accepted",
  "preparing",
  "ready_for_rider",
  "rider_assigned",
  "picked_up",
  "delivered",
  "cancelled",
];

const AdminOrderHistory = ({ orders }: { orders: any[] }) => {
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Order History
        </h3>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold outline-none focus:border-orange-400 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs tracking-wider dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Restaurant</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rider</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {order._id.slice(-8)}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {order.restaurantName}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-600"
                            : order.status === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : "bg-blue-50 text-blue-600"
                        }`}
                      >
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {order.riderName || "—"}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">
                      ₹{order.totalAmount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderHistory;
