import { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { MapPin, Navigation, Search, X, Check } from "lucide-react-native";
import { useAppData } from "@/context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LocationPicker({ visible, onClose }: Props) {
  const { setLocation, setCity } = useAppData();

  const [manualText, setManualText] = useState("");
  const [searching, setSearching] = useState(false);
  const [detectingGPS, setDetectingGPS] = useState(false);
  const [results, setResults] = useState<
    { display_name: string; lat: string; lon: string }[]
  >([]);

  const detectCurrentLocation = async () => {
    setDetectingGPS(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please allow location access in Settings.",
        );
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;

      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
      );
      const geo = await res.json();
      const parts = [
        geo.locality,
        geo.principalSubdivision,
        geo.countryName,
      ].filter(Boolean);
      const formattedAddress = parts.join(", ") || "Current Location";
      const cityName =
        geo.city || geo.locality || geo.principalSubdivision || "Your Location";

      const loc = { latitude, longitude, formattedAddress };
      setLocation(loc);
      setCity(cityName);
      await AsyncStorage.setItem("userLocation", JSON.stringify(loc));
      await AsyncStorage.setItem("userCity", cityName);
      onClose();
    } catch {
      Alert.alert("Error", "Could not detect location. Please try manually.");
    } finally {
      setDetectingGPS(false);
    }
  };

  const searchAddress = async () => {
    if (!manualText.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(manualText)}&format=json&limit=5&addressdetails=1`,
      );
      const data = await res.json();
      setResults(data);
    } catch {
      Alert.alert("Error", "Could not search for this address.");
    } finally {
      setSearching(false);
    }
  };

  const selectResult = async (item: {
    display_name: string;
    lat: string;
    lon: string;
  }) => {
    const latitude = parseFloat(item.lat);
    const longitude = parseFloat(item.lon);
    const parts = item.display_name.split(", ");
    const cityName = parts[0] || "Your Location";

    const loc = { latitude, longitude, formattedAddress: item.display_name };
    setLocation(loc);
    setCity(cityName);
    await AsyncStorage.setItem("userLocation", JSON.stringify(loc));
    await AsyncStorage.setItem("userCity", cityName);
    setResults([]);
    setManualText("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-white"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-6 pb-4 border-b border-slate-100">
          <View>
            <Text
              className="text-xl text-slate-900"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              Set Delivery Location
            </Text>
            <Text
              className="text-sm text-slate-400 mt-0.5"
              style={{ fontFamily: "Outfit_400Regular" }}
            >
              Choose where you want to order from
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
          >
            <X size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Detect GPS */}
          <TouchableOpacity
            onPress={detectCurrentLocation}
            disabled={detectingGPS}
            activeOpacity={0.8}
            className="flex-row items-center gap-4 bg-orange-50 border border-orange-200 rounded-2xl p-4"
          >
            <View className="w-12 h-12 rounded-full bg-orange-100 items-center justify-center">
              {detectingGPS ? (
                <ActivityIndicator size="small" color="#FF5A1F" />
              ) : (
                <Navigation size={22} color="#FF5A1F" />
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-slate-900"
                style={{ fontFamily: "Outfit_700Bold" }}
              >
                Use Current Location
              </Text>
              <Text
                className="text-sm text-slate-500 mt-0.5"
                style={{ fontFamily: "Outfit_400Regular" }}
              >
                Detect via GPS automatically
              </Text>
            </View>
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 h-px bg-slate-200" />
            <Text
              className="text-slate-400 text-xs"
              style={{ fontFamily: "Outfit_500Medium" }}
            >
              OR SEARCH
            </Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          {/* Manual search */}
          <View className="flex-row items-center gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 h-13">
            <Search size={16} color="#94a3b8" />
            <TextInput
              className="flex-1 text-slate-800 text-sm py-3"
              style={{ fontFamily: "Outfit_400Regular" }}
              placeholder="Search city, area, or address..."
              placeholderTextColor="#94a3b8"
              value={manualText}
              onChangeText={setManualText}
              onSubmitEditing={searchAddress}
              returnKeyType="search"
            />
            {searching && <ActivityIndicator size="small" color="#94a3b8" />}
          </View>

          {manualText.trim().length > 0 && !searching && (
            <TouchableOpacity
              onPress={searchAddress}
              className="bg-slate-900 rounded-2xl py-3.5 items-center"
            >
              <Text
                className="text-white"
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                Search
              </Text>
            </TouchableOpacity>
          )}

          {/* Results */}
          {results.length > 0 && (
            <View className="gap-2">
              {results.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => selectResult(item)}
                  activeOpacity={0.7}
                  className="flex-row items-center gap-3 bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
                >
                  <View className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center shrink-0">
                    <MapPin size={16} color="#475569" />
                  </View>
                  <Text
                    className="flex-1 text-slate-800 text-sm"
                    style={{ fontFamily: "Outfit_400Regular" }}
                    numberOfLines={2}
                  >
                    {item.display_name}
                  </Text>
                  <Check size={16} color="#10b981" />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {results.length === 0 && !searching && manualText.length === 0 && (
            <View className="items-center py-8">
              <Text className="text-4xl mb-3">📍</Text>
              <Text
                className="text-slate-400 text-sm text-center"
                style={{ fontFamily: "Outfit_400Regular" }}
              >
                Use GPS detection or search for an address to set your delivery
                location.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
