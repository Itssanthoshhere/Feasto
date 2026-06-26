import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import { LuMapPin } from "react-icons/lu";
import { BiLoader, BiPlus, BiTrash, BiPhone, BiMap } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { MapSelector } from "../components/MapSelector";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
  label: "Home" | "Work" | "Other";
}

const AddAddressPage = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [mobile, setMobile] = useState("");
  const [formattedAddress, setFormattedAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setFormattedAddress(address);
  };

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const { data } = await axios.get(`${restaurantService}/api/address/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setAddresses(data || []);
    } catch {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // Add address
  const addAddress = async () => {
    let finalLat = latitude;
    let finalLng = longitude;
    let finalFormattedAddress = formattedAddress;

    if (isManualLocation) {
      if (!manualAddress.trim()) {
        toast.error("Please enter your manual address");
        return;
      }
      try {
        setAdding(true);
        const res = await axios.get(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            manualAddress,
          )}&format=json&limit=1`,
        );
        if (res.data && res.data.length > 0) {
          finalLat = parseFloat(res.data[0].lat);
          finalLng = parseFloat(res.data[0].lon);
          finalFormattedAddress = res.data[0].display_name || manualAddress;
        } else {
          toast.error(
            "Could not find coordinates for this address. Please try being more specific.",
          );
          setAdding(false);
          return;
        }
      } catch {
        toast.error("Failed to verify manual address");
        setAdding(false);
        return;
      }
    }

    if (
      !mobile ||
      !finalFormattedAddress ||
      finalLat === null ||
      finalLng === null
    ) {
      toast.error("Please fill all details and select location");
      if (isManualLocation) setAdding(false);
      return;
    }

    if (mobile.length < 10) {
      toast.error("Please enter a valid mobile number");
      if (isManualLocation) setAdding(false);
      return;
    }

    try {
      if (!isManualLocation) setAdding(true);
      await axios.post(
        `${restaurantService}/api/address/new`,
        {
          formattedAddress: finalFormattedAddress,
          mobile,
          latitude: finalLat,
          longitude: finalLng,
          label,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Address added successfully");
      setMobile("");
      setFormattedAddress("");
      setLatitude(null);
      setLongitude(null);
      setIsManualLocation(false);
      setManualAddress("");
      setLabel("Home");
      fetchAddresses();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error?.response?.data?.message || "Failed to add address");
      } else {
        toast.error("Failed to add address");
      }
    } finally {
      setAdding(false);
    }
  };

  // Delete address
  const deleteAddress = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this address?"))
      return;
    try {
      setDeletingId(id);
      await axios.delete(`${restaurantService}/api/address/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Address deleted");
      fetchAddresses();
    } catch {
      toast.error("Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl animate-fade-in-up">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer group w-fit"
        >
          <BiArrowBack className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Map and Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">
                Add New Address
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-6">
                Pinpoint your location on the map for accurate delivery
              </p>

              {/* Map / Manual Toggle */}
              <div className="space-y-3">
                <div className="flex items-center justify-between ml-1 mb-2">
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
                    placeholder="Enter your full address (e.g. 123 Main St, City, State, Zip)"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#FF5A1F] focus:ring-4 focus:ring-[#FF5A1F]/10 mb-6"
                  />
                ) : (
                  <div className="relative h-64 sm:h-80 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 mb-6 group">
                    <MapSelector
                      latitude={latitude}
                      longitude={longitude}
                      onLocationSelect={handleLocationSelect}
                    />
                    {/* Map Overlay Prompt */}
                    {!latitude && !longitude && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none transition-opacity group-hover:opacity-0">
                        <div className="bg-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm text-[#FF5A1F] flex items-center gap-2">
                          <LuMapPin size={18} />
                          Click on the map to set location
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Selected address */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Selected Location
                  </label>
                  <div
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium transition-colors ${
                      formattedAddress
                        ? "border-[#FF5A1F]/30 bg-[#FF5A1F]/5 text-slate-700"
                        : "border-slate-200 bg-slate-50 text-slate-400 border-dashed"
                    }`}
                  >
                    <BiMap
                      className={`w-5 h-5 mt-0.5 shrink-0 ${
                        formattedAddress ? "text-[#FF5A1F]" : "text-slate-400"
                      }`}
                    />
                    <span className="leading-relaxed">
                      {formattedAddress || "No location selected"}
                    </span>
                  </div>
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Contact Number
                  </label>
                  <div className="relative">
                    <BiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium text-slate-700 outline-none transition-all focus:border-[#FF5A1F]/50 focus:bg-white focus:ring-4 focus:ring-[#FF5A1F]/10 placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                {/* Label Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                    Save As
                  </label>
                  <div className="flex gap-2">
                    {["Home", "Work", "Other"].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => setLabel(l as "Home" | "Work" | "Other")}
                        className={`flex-1 rounded-xl py-2 text-sm font-bold border transition-all ${
                          label === l
                            ? "bg-[#FF5A1F]/10 border-[#FF5A1F]/30 text-[#FF5A1F]"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Save */}
                <button
                  disabled={
                    adding ||
                    (!isManualLocation && (!latitude || !longitude)) ||
                    (isManualLocation && !manualAddress) ||
                    !mobile
                  }
                  onClick={addAddress}
                  className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#FF5A1F] py-3.5 text-sm font-bold text-white shadow-md shadow-[#FF5A1F]/20 transition-all hover:bg-[#e8521c] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF5A1F] disabled:active:scale-100"
                >
                  {adding ? (
                    <BiLoader className="animate-spin w-5 h-5" />
                  ) : (
                    <BiPlus className="w-5 h-5" />
                  )}
                  {adding ? "Saving..." : "Save Address"}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Saved Addresses */}
          <div className="space-y-6 lg:pl-4">
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 min-h-[500px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Saved Addresses
                </h2>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                  {addresses.length}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <BiLoader className="w-8 h-8 animate-spin text-[#FF5A1F]" />
                  <p className="text-sm font-medium text-slate-500">
                    Loading addresses...
                  </p>
                </div>
              ) : addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4 text-center px-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                    <LuMapPin className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-base font-bold text-slate-700">
                    No addresses yet
                  </p>
                  <p className="text-sm font-medium text-slate-500 max-w-[250px]">
                    Add your first delivery address using the map on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      className="group flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-200 hover:shadow-md"
                    >
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F]">
                        <BiMap className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#FF5A1F] bg-[#FF5A1F]/10 px-2 py-0.5 rounded-md">
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-800 leading-relaxed mb-2">
                          {addr.formattedAddress}
                        </p>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <BiPhone className="w-3.5 h-3.5" />
                          {addr.mobile}
                        </div>
                      </div>

                      <button
                        onClick={() => deleteAddress(addr._id)}
                        disabled={deletingId === addr._id}
                        className="self-center flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        title="Delete Address"
                      >
                        {deletingId === addr._id ? (
                          <BiLoader className="h-5 w-5 animate-spin" />
                        ) : (
                          <BiTrash className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAddressPage;
