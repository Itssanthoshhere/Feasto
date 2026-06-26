import { useState } from "react";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import { restaurantService } from "../main";
import { BiMapPin, BiUpload, BiStore, BiImageAdd } from "react-icons/bi";
import { MapSelector } from "./MapSelector";
import { geocodeAddress } from "../utils/geocode";

interface props {
  fetchMyRestaurant: () => Promise<void>;
}

const AddRestaurant = ({ fetchMyRestaurant }: props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isManualLocation, setIsManualLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [mapLat, setMapLat] = useState<number | null>(null);
  const [mapLng, setMapLng] = useState<number | null>(null);
  const [mapAddress, setMapAddress] = useState("");

  const { loadingLocation, location } = useAppData();

  const handleSubmit = async () => {
    if (!name || !phone || !image) {
      toast.error("All fields are required");
      return;
    }

    let finalLat = mapLat ?? location?.latitude;
    let finalLng = mapLng ?? location?.longitude;
    let finalAddress = mapAddress || location?.formattedAddress;

    if (isManualLocation) {
      if (!manualAddress.trim()) {
        toast.error("Please enter your manual address");
        return;
      }
      try {
        setSubmitting(true);
        const geoResult = await geocodeAddress(manualAddress);
        if (geoResult) {
          finalLat = geoResult.latitude;
          finalLng = geoResult.longitude;
          finalAddress = geoResult.formattedAddress;
        } else {
          toast.error(
            "Could not find coordinates for this address. Please try being more specific.",
          );
          setSubmitting(false);
          return;
        }
      } catch {
        toast.error("Failed to verify manual address");
        setSubmitting(false);
        return;
      }
    }

    if (finalLat == null || finalLng == null || !finalAddress) {
      toast.error("Please pick a location on the map or enter manually");
      if (isManualLocation) setSubmitting(false);
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("latitude", String(finalLat));
    formData.append("longitude", String(finalLng));
    formData.append("formattedAddress", String(finalAddress));
    formData.append("file", image);
    formData.append("phone", phone);

    try {
      setSubmitting(true);
      await axios.post(`${restaurantService}/api/restaurant/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Restaurant Added successfully");
      fetchMyRestaurant();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to add restaurant",
        );
      } else {
        toast.error("Failed to add restaurant");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-lg w-full animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF5A1F]/10 text-[#FF5A1F] shadow-inner mb-4">
            <BiStore className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Add Your Restaurant
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Join Feasto and start growing your business today.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                Restaurant Name
              </label>
              <input
                type="text"
                placeholder="e.g. The Rustic Kitchen"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#FF5A1F] focus:bg-white focus:ring-4 focus:ring-[#FF5A1F]/10"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                Contact Number
              </label>
              <input
                type="number"
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#FF5A1F] focus:bg-white focus:ring-4 focus:ring-[#FF5A1F]/10"
              />
            </div>

            {/* Desc */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
                Description
              </label>
              <textarea
                placeholder="Tell customers what makes your food special..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#FF5A1F] focus:bg-white focus:ring-4 focus:ring-[#FF5A1F]/10"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">
              Cover Image
            </label>
            <label
              className={`
              flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition-all duration-200
              ${image ? "border-[#FF5A1F] bg-[#FF5A1F]/5" : "border-slate-300 bg-slate-50 hover:border-[#FF5A1F]/50 hover:bg-slate-100"}
            `}
            >
              {image ? (
                <>
                  <BiImageAdd className="h-8 w-8 text-[#FF5A1F]" />
                  <span className="text-sm font-bold text-[#FF5A1F]">
                    {image.name}
                  </span>
                  <span className="text-xs font-medium text-[#FF5A1F]/70">
                    Click to change
                  </span>
                </>
              ) : (
                <>
                  <BiUpload className="h-8 w-8 text-slate-400" />
                  <span className="text-sm font-semibold text-slate-600">
                    Upload restaurant image
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    PNG, JPG up to 10MB
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => setImage(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          {/* Location Toggle & Input */}
          <div className="space-y-3">
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
              <>
                <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 group">
                  <MapSelector
                    latitude={mapLat || location?.latitude || null}
                    longitude={mapLng || location?.longitude || null}
                    onLocationSelect={(lat, lng, address) => {
                      setMapLat(lat);
                      setMapLng(lng);
                      setMapAddress(address);
                    }}
                  />
                  {!mapLat && !location?.latitude && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none transition-opacity group-hover:opacity-0">
                      <div className="bg-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm text-[#FF5A1F] flex items-center gap-2">
                        <BiMapPin size={18} />
                        Click on the map to set location
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                    Selected Address
                  </span>
                  <div
                    className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium transition-colors ${
                      mapAddress || location?.formattedAddress
                        ? "border-[#FF5A1F]/30 bg-[#FF5A1F]/5 text-slate-700"
                        : "border-slate-200 bg-slate-50 text-slate-400 border-dashed"
                    }`}
                  >
                    <BiMapPin
                      className={`w-5 h-5 mt-0.5 shrink-0 ${
                        mapAddress || location?.formattedAddress
                          ? "text-[#FF5A1F]"
                          : "text-slate-400"
                      }`}
                    />
                    <span className="leading-relaxed">
                      {loadingLocation
                        ? "Fetching location..."
                        : mapAddress ||
                          location?.formattedAddress ||
                          "No location selected"}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Submit */}
          <button
            className={`
              w-full rounded-2xl py-4 text-sm font-bold text-white shadow-md transition-all duration-300 active:scale-[0.98]
              ${
                submitting
                  ? "bg-slate-400 cursor-not-allowed shadow-none"
                  : "bg-[#FF5A1F] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FF5A1F]/30 hover:bg-[#e14b14]"
              }
            `}
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Add Restaurant"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRestaurant;
