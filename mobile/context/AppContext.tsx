import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import {
  authApi,
  restaurantApi,
  getToken,
  setToken,
  removeToken,
} from "@/lib/api";
import type { User, LocationData, ICart } from "@/lib/types";

type AppContextType = {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  location: LocationData | null;
  loadingLocation: boolean;
  city: string;
  cart: ICart[];
  subTotal: number;
  quantity: number;
  setUser: (u: User | null) => void;
  setIsAuth: (v: boolean) => void;
  setLocation: (l: LocationData | null) => void;
  setCity: (c: string) => void;
  updateLocation: (loc: LocationData, cityName: string) => Promise<void>;
  fetchCart: () => Promise<void>;
  logout: () => Promise<void>;
  loginWithToken: (token: string, user: User) => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<LocationData | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [city, setCity] = useState("Fetching Location...");

  const [cart, setCart] = useState<ICart[]>([]);
  const [subTotal, setSubTotal] = useState(0);
  const [quantity, setQuantity] = useState(0);

  // ─── Fetch logged-in user ────────────────────────────────────────────────
  async function fetchUser() {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await authApi.get("/api/auth/me");
      setUser(data);
      setIsAuth(true);
    } catch {
      /* token invalid – stay logged out */
    } finally {
      setLoading(false);
    }
  }

  // ─── Fetch cart ──────────────────────────────────────────────────────────
  async function fetchCart() {
    if (!user || user.role !== "customer") return;
    try {
      const { data } = await restaurantApi.get("/api/cart/all");
      setCart(data.cart || []);
      setSubTotal(data.subtotal || 0);
      setQuantity(data.cartLength || 0);
    } catch {
      /* ignore */
    }
  }

  // ─── Get device location ─────────────────────────────────────────────────
  async function fetchLocation() {
    try {
      // Restore cached location first to avoid redundant GPS calls
      const cached = await AsyncStorage.getItem("userLocation");
      const cachedCity = await AsyncStorage.getItem("userCity");
      if (cached && cachedCity) {
        setLocation(JSON.parse(cached));
        setCity(cachedCity);
        return;
      }
    } catch {
      /* ignore */
    }

    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCity("Location Permission Denied");
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;

      // Reverse geocode via bigdatacloud
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      );
      const geo = await res.json();
      const detectedCity =
        geo.city || geo.locality || geo.principalSubdivision || "Your Location";
      const parts = [
        geo.locality,
        geo.principalSubdivision,
        geo.countryName,
      ].filter(Boolean);
      const formattedAddress =
        parts.length > 0 ? parts.join(", ") : "Current Location";

      const loc: LocationData = { latitude, longitude, formattedAddress };
      await updateLocation(loc, detectedCity);
    } catch {
      setCity("Failed to load");
    } finally {
      setLoadingLocation(false);
    }
  }

  // ─── Update Location ──────────────────────────────────────────────────────
  async function updateLocation(loc: LocationData, cityName: string) {
    setLocation(loc);
    setCity(cityName);
    try {
      await AsyncStorage.setItem("userLocation", JSON.stringify(loc));
      await AsyncStorage.setItem("userCity", cityName);
    } catch {
      // Ignore async storage errors
    }
  }

  // ─── Login helper ────────────────────────────────────────────────────────
  async function loginWithToken(token: string, userData: User) {
    await setToken(token);
    setUser(userData);
    setIsAuth(true);
  }

  // ─── Logout ──────────────────────────────────────────────────────────────
  async function logout() {
    await removeToken();
    setUser(null);
    setIsAuth(false);
    setCart([]);
    setSubTotal(0);
    setQuantity(0);
  }

  // ─── Init ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchUser();
    fetchLocation();
  }, []);

  useEffect(() => {
    if (user?.role === "customer") fetchCart();
  }, [user]);

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        loading,
        location,
        loadingLocation,
        city,
        cart,
        subTotal,
        quantity,
        setUser,
        setIsAuth,
        setLocation,
        setCity,
        updateLocation,
        fetchCart,
        logout,
        loginWithToken,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
};
