import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { LuLocateFixed } from "react-icons/lu";
import toast from "react-hot-toast";
import "leaflet/dist/leaflet.css";

// Fix leaflet icon
// @ts-expect-error - _getIconUrl is not in the type definition but needs to be deleted
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapSelectorProps {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (
    lat: number,
    lng: number,
    formattedAddress: string,
  ) => void;
}

const LocationPicker = ({
  fetchAddress,
}: {
  fetchAddress: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      fetchAddress(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const LocateMeButton = ({
  fetchAddress,
}: {
  fetchAddress: (lat: number, lng: number) => void;
}) => {
  const map = useMap();
  const locateUser = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    toast.loading("Locating...", { id: "locate" });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        map.flyTo([lat, lng], 16, { animate: true });
        fetchAddress(lat, lng);
        toast.dismiss("locate");
      },
      () => {
        toast.dismiss("locate");
        toast.error("Location permission denied");
      },
    );
  };

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        locateUser();
      }}
      className="absolute right-4 top-4 z-[1000] flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-md transition-all hover:bg-slate-50 hover:text-[#FF5A1F] hover:shadow-lg active:scale-95"
    >
      <LuLocateFixed size={18} className="text-[#FF5A1F]" />
      Locate Me
    </button>
  );
};

export const MapSelector = ({
  latitude,
  longitude,
  onLocationSelect,
}: MapSelectorProps) => {
  // Unified Reverse Geocoding using BigDataCloud
  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      );
      const data = await res.json();
      const addressParts = [
        data.locality,
        data.principalSubdivision,
        data.countryName,
      ].filter(Boolean);
      const formattedAddress =
        addressParts.length > 0 ? addressParts.join(", ") : "Selected Location";

      onLocationSelect(lat, lng, formattedAddress);
    } catch {
      toast.error("Failed to fetch address details");
    }
  };

  return (
    <MapContainer
      center={[latitude || 28.6139, longitude || 77.209]}
      zoom={13}
      className="h-full w-full z-0"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <LocationPicker fetchAddress={fetchAddress} />
      <LocateMeButton fetchAddress={fetchAddress} />
      {latitude && longitude && <Marker position={[latitude, longitude]} />}
    </MapContainer>
  );
};
