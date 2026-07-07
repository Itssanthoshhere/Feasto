import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Image,
  // Platform,
  // TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
// import { authApi, setToken } from "@/lib/api";
import { useAppData } from "@/context/AppContext";

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { loginWithToken } = useAppData();

  const handleGoogleLogin = async () => {
    Alert.alert(
      // "Native Google Sign-In Required",
      // "Because we upgraded to the native Google SDK, this button doesn't work in Expo Go.\n\nPlease use the 'Developer Bypass' below and paste your web token!",
      "Coming Soon",
      "Google Sign-In requires a development build. Run `npx expo run:ios` to enable native Google authentication.",
    );
  };

  return (
    <ImageBackground
      source={require("@/assets/images/bg_food.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Dark overlay */}
      <View className="absolute inset-0 bg-black/60" />

      <View className="flex-1 items-center justify-center px-6">
        {/* Logo + Brand */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 rounded-2xl bg-white shadow-2xl items-center justify-center overflow-hidden mb-4">
            <Image
              source={require("@/assets/images/logo.png")}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
          <Text
            className="text-6xl text-white lowercase italic tracking-tighter"
            style={{ fontFamily: "Outfit_800ExtraBold" }}
          >
            feasto
          </Text>
        </View>

        {/* Headline */}
        <Text
          className="text-4xl text-white text-center leading-tight mb-3"
          style={{ fontFamily: "Outfit_800ExtraBold" }}
        >
          The #1 food{"\n"}delivery app
        </Text>
        <Text
          className="text-xl text-slate-200 text-center mb-12"
          style={{ fontFamily: "Outfit_500Medium" }}
        >
          Experience fast & easy ordering on Feasto
        </Text>

        {/* Error */}
        {error ? (
          <View className="bg-red-500/20 border border-red-400 rounded-2xl px-4 py-3 mb-4 w-full">
            <Text
              className="text-red-200 text-sm text-center"
              style={{ fontFamily: "Outfit_500Medium" }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Google Login Button */}
        <TouchableOpacity
          onPress={handleGoogleLogin}
          disabled={loading}
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-3 bg-white rounded-2xl px-8 py-4 w-full shadow-xl"
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color="#FF5A1F" />
          ) : (
            <Image
              source={require("@/assets/images/google_icon.png")}
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          )}
          <Text
            className="text-slate-900 text-lg"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            {loading ? "Authenticating..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        {/* Dev Bypass section */}

        {/* <View className="mt-8 pt-8 border-t border-slate-700 w-full items-center">
          <Text className="text-slate-400 text-xs mb-2">DEVELOPER BYPASS</Text>
          <TextInput
            placeholder="Paste web token here..."
            placeholderTextColor="#64748b"
            className="w-full bg-slate-800/80 text-white px-4 py-3 rounded-xl mb-3 text-center border border-slate-700"
            secureTextEntry
            onChangeText={(text) => {
              const cleanToken = text.replace(/['"]+/g, "").trim();
              if (cleanToken.length > 20) {
                // Auto-login when a long token is pasted
                setLoading(true);
                setToken(cleanToken).then(() => {
                  authApi
                    .get("/api/auth/me")
                    .then(({ data }) => {
                      loginWithToken(cleanToken, data);
                      router.replace("/(tabs)");
                    })
                    .catch(() => {
                      setError("Invalid bypass token");
                      setLoading(false);
                    });
                });
              }
            }}
          />
        </View> */}

        {/* Legal */}
        <Text
          className="text-slate-400 text-sm text-center mt-8"
          style={{ fontFamily: "Outfit_400Regular" }}
        >
          By continuing, you agree to our{" "}
          <Text className="underline text-slate-300">Terms of Service</Text> and{" "}
          <Text className="underline text-slate-300">Privacy Policy</Text>
        </Text>
      </View>
    </ImageBackground>
  );
}
