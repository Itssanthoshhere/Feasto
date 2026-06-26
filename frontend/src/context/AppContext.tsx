import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, restaurantService } from "../main";
import type { AppContextType, ICart, LocationData, User } from "../types";
import { Toaster } from "react-hot-toast";

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(() => {
    const saved = localStorage.getItem("userLocation");
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState(() => {
    const saved = localStorage.getItem("userCity");
    return saved ? saved : "Fetching Location...";
  });

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${authService}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const [cart, setCart] = useState<ICart[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);

  async function fetchCart() {
    if (!user || user.role !== "customer") return;

    try {
      const { data } = await axios.get(`${restaurantService}/api/cart/all`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCart(data.cart || []);
      setSubTotal(data.subtotal || 0);
      setQuantity(data.cartLength || 0);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user && user.role === "customer") {
      fetchCart();
    }
  }, [user]);

  useEffect(() => {
    if (location)
      localStorage.setItem("userLocation", JSON.stringify(location));
  }, [location]);

  useEffect(() => {
    if (
      city &&
      city !== "Fetching Location..." &&
      city !== "Failed to load" &&
      city !== "Location Permission Denied"
    ) {
      localStorage.setItem("userCity", city);
    }
  }, [city]);

  useEffect(() => {
    if (location && city && city !== "Fetching Location...") return;

    if (!navigator.geolocation)
      return alert("Please Allow Location to continue");

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();

          const city =
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            "Your Location";

          const addressParts = [
            data.locality,
            data.principalSubdivision,
            data.countryName,
          ].filter(Boolean);

          const formattedAddress =
            addressParts.length > 0
              ? addressParts.join(", ")
              : "Current Location";

          setLocation({
            latitude,
            longitude,
            formattedAddress,
          });

          setCity(city);
          setLoadingLocation(false);
        } catch {
          setLocation({
            latitude,
            longitude,
            formattedAddress: "Current Location",
          });
          setCity("Failed to load");
          setLoadingLocation(false);
        }
      },
      () => {
        setCity("Location Permission Denied");
        setLoadingLocation(false);
      },
    );
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        loading,
        setIsAuth,
        setLoading,
        setUser,
        user,
        location,
        loadingLocation,
        city,
        setLocation,
        setCity,
        cart,
        fetchCart,
        quantity,
        subTotal,
      }}
    >
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppData must be used within AppProvider");
  }

  return context;
};
