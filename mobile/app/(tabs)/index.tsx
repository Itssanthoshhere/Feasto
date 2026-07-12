import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, MapPin, ChevronDown } from "lucide-react-native";
import { useAppData } from "@/context/AppContext";
import { restaurantApi } from "@/lib/api";
import type { IRestaurant } from "@/lib/types";
import RestaurantCard from "@/components/RestaurantCard";
import { RestaurantCardSkeleton } from "@/components/SkeletonBlock";
import { SafeAreaView } from "react-native-safe-area-context";
import LocationPicker from "@/components/LocationPicker";

const CATEGORIES = [
  "Indian",
  "Pizza",
  "Burger",
  "Healthy",
  "Asian",
  "Dessert",
  "Sushi",
];

const getDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return +(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

export default function HomeScreen() {
  const { location, loadingLocation, city } = useAppData();
  const router = useRouter();

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [locationPickerVisible, setLocationPickerVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestTokenRef = useRef(0);

  const fetchRestaurants = useCallback(
    async (q = search) => {
      const token = ++requestTokenRef.current;
      if (!location) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const { data } = await restaurantApi.get("/api/restaurant/all", {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search: q,
          },
        });
        if (token === requestTokenRef.current) {
          setRestaurants(data.restaurants ?? []);
        }
      } catch (e: any) {
        if (token === requestTokenRef.current) {
          setError(e?.response?.data?.message || "Failed to fetch restaurants");
        }
      } finally {
        if (token === requestTokenRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [location, search],
  );

  useEffect(() => {
    fetchRestaurants();
  }, [location]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchRestaurants();
  };

  const handleSearch = () => fetchRestaurants(search);

  const handleCategory = (cat: string) => {
    const next = activeCategory === cat ? "" : cat;
    setActiveCategory(next);
    setSearch(next);
    fetchRestaurants(next);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <LocationPicker
        visible={locationPickerVisible}
        onClose={() => {
          setLocationPickerVisible(false);
        }}
      />
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-5 border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => setLocationPickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text
              className="text-xs text-slate-400"
              style={{ fontFamily: "Outfit_500Medium" }}
            >
              DELIVERING TO
            </Text>
            <View className="flex-row items-center gap-1 mt-0.5">
              <MapPin size={14} color="#FF5A1F" />
              <Text
                className="text-sm text-slate-800 max-w-[180px]"
                numberOfLines={1}
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                {city}
              </Text>
              <ChevronDown size={14} color="#94a3b8" />
            </View>
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center overflow-hidden">
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Search bar */}
        <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 h-12">
          <Search size={16} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-2 text-slate-800 text-sm"
            style={{ fontFamily: "Outfit_400Regular" }}
            placeholder="Search restaurants, cuisines..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setActiveCategory("");
                fetchRestaurants("");
              }}
            >
              <Text className="text-slate-400 text-lg">✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-3 -mx-2"
          contentContainerStyle={{ paddingHorizontal: 8 }}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                onPress={() => handleCategory(cat)}
                className={`mr-2 px-4 py-2 rounded-full border ${active ? "bg-[#FF5A1F] border-[#FF5A1F]" : "bg-white border-slate-200"}`}
              >
                <Text
                  className={`text-xs ${active ? "text-white" : "text-slate-600"}`}
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading || loadingLocation ? (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {[1, 2, 3, 4].map((i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </ScrollView>
      ) : error ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5A1F"
            />
          }
          contentContainerStyle={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text className="text-4xl mb-4">⚠️</Text>
          <Text
            className="text-xl text-slate-800 text-center mb-2"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            Failed to load
          </Text>
          <Text
            className="text-slate-500 text-center"
            style={{ fontFamily: "Outfit_400Regular" }}
          >
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchRestaurants()}
            className="mt-5 bg-slate-100 px-6 py-3 rounded-xl"
          >
            <Text
              className="text-slate-700"
              style={{ fontFamily: "Outfit_600SemiBold" }}
            >
              Try Again
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : restaurants.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5A1F"
            />
          }
          contentContainerStyle={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <Text className="text-5xl mb-4">🔍</Text>
          <Text
            className="text-xl text-slate-800 text-center mb-2"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            No restaurants found
          </Text>
          <Text
            className="text-slate-500 text-center"
            style={{ fontFamily: "Outfit_400Regular" }}
          >
            {search
              ? `No results for "${search}" near you.`
              : "No restaurants available in your area right now."}
          </Text>
          {search ? (
            <TouchableOpacity
              onPress={() => {
                setSearch("");
                setActiveCategory("");
                fetchRestaurants("");
              }}
              className="mt-5 bg-slate-100 px-6 py-3 rounded-xl"
            >
              <Text
                className="text-slate-700"
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                Clear Search
              </Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item._id}
          numColumns={1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FF5A1F"
            />
          }
          contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
          ListHeaderComponent={
            <Text
              className="text-lg text-slate-800 mb-1"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              {search ? `Results for "${search}"` : "Nearby Restaurants"}
              <Text
                className="text-slate-400 text-sm"
                style={{ fontFamily: "Outfit_400Regular" }}
              >
                {" "}
                ({restaurants.length})
              </Text>
            </Text>
          }
          renderItem={({ item }) => {
            const [resLng, resLat] = item.autoLocation.coordinates;
            const distance = location
              ? getDistanceKm(
                  location.latitude,
                  location.longitude,
                  resLat,
                  resLng,
                )
              : null;
            let eta = "N/A";
            if (distance !== null) {
              let prep = 15;
              if (item.kitchenLoad === "busy") prep = 30;
              if (item.kitchenLoad === "very_busy") prep = 45;
              const total = prep + Math.ceil(distance * 3);
              eta = `${total - 5}–${total + 5} min`;
            }
            return (
              <RestaurantCard
                id={item._id}
                name={item.name}
                image={item.image ?? ""}
                eta={eta}
                rating={item.rating || 0}
                totalReviews={item.totalReviews || 0}
                isOpen={item.isOpen}
                distance={distance ? `${distance} km` : ""}
              />
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
