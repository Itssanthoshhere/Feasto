import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch, BiX, BiCheck, BiLoader } from "react-icons/bi";
import { MapSelector } from "./MapSelector";
import axios from "axios";
import toast from "react-hot-toast";

const Navbar = () => {
  const currLocation = useLocation();
  const navigate = useNavigate();
  const isHomePage = currLocation.pathname === "/";

  const { isAuth, city, quantity, setLocation, setCity } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);

  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/`);
    }
  };

  const handleLocationSelect = (
    lat: number,
    lng: number,
    formattedAddress: string,
  ) => {
    setLocation({
      latitude: lat,
      longitude: lng,
      formattedAddress,
    });

    // Extract city name from formatted address (first part)
    const cityName = formattedAddress.split(",")[0]?.trim() || "Your Location";
    setCity(cityName);
    setIsLocationModalOpen(false);
  };

  // Store pending location from map interactions without closing modal
  const handlePendingLocationSelect = (
    lat: number,
    lng: number,
    formattedAddress: string,
  ) => {
    setPendingLocation({ lat, lng, address: formattedAddress });
  };

  // Apply pending location and close
  const confirmLocation = async () => {
    if (isManualLocation) {
      if (!manualAddress.trim()) {
        toast.error("Please enter your manual address");
        return;
      }
      try {
        setIsVerifyingAddress(true);
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            manualAddress,
          )}&format=json&limit=1`,
        );
        if (res.data && res.data.length > 0) {
          const lat = parseFloat(res.data[0].lat);
          const lng = parseFloat(res.data[0].lon);
          const formattedAddress = res.data[0].display_name || manualAddress;
          handleLocationSelect(lat, lng, formattedAddress);
        } else {
          toast.error(
            "Could not find coordinates for this address. Please try being more specific.",
          );
        }
      } catch {
        toast.error("Failed to verify manual address");
      } finally {
        setIsVerifyingAddress(false);
      }
    } else {
      if (pendingLocation) {
        handleLocationSelect(
          pendingLocation.lat,
          pendingLocation.lng,
          pendingLocation.address,
        );
      }
      setPendingLocation(null);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-50 w-full transition-all duration-300 border-b shadow-sm bg-white/85 backdrop-blur-xl border-slate-200/60">
        <div className="flex flex-col gap-3 px-4 py-3 mx-auto max-w-7xl md:flex-row md:items-center md:justify-between md:gap-6">
          {/* Top Row: Logo & Actions (Mobile) / Left & Right (Desktop) */}
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Logo */}
            <Link to={"/"} className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/30 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="Feasto"
                  className="w-full h-full object-cover scale-[1.5]"
                />
              </div>
              <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#FF5A1F] italic lowercase drop-shadow-sm">
                feasto
              </span>
            </Link>

            {/* Actions (Mobile Only) */}
            <div className="flex items-center gap-3 md:hidden">
              <Link
                to={"/cart"}
                className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#FF5A1F]"
              >
                <CgShoppingCart className="w-6 h-6" />
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5A1F] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {quantity}
                </span>
              </Link>

              {isAuth ? (
                <Link
                  to="/account"
                  className="flex items-center justify-center px-4 py-2 text-sm font-bold transition rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
                >
                  Account
                </Link>
              ) : (
                <Link
                  to="/Login"
                  className="flex items-center justify-center rounded-full bg-[#FF5A1F] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#FF5A1F]/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FF5A1F]/40 active:translate-y-0 active:scale-95"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {!isHomePage ? (
            <form
              onSubmit={handleSearch}
              className="flex-1 w-full max-w-2xl mx-auto animate-fade-in-up md:animate-none"
            >
              <div className="flex items-center w-full rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md focus-within:border-[#FF5A1F]/50 focus-within:ring-4 focus-within:ring-[#FF5A1F]/10">
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 rounded-l-full bg-slate-50 px-4 py-2.5 text-slate-600 border-r border-slate-200 transition-colors hover:bg-slate-100 cursor-pointer"
                >
                  <BiMapPin className="h-5 w-5 text-[#FF5A1F]" />
                  <span className="max-w-[100px] truncate text-sm font-semibold">
                    {city || "Select Location"}
                  </span>
                </button>

                {/* Search */}
                <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
                  <BiSearch className="w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for restaurants, cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm font-medium bg-transparent outline-none text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-center flex-1 w-full my-2 animate-fade-in-up md:animate-none md:my-0">
              <button
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2 transition-all border rounded-full shadow-sm cursor-pointer border-slate-200 bg-white/50 backdrop-blur-sm hover:shadow-md hover:bg-white group"
              >
                <BiMapPin className="h-5 w-5 text-[#FF5A1F] transition-transform group-hover:scale-110" />
                <span className="max-w-[150px] sm:max-w-[200px] truncate text-sm font-extrabold text-slate-700">
                  {city || "Fetching location..."}
                </span>
              </button>
            </div>
          )}

          {/* Actions (Desktop Only) */}
          <div className="items-center hidden gap-4 md:flex">
            <Link
              to={"/cart"}
              className="relative rounded-full p-2.5 text-slate-600 transition-all hover:bg-slate-100 hover:text-[#FF5A1F] active:scale-95"
            >
              <CgShoppingCart className="h-[22px] w-[22px]" />
              <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A1F] text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                {quantity}
              </span>
            </Link>

            {isAuth ? (
              <Link
                to="/account"
                className="flex items-center justify-center rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
              >
                Account
              </Link>
            ) : (
              <Link
                to="/Login"
                className="flex items-center justify-center rounded-full bg-[#FF5A1F] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#FF5A1F]/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FF5A1F]/40 active:translate-y-0 active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Location Selection Modal */}
      {isLocationModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => {
            setIsLocationModalOpen(false);
            setPendingLocation(null);
          }}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Set Delivery Location
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  Drag the map or click to place the pin
                </p>
              </div>
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setPendingLocation(null);
                }}
                className="flex items-center justify-center h-9 w-9 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <BiX className="w-6 h-6" />
              </button>
            </div>

            {/* Location Type Toggle */}
            <div className="px-6 py-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-fit">
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

            {/* Input Area */}
            {isManualLocation ? (
              <div className="px-6 py-4 h-72 sm:h-80 w-full flex items-start">
                <textarea
                  placeholder="Enter your full address (e.g. 123 Main St, City, State, Zip)"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#FF5A1F] focus:ring-4 focus:ring-[#FF5A1F]/10 focus:bg-white"
                />
              </div>
            ) : (
              <div className="relative h-72 sm:h-80 w-full">
                <MapSelector
                  latitude={null}
                  longitude={null}
                  onLocationSelect={handlePendingLocationSelect}
                />
              </div>
            )}

            {/* Live Address + Confirm */}
            <div className="px-6 py-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-[#FF5A1F]/5 border border-[#FF5A1F]/20 p-3">
                <BiMapPin className="w-5 h-5 text-[#FF5A1F] shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {pendingLocation ? "Selected Location" : "Current Location"}
                  </p>
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {pendingLocation?.address || city || "Not set"}
                  </p>
                </div>
              </div>
              <button
                onClick={confirmLocation}
                disabled={
                  (!isManualLocation && !pendingLocation) ||
                  (isManualLocation && !manualAddress.trim()) ||
                  isVerifyingAddress
                }
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#FF5A1F] py-3 text-sm font-bold text-white shadow-md shadow-[#FF5A1F]/20 transition-all hover:bg-[#e8521c] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#FF5A1F]"
              >
                {isVerifyingAddress ? (
                  <BiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <BiCheck className="w-5 h-5" />
                )}
                {isVerifyingAddress ? "Verifying..." : "Confirm Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
