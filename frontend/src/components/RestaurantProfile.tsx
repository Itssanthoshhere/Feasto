import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const toggleOpenStatus = async () => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/status`,
        { status: !isOpen },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      setIsOpen(data.restaurant.isOpen);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const { setIsAuth, setUser } = useAppData();

  const logoutHandler = async () => {
    await axios.put(
      `${restaurantService}/api/restaurant/status`,
      { status: false },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    );
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    toast.success("loggedOut successfully");
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col sm:flex-row gap-6">
      <div className="relative h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-2xl shadow-sm">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span className="text-3xl">🍽️</span>
          </div>
        )}
        {!restaurant.isVerified && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider px-2 py-1 bg-black/50 rounded-full">
              Pending
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div className="w-full">
            {editMode ? (
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-2xl font-extrabold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 outline-none focus:border-[#FF5A1F] transition-colors"
              />
            ) : (
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {restaurant.name}
              </h2>
            )}

            <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-slate-500">
              <BiMapPin className="h-4 w-4 text-[#FF5A1F]" />
              {restaurant.autoLocation.formattedAddress ||
                "Location unavailable"}
            </div>
          </div>

          {isSeller && (
            <button
              onClick={() => setEditMode(!editMode)}
              className="shrink-0 ml-4 rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-800"
            >
              <BiEdit size={20} />
            </button>
          )}
        </div>

        <div className="mt-3">
          {editMode ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-[#FF5A1F] transition-colors resize-none h-24"
            />
          ) : (
            <p className="text-sm font-medium text-slate-500 max-w-2xl line-clamp-2">
              {restaurant.description || "No description provided."}
            </p>
          )}
        </div>

        <div className="mt-auto pt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-50">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOpen ? "bg-green-500" : "bg-slate-400"}`}
              ></span>
              {isOpen ? "Open Now" : "Closed"}
            </span>
            {restaurant.isVerified && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                ✓ Verified
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {editMode && (
              <button
                onClick={saveChanges}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                <BiSave size={16} />
                {loading ? "Saving..." : "Save"}
              </button>
            )}

            {isSeller && (
              <button
                onClick={toggleOpenStatus}
                className={`px-4 py-2 text-sm font-bold rounded-xl transition-colors ${
                  isOpen
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
              >
                {isOpen ? "Close Restaurant" : "Open Restaurant"}
              </button>
            )}

            {isSeller && (
              <button
                onClick={logoutHandler}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-gray-400">
          Created on {new Date(restaurant.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RestaurantProfile;
