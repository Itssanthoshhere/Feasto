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

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(
          `${adminService}/api/v1/admin/restaurant/${restaurant._id}/menu`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setMenu(data.menu || []);
      } catch (error) {
        console.error("Failed to fetch menu", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, [restaurant._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="relative h-48 shrink-0 bg-slate-100">
          <img
            src={restaurant.image}
            className="w-full h-full object-cover"
            alt={restaurant.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white backdrop-blur-md rounded-full p-2 transition-colors"
          >
            <BiX size={24} />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <h2 className="text-3xl font-black text-white">
              {restaurant.name}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-white/90 text-sm font-medium">
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
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
            <BiFoodMenu size={20} className="text-orange-500" />
            <h3 className="text-lg font-bold">Restaurant Menu</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : menu.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
              <p className="text-slate-400">
                This restaurant has no menu items yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menu.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                >
                  <img
                    src={item.image}
                    className="w-16 h-16 rounded-xl object-cover"
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
