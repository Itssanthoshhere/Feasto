import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Package,
  MapPin,
  ChevronRight,
  LogOut,
  Shield,
} from "lucide-react-native";
import { useAppData } from "@/context/AppContext";
import { useBiometric } from "@/hooks/useBiometric";

export default function ProfileScreen() {
  const { user, logout } = useAppData();
  const router = useRouter();
  const { isBiometricEnabled, toggleBiometric } = useBiometric();

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "?";

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const menuItems = [
    {
      icon: "📦",
      label: "My Orders",
      onPress: () => router.push("/(tabs)/orders"),
    },
    {
      icon: "📍",
      label: "Manage Addresses",
      onPress: () => router.push("/address"),
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100">
        <Text
          className="text-2xl text-slate-900"
          style={{ fontFamily: "Outfit_800ExtraBold" }}
        >
          Profile
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Avatar card */}
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-4">
          <View className="items-center py-8 bg-gradient-to-b from-orange-50 to-white border-b border-slate-100">
            {user?.image ? (
              <Image
                source={{ uri: user.image }}
                className="w-24 h-24 rounded-full border-4 border-white shadow-md"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF5A1F] to-[#D9480F] items-center justify-center border-4 border-white shadow-md">
                <Text
                  className="text-4xl text-white"
                  style={{ fontFamily: "Outfit_800ExtraBold" }}
                >
                  {firstLetter}
                </Text>
              </View>
            )}
            <Text
              className="text-2xl text-slate-800 mt-4"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              {user?.name || "User"}
            </Text>
            <Text
              className="text-slate-500 mt-1"
              style={{ fontFamily: "Outfit_400Regular" }}
            >
              {user?.email}
            </Text>
            {user?.role && (
              <View className="mt-3 bg-orange-50 border border-orange-200 px-4 py-1.5 rounded-full">
                <Text
                  className="text-[#FF5A1F] text-xs uppercase tracking-widest"
                  style={{ fontFamily: "Outfit_700Bold" }}
                >
                  {user.role}
                </Text>
              </View>
            )}
          </View>

          {/* Menu items */}
          <View className="p-2">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                className="flex-row items-center justify-between p-4 rounded-2xl active:bg-slate-50"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-11 h-11 rounded-full bg-orange-50 items-center justify-center">
                    <Text className="text-xl">{item.icon}</Text>
                  </View>
                  <Text
                    className="text-slate-700"
                    style={{ fontFamily: "Outfit_600SemiBold" }}
                  >
                    {item.label}
                  </Text>
                </View>
                <ChevronRight size={20} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 mb-4 p-2">
          <View className="flex-row items-center justify-between p-4 rounded-2xl active:bg-slate-50">
            <View className="flex-row items-center gap-4">
              <View className="w-11 h-11 rounded-full bg-slate-50 items-center justify-center">
                <Shield size={20} color="#64748b" />
              </View>
              <View>
                <Text
                  className="text-slate-700"
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  App Lock
                </Text>
                <Text
                  className="text-slate-400 text-xs mt-0.5"
                  style={{ fontFamily: "Outfit_400Regular" }}
                >
                  Require authentication to open
                </Text>
              </View>
            </View>
            <Switch
              value={isBiometricEnabled}
              onValueChange={async (val) => {
                try {
                  await toggleBiometric(val);
                } catch (e: any) {
                  Alert.alert("Error", e.message);
                }
              }}
              trackColor={{ false: "#e2e8f0", true: "#FF5A1F" }}
            />
          </View>
        </View>

        {/* Logout */}
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center justify-between p-4 rounded-2xl"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center gap-4">
              <View className="w-11 h-11 rounded-full bg-red-50 items-center justify-center">
                <LogOut size={18} color="#ef4444" />
              </View>
              <Text
                className="text-red-600"
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
