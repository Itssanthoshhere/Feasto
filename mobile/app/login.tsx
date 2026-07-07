import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { authApi, setToken } from "@/lib/api";
import { useAppData } from "@/context/AppContext";

WebBrowser.maybeCompleteAuthSession();

// Web client ID — used for token-based flow on mobile.
// The backend fetches user info directly via the access_token,
// so no redirect-URI mismatch occurs.
const WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ??
  "928973722294-nlnaa96ddbkei6vouieh3p11efbp3atn.apps.googleusercontent.com";

// Google's OAuth discovery document (manually inlined — expo-auth-session
// doesn't re-export it from the root in SDK 57)
const discovery = {
  authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint: "https://oauth2.googleapis.com/token",
  revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { loginWithToken } = useAppData();

  const [request, , promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: WEB_CLIENT_ID,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({ scheme: "feasto" }),
      // Token flow: mobile gets access_token directly — no code exchange
      // needed, so the backend redirect URI ("postmessage") is never involved.
      responseType: AuthSession.ResponseType.Token,
      prompt: AuthSession.Prompt.SelectAccount,
    },
    discovery,
  );

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await promptAsync();

      if (result.type === "cancel" || result.type === "dismiss") {
        return;
      }

      if (result.type !== "success" || !result.params.access_token) {
        setError("Google sign-in was unsuccessful. Please try again.");
        return;
      }

      // Send access_token to backend — backend fetches user info with it directly
      const { data } = await authApi.post("/api/auth/mobile-login", {
        access_token: result.params.access_token,
      });

      await setToken(data.token);
      await loginWithToken(data.token, data.user);
      router.replace("/(tabs)");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        "Failed to sign in with Google. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
          disabled={loading || !request}
          activeOpacity={0.85}
          className="flex-row items-center justify-center gap-3 bg-white rounded-2xl px-8 py-4 w-full shadow-xl"
          style={{ opacity: loading || !request ? 0.7 : 1 }}
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
