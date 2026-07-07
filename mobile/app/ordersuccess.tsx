import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle } from "lucide-react-native";

export default function OrderSuccessScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
      <CheckCircle size={80} color="#10B981" />
      <Text
        className="text-3xl text-slate-800 mt-6 text-center"
        style={{ fontFamily: "Outfit_700Bold" }}
      >
        Order Placed!
      </Text>
      <Text
        className="text-base text-slate-500 mt-3 text-center px-4 leading-6"
        style={{ fontFamily: "Outfit_400Regular" }}
      >
        Your payment was successful and the restaurant has received your order.
      </Text>

      <TouchableOpacity
        onPress={() => router.replace("/(tabs)/orders")}
        className="mt-10 bg-[#FF5A1F] w-full py-4 rounded-xl flex-row justify-center"
      >
        <Text
          className="text-white text-lg"
          style={{ fontFamily: "Outfit_600SemiBold" }}
        >
          Track Order
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/(tabs)")}
        className="mt-4 w-full py-4 rounded-xl flex-row justify-center border border-slate-200"
      >
        <Text
          className="text-slate-700 text-lg"
          style={{ fontFamily: "Outfit_600SemiBold" }}
        >
          Back to Home
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
