import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import AdminRevenueChart from "../components/AdminRevenueChart";
import AdminOrderHistory from "../components/AdminOrderHistory";
import AdminUserManagement from "../components/AdminUserManagement";
import AdminActivityLog from "../components/AdminActivityLog";
import AdminNotifyModal from "../components/AdminNotifyModal";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import {
  BiSearch,
  BiTrendingUp,
  BiStore,
  BiPackage,
  BiUserCheck,
  BiBell,
  BiMoon,
  BiSun,
  BiDownload,
} from "react-icons/bi";

type TabType =
  | "overview"
  | "orders"
  | "history"
  | "restaurant"
  | "rider"
  | "users"
  | "activity";

const Admin = () => {
  const { setUser, setIsAuth } = useAppData();

  const [restaurant, setRestaurant] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [revenueChart, setRevenueChart] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("overview");

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "verified" | "pending">("all");

  const [darkMode, setDarkMode] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const authHeaders = {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  };

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        axios.get(`${adminService}/api/v1/admin/restaurant/all`, authHeaders),
        axios.get(`${adminService}/api/v1/admin/rider/all`, authHeaders),
        axios.get(`${adminService}/api/v1/admin/orders/active`, authHeaders),
        axios.get(`${adminService}/api/v1/admin/analytics`, authHeaders),
        axios.get(`${adminService}/api/v1/admin/revenue-chart`, authHeaders),
        axios.get(`${adminService}/api/v1/admin/orders/history`, authHeaders),
        axios.get(`${adminService}/api/v1/admin/users`, authHeaders),
        axios.get(`${adminService}/api/v1/admin/activity-log`, authHeaders),
      ]);

      if (results[0].status === "fulfilled")
        setRestaurant(results[0].value.data.restaurants);
      if (results[1].status === "fulfilled")
        setRiders(results[1].value.data.riders);
      if (results[2].status === "fulfilled")
        setActiveOrders(results[2].value.data.orders);
      if (results[3].status === "fulfilled")
        setAnalytics(results[3].value.data);
      if (results[4].status === "fulfilled")
        setRevenueChart(results[4].value.data.chart);
      if (results[5].status === "fulfilled")
        setOrderHistory(results[5].value.data.orders);
      if (results[6].status === "fulfilled")
        setUsers(results[6].value.data.users);
      if (results[7].status === "fulfilled")
        setActivityLogs(results[7].value.data.logs);

      if (results.some((r) => r.status === "rejected")) {
        toast.error("Some data failed to load");
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // CSV Export Utility
  const exportCSV = (data: any[], filename: string) => {
    if (!data.length) return toast.error("No data to export");
    const keys = Array.from(new Set(data.flatMap(Object.keys))).filter(
      (k) => k !== "_id" && k !== "__v",
    );
    const csv = [
      keys.join(","),
      ...data.map((row) =>
        keys
          .map((k) => {
            let val = row[k];
            if (typeof val === "object" && val !== null) {
              val = JSON.stringify(val);
            }
            let strVal = String(val ?? "");
            if (/^[=+\-@]/.test(strVal)) {
              strVal = "'" + strVal;
            }
            return `"${strVal.replace(/"/g, '""')}"`;
          })
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filename}.csv downloaded`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 rounded-full animate-spin border-t-transparent" />
          <p className="font-medium tracking-wide text-slate-500">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  // Derived state for filtering
  const filteredRestaurants = restaurant.filter((r) => {
    const matchesSearch = r.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "verified"
          ? r.isVerified
          : !r.isVerified;
    return matchesSearch && matchesFilter;
  });

  const filteredRiders = riders.filter((r) => {
    const matchesSearch =
      r.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.aadhaarNumber || r.aadharNumber)?.includes(searchTerm);
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "verified"
          ? r.isVerified
          : !r.isVerified;
    return matchesSearch && matchesFilter;
  });

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "orders", label: "Live Orders" },
    { key: "history", label: "Order History" },
    { key: "restaurant", label: `Restaurants (${restaurant.length})` },
    { key: "rider", label: `Riders (${riders.length})` },
    { key: "users", label: `Users (${users.length})` },
    { key: "activity", label: "Activity Log" },
  ];

  return (
    <div
      className={`min-h-screen p-6 md:p-10 transition-colors ${darkMode ? "dark bg-slate-900" : "bg-slate-50"}`}
    >
      <div className="mx-auto space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-black tracking-tight md:text-3xl text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage Feasto platform overview, users, and orders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-xl bg-slate-100 p-2.5 text-slate-600 hover:bg-slate-200 transition-colors dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              title={darkMode ? "Light Mode" : "Dark Mode"}
            >
              {darkMode ? <BiSun size={20} /> : <BiMoon size={20} />}
            </button>
            <button
              onClick={() => setShowNotifyModal(true)}
              className="rounded-xl bg-orange-50 p-2.5 text-orange-600 hover:bg-orange-100 transition-colors dark:bg-orange-500/20 dark:text-orange-400"
              title="Send Notification"
            >
              <BiBell size={20} />
            </button>
            <button
              onClick={logoutHandler}
              className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors dark:bg-slate-700 dark:text-slate-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit dark:bg-slate-800">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                tab === t.key
                  ? "bg-white text-orange-600 shadow-sm dark:bg-slate-700 dark:text-orange-400"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === "overview" && analytics && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 shrink-0">
                  <BiTrendingUp size={28} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{analytics.totalRevenue}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center justify-center bg-blue-100 w-14 h-14 rounded-2xl shrink-0">
                  <BiPackage size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Live Orders
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {analytics.activeOrdersCount}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center justify-center bg-orange-100 w-14 h-14 rounded-2xl shrink-0">
                  <BiStore size={28} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Verified Restaurants
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {analytics.restaurantsCount}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 flex items-center gap-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center justify-center bg-purple-100 w-14 h-14 rounded-2xl shrink-0">
                  <BiUserCheck size={28} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                    Online Riders
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                    {analytics.onlineRidersCount}
                  </h3>
                </div>
              </div>
            </div>

            <AdminRevenueChart data={revenueChart} />
          </div>
        )}

        {/* Live Orders Tab */}
        {tab === "orders" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => exportCSV(activeOrders, "active_orders")}
                className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <BiDownload size={16} /> Export CSV
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
                  <thead className="text-xs font-semibold tracking-wider uppercase bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Restaurant</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Rider</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {activeOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-slate-400"
                        >
                          No active orders at the moment.
                        </td>
                      </tr>
                    ) : (
                      activeOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/50"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                            {order._id.slice(-8)}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                            {order.restaurantName}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                              {order.status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                            {order.riderName || "Not assigned"}
                          </td>
                          <td className="px-6 py-4 font-bold text-right text-slate-900 dark:text-white">
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
        )}

        {/* Order History Tab */}
        {tab === "history" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => exportCSV(orderHistory, "order_history")}
                className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <BiDownload size={16} /> Export CSV
              </button>
            </div>
            <AdminOrderHistory orders={orderHistory} />
          </div>
        )}

        {/* Restaurants & Riders Tabs (With Search & Filters) */}
        {(tab === "restaurant" || tab === "rider") && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <BiSearch
                  className="absolute -translate-y-1/2 left-4 top-1/2 text-slate-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={`Search ${tab}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pr-4 transition-all bg-white border shadow-sm outline-none pl-11 rounded-2xl border-slate-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                />
              </div>
              <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit dark:bg-slate-800">
                {(["all", "verified", "pending"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      filter === f
                        ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() =>
                  exportCSV(
                    tab === "restaurant" ? filteredRestaurants : filteredRiders,
                    tab === "restaurant" ? "restaurants" : "riders",
                  )
                }
                className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shrink-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <BiDownload size={16} /> Export CSV
              </button>
            </div>

            {tab === "restaurant" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRestaurants.length === 0 ? (
                  <div className="py-20 text-center col-span-full">
                    <p className="text-lg text-slate-400">
                      No restaurants found matching your criteria.
                    </p>
                  </div>
                ) : (
                  filteredRestaurants.map((r) => (
                    <AdminRestaurantCard
                      key={r._id}
                      restaurant={r}
                      onVerify={fetchData}
                    />
                  ))
                )}
              </div>
            )}

            {tab === "rider" && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredRiders.length === 0 ? (
                  <div className="py-20 text-center col-span-full">
                    <p className="text-lg text-slate-400">
                      No riders found matching your criteria.
                    </p>
                  </div>
                ) : (
                  filteredRiders.map((r) => (
                    <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {tab === "users" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => exportCSV(users, "users")}
                className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
              >
                <BiDownload size={16} /> Export CSV
              </button>
            </div>
            <AdminUserManagement users={users} />
          </div>
        )}

        {/* Activity Log Tab */}
        {tab === "activity" && <AdminActivityLog logs={activityLogs} />}
      </div>

      {/* Notification Modal */}
      {showNotifyModal && (
        <AdminNotifyModal
          onClose={() => {
            setShowNotifyModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default Admin;
