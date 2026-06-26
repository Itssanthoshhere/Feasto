import axios from "axios";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

export const geocodeAddress = async (
  address: string,
): Promise<GeocodeResult | null> => {
  if (!address.trim()) return null;

  try {
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        address,
      )}&format=json&limit=1`,
    );

    if (res.data && res.data.length > 0) {
      return {
        latitude: parseFloat(res.data[0].lat),
        longitude: parseFloat(res.data[0].lon),
        formattedAddress: res.data[0].display_name || address,
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding failed", error);
    throw error;
  }
};
