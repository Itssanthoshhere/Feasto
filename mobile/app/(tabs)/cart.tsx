import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useAppData } from "@/context/AppContext";
import { restaurantApi } from "@/lib/api";
import type { ICart, IMenuItem, IRestaurant } from "@/lib/types";

export default function CartScreen() {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const router = useRouter();
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="px-5 pt-4 pb-4 border-b border-slate-100 bg-white">
          <Text
            className="text-2xl text-slate-900"
            style={{ fontFamily: "Outfit_800ExtraBold" }}
          >
            Cart
          </Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <ShoppingCart size={64} color="#cbd5e1" />
          <Text
            className="text-xl text-slate-800 mt-4 mb-2"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            Your cart is empty
          </Text>
          <Text
            className="text-slate-500 text-center mb-6"
            style={{ fontFamily: "Outfit_400Regular" }}
          >
            Explore nearby restaurants and add your favourite dishes.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/")}
            className="bg-[#FF5A1F] px-6 py-3.5 rounded-2xl"
          >
            <Text
              className="text-white"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              Browse Restaurants
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const changeQty = async (itemId: string, action: "inc" | "dec") => {
    setLoadingItemId(itemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await restaurantApi.put(`/api/cart/${action}`, { itemId });
      await fetchCart();
    } catch {
      Alert.alert("Error", "Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = () => {
    Alert.alert("Clear Cart", "Are you sure you want to clear your cart?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setClearingCart(true);
          try {
            await restaurantApi.delete("/api/cart/clear");
            await fetchCart();
          } catch {
            Alert.alert("Error", "Something went wrong");
          } finally {
            setClearingCart(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-5 pt-4 pb-4 border-b border-slate-100 bg-white">
        <Text
          className="text-2xl text-slate-900"
          style={{ fontFamily: "Outfit_800ExtraBold" }}
        >
          Cart
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 140, gap: 12 }}
      >
        {/* Restaurant info */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text
                className="text-lg text-slate-900"
                style={{ fontFamily: "Outfit_700Bold" }}
              >
                {restaurant.name}
              </Text>
              <View className="flex-row items-center mt-1">
                <MapPin size={12} color="#FF5A1F" />
                <Text
                  className="text-xs text-slate-500 ml-1 flex-1"
                  numberOfLines={1}
                  style={{ fontFamily: "Outfit_400Regular" }}
                >
                  {restaurant.autoLocation.formattedAddress}
                </Text>
              </View>
            </View>
            <View
              className={`px-3 py-1 rounded-full ${restaurant.isOpen ? "bg-green-50" : "bg-red-50"}`}
            >
              <Text
                className={`text-xs font-bold ${restaurant.isOpen ? "text-green-600" : "text-red-600"}`}
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                {restaurant.isOpen ? "Open" : "Closed"}
              </Text>
            </View>
          </View>
        </View>

        {/* Cart items */}
        <View className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          {cart.map((cartItem: ICart, index) => {
            const item = cartItem.itemId as IMenuItem;
            const isLoading = loadingItemId === item._id;
            return (
              <View
                key={item._id}
                className={`flex-row items-center p-4 ${index < cart.length - 1 ? "border-b border-slate-50" : ""}`}
              >
                <View className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-full h-full items-center justify-center">
                      <Text className="text-2xl">🍽️</Text>
                    </View>
                  )}
                </View>
                <View className="flex-1 mx-3">
                  <Text
                    className="text-slate-800"
                    numberOfLines={1}
                    style={{ fontFamily: "Outfit_600SemiBold" }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className="text-slate-500 text-xs mt-0.5"
                    style={{ fontFamily: "Outfit_400Regular" }}
                  >
                    ₹{item.price} each
                  </Text>
                </View>
                <View className="flex-row items-center gap-2">
                  <TouchableOpacity
                    onPress={() => changeQty(item._id, "dec")}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full border border-slate-200 items-center justify-center"
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FF5A1F" />
                    ) : (
                      <Minus size={14} color="#64748b" />
                    )}
                  </TouchableOpacity>
                  <Text
                    className="w-7 text-center text-slate-800"
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    {cartItem.quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => changeQty(item._id, "inc")}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full border border-slate-200 items-center justify-center"
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#FF5A1F" />
                    ) : (
                      <Plus size={14} color="#64748b" />
                    )}
                  </TouchableOpacity>
                </View>
                <Text
                  className="w-16 text-right text-slate-800"
                  style={{ fontFamily: "Outfit_700Bold" }}
                >
                  ₹{item.price * cartItem.quantity}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Clear cart */}
        <TouchableOpacity
          onPress={clearCart}
          disabled={clearingCart}
          className="flex-row items-center gap-2 self-start px-4 py-2.5 rounded-xl"
        >
          <Trash2 size={14} color="#ef4444" />
          <Text
            className="text-red-500 text-sm"
            style={{ fontFamily: "Outfit_600SemiBold" }}
          >
            {clearingCart ? "Clearing..." : "Clear Cart"}
          </Text>
        </TouchableOpacity>

        {/* Order Summary */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <Text
            className="text-lg mb-4 text-slate-900"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            Order Summary
          </Text>
          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text
                className="text-slate-600 text-sm"
                style={{ fontFamily: "Outfit_500Medium" }}
              >
                Items ({quantity})
              </Text>
              <Text
                className="text-slate-800 text-sm"
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                ₹{subTotal}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text
                className="text-slate-600 text-sm"
                style={{ fontFamily: "Outfit_500Medium" }}
              >
                Delivery Fee
              </Text>
              <Text
                className={`text-sm ${deliveryFee === 0 ? "text-green-600" : "text-slate-800"}`}
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text
                className="text-slate-600 text-sm"
                style={{ fontFamily: "Outfit_500Medium" }}
              >
                Platform Fee
              </Text>
              <Text
                className="text-slate-800 text-sm"
                style={{ fontFamily: "Outfit_600SemiBold" }}
              >
                ₹{platformFee}
              </Text>
            </View>

            {subTotal < 250 && (
              <View className="bg-orange-50 rounded-xl px-3 py-2">
                <Text
                  className="text-[#FF5A1F] text-xs"
                  style={{ fontFamily: "Outfit_500Medium" }}
                >
                  Add items worth ₹{250 - subTotal} to get free delivery 🚀
                </Text>
              </View>
            )}

            <View className="flex-row justify-between pt-3 border-t border-slate-100">
              <Text
                className="text-slate-900"
                style={{ fontFamily: "Outfit_800ExtraBold" }}
              >
                Grand Total
              </Text>
              <Text
                className="text-slate-900"
                style={{ fontFamily: "Outfit_800ExtraBold" }}
              >
                ₹{grandTotal}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Checkout CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 py-4"
        style={{ paddingBottom: 32 }}
      >
        <TouchableOpacity
          onPress={() => router.push("/checkout")}
          disabled={!restaurant.isOpen}
          className={`py-4 rounded-2xl items-center ${restaurant.isOpen ? "bg-[#FF5A1F]" : "bg-slate-300"}`}
        >
          <Text
            className="text-white text-base"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            {!restaurant.isOpen
              ? "Restaurant is Closed"
              : `Proceed to Checkout  ₹${grandTotal}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
