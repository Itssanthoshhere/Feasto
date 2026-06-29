import { useEffect, useState } from "react";
import axios from "axios";
import { adminService } from "../main";
import { BiX, BiStore, BiPhone, BiFoodMenu } from "react-icons/bi";

const RestaurantDetailModal = ({
  restaurant,
  onClose,
}: {
  restaurant: any;
  onClose: () => void;
}) => {
  const [menu, setMenu] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data } = await axios.get(
        `${adminService}/api/v1/admin/restaurant/${restaurant._id}/menu`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setMenu(data.menu || []);
    } catch (err) {
      console.error("Failed to fetch menu", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, [restaurant._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative h-48 shrink-0 bg-slate-100">
          <img
            src={restaurant.image}
            className="object-cover w-full h-full"
            alt={restaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

          <button
            onClick={onClose}
            className="absolute p-2 text-white transition-colors rounded-full top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md"
          >
            <BiX size={24} />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-3xl font-black text-white">
              {restaurant.name}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm font-medium text-white/90">
              <span className="flex items-center gap-1.5">
                <BiPhone size={16} /> {restaurant.phone}
              </span>
              <span className="flex items-center gap-1.5 line-clamp-1">
                <BiStore size={16} />{" "}
                {restaurant.autoLocation?.formattedAddress}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <BiFoodMenu size={20} className="text-orange-500" />
            <h3 className="text-lg font-bold">Restaurant Menu</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-orange-500 rounded-full animate-spin border-t-transparent" />
            </div>
          ) : error ? (
            <div className="py-10 text-center bg-white border border-red-100 rounded-2xl bg-red-50/50">
              <p className="mb-2 text-red-500">Failed to load menu</p>
              <button
                onClick={fetchMenu}
                className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : menu.length === 0 ? (
            <div className="py-10 text-center bg-white border rounded-2xl border-slate-100">
              <p className="text-slate-400">
                This restaurant has no menu items yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {menu.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                >
                  <img
                    src={item.image}
                    className="object-cover w-16 h-16 rounded-xl"
                    alt=""
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 line-clamp-1">
                      {item.name}
                    </h4>
                    <p className="text-sm font-semibold text-orange-600">
                      ₹{item.price}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetailModal;
