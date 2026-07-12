import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from "@expo-google-fonts/outfit";
import { AppProvider } from "@/context/AppContext";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useBiometric } from "@/hooks/useBiometric";
import { View, Text, TouchableOpacity } from "react-native";
import { Lock } from "lucide-react-native";

SplashScreen.preventAutoHideAsync();

function BiometricOverlay() {
  const { isLocked, promptAuth } = useBiometric();

  if (!isLocked) return null;

  return (
    <View
      className="absolute top-0 bottom-0 left-0 right-0 z-50 bg-slate-900 items-center justify-center"
      style={{ elevation: 999 }}
    >
      <Lock size={64} color="#FF5A1F" className="mb-6" />
      <Text
        className="text-white text-2xl mb-8"
        style={{ fontFamily: "Outfit_800ExtraBold" }}
      >
        App Locked
      </Text>
      <TouchableOpacity
        onPress={promptAuth}
        className="bg-[#FF5A1F] px-8 py-4 rounded-2xl"
      >
        <Text
          className="text-white text-lg"
          style={{ fontFamily: "Outfit_700Bold" }}
        >
          Unlock to continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
      merchantIdentifier="merchant.com.feasto.app"
    >
      <AppProvider>
        <StatusBar style="auto" />
        <BiometricOverlay />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="restaurant/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="checkout"
            options={{ title: "Checkout", headerShown: false }}
          />
          <Stack.Screen
            name="order/[id]"
            options={{ title: "Order Details", headerShown: false }}
          />
          <Stack.Screen
            name="address"
            options={{ title: "Manage Addresses", headerShown: false }}
          />
          <Stack.Screen name="ordersuccess" options={{ headerShown: false }} />
        </Stack>
      </AppProvider>
    </StripeProvider>
  );
}
