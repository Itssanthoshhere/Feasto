import { useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiEdit, BiMapPin, BiSave } from "react-icons/bi";
import { useAppData } from "../context/AppContext";
import { MapSelector } from "./MapSelector";

interface props {
  restaurant: IRestaurant;
  isSeller: boolean;
  onUpdate: (restaurant: IRestaurant) => void;
}

const RestaurantProfile = ({ restaurant, isSeller, onUpdate }: props) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [description, setDescription] = useState(restaurant.description);
  const [address, setAddress] = useState(
    restaurant.autoLocation?.formattedAddress || "",
  );
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [mapLat, setMapLat] = useState<number | null>(
    restaurant.autoLocation?.coordinates[1] || null,
  );
  const [mapLng, setMapLng] = useState<number | null>(
    restaurant.autoLocation?.coordinates[0] || null,
  );
  const [mapAddress, setMapAddress] = useState("");
  const [isOpen, setIsOpen] = useState(restaurant.isOpen);
  const [loading, setLoading] = useState(false);

  const { setIsAuth, setUser } = useAppData();

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
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        toast.error(
          error?.response?.data?.message || "Failed to update status",
        );
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  const saveChanges = async () => {
    try {
      setLoading(true);
      let lat = mapAddress ? mapLat : restaurant.autoLocation?.coordinates[1];
      let lng = mapAddress ? mapLng : restaurant.autoLocation?.coordinates[0];
      let formattedAddress =
        mapAddress || restaurant.autoLocation?.formattedAddress;

      if (isManualLocation) {
        if (!manualAddress.trim()) {
          toast.error("Please enter your manual address");
          setLoading(false);
          return;
        }
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              manualAddress,
            )}&format=json&limit=1`,
          );
          if (res.data && res.data.length > 0) {
            lat = parseFloat(res.data[0].lat);
            lng = parseFloat(res.data[0].lon);
            formattedAddress = res.data[0].display_name || manualAddress;
          } else {
            toast.error(
              "Could not find coordinates for this address. Please try being more specific.",
            );
            setLoading(false);
            return;
          }
        } catch {
          toast.error("Failed to verify manual address");
          setLoading(false);
          return;
        }
      }

      const { data } = await axios.put(
        `${restaurantService}/api/restaurant/edit`,
        { name, description, latitude: lat, longitude: lng, formattedAddress },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      onUpdate(data.restaurant);
      setAddress(data.restaurant.autoLocation?.formattedAddress || "");
      setMapAddress("");
      setEditMode(false);
    } catch (error) {
      console.log(error);
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

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
                placeholder="Restaurant Name"
              />
            ) : (
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {restaurant.name}
              </h2>
            )}

            <div className="mt-2 flex items-start sm:items-center flex-col sm:flex-row gap-2 sm:gap-1.5 text-sm font-medium text-slate-500">
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <BiMapPin className="h-4 w-4 shrink-0 text-[#FF5A1F]" />
                {editMode ? (
                  <span className="line-clamp-2 sm:line-clamp-1">
                    {mapAddress || address || "Select on map below"}
                  </span>
                ) : (
                  <span className="line-clamp-2 sm:line-clamp-1">
                    {restaurant.autoLocation?.formattedAddress ||
                      "Location unavailable"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isSeller && (
            <button
              onClick={() => {
                if (editMode) {
                  setName(restaurant.name);
                  setDescription(restaurant.description || "");
                  setAddress(restaurant.autoLocation?.formattedAddress || "");
                  setMapAddress("");
                  setMapLat(restaurant.autoLocation?.coordinates[1] || null);
                  setMapLng(restaurant.autoLocation?.coordinates[0] || null);
                  setIsManualLocation(false);
                  setManualAddress("");
                }
                setEditMode(!editMode);
              }}
              className="shrink-0 ml-4 rounded-xl p-2.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-800"
              title={editMode ? "Cancel Editing" : "Edit Profile"}
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

        {/* Map Selector / Manual Entry in edit mode */}
        {editMode && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between ml-1">
              <label className="block text-sm font-bold text-slate-700">
                Location Details
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setIsManualLocation(false)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    !isManualLocation
                      ? "bg-white text-[#FF5A1F] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Map Picker
                </button>
                <button
                  type="button"
                  onClick={() => setIsManualLocation(true)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    isManualLocation
                      ? "bg-white text-[#FF5A1F] shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Manual Entry
                </button>
              </div>
            </div>

            {isManualLocation ? (
              <textarea
                placeholder="Enter your full business address (e.g. 123 Main St, City, State, Zip)"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#FF5A1F] focus:ring-4 focus:ring-[#FF5A1F]/10"
              />
            ) : (
              <div className="relative h-52 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <MapSelector
                  latitude={mapLat}
                  longitude={mapLng}
                  onLocationSelect={(lat, lng, addr) => {
                    setMapLat(lat);
                    setMapLng(lng);
                    setMapAddress(addr);
                    setAddress(addr);
                  }}
                />
              </div>
            )}
          </div>
        )}

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
