import axios from "axios";
import { useEffect, useState } from "react";
import { adminService } from "../main";
import AdminRestaurantCard from "../components/AdminRestaurantCard";
import RiderAdmin from "../components/RiderAdmin";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";

const Admin = () => {
  const { setUser, setIsAuth } = useAppData();
  const [restaurant, setRestaurant] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"restaurant" | "rider">("restaurant");

  const logoutHandler = () => {
    localStorage.setItem("token", "");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${adminService}/api/v1/admin/restaurant/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const response = await axios.get(
        `${adminService}/api/v1/admin/rider/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRestaurant(data.restaurants);
      setRiders(response.data.riders);
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="text-slate-500 font-medium tracking-wide">
            Loading Admin Panel...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage all restaurants and riders on the platform.
            </p>
          </div>
          <button
            onClick={logoutHandler}
            className="rounded-xl bg-slate-100 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl w-fit">
          <button
            onClick={() => setTab("restaurant")}
            className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
              tab === "restaurant"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Restaurants ({restaurant.length})
          </button>

          <button
            onClick={() => setTab("rider")}
            className={`rounded-xl px-6 py-2.5 text-sm font-bold transition-all ${
              tab === "rider"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            Riders ({riders.length})
          </button>
        </div>

        {/* Content */}
        {tab === "restaurant" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurant.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 text-lg">
                  No restaurants found in the system.
                </p>
              </div>
            ) : (
              restaurant.map((r) => (
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
            {riders.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-slate-400 text-lg">
                  No riders found in the system.
                </p>
              </div>
            ) : (
              riders.map((r) => (
                <RiderAdmin key={r._id} rider={r} onVerify={fetchData} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
