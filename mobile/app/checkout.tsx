import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStripe } from "@stripe/stripe-react-native";
import {
  ArrowLeft,
  MapPin,
  Tag,
  CreditCard,
  ShieldCheck,
} from "lucide-react-native";
import { restaurantApi, utilsApi } from "@/lib/api";
import { useAppData } from "@/context/AppContext";
import type { ICart, IMenuItem, IRestaurant } from "@/lib/types";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

export default function CheckoutScreen() {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddress, setLoadingAddress] = useState(true);

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const [placingOrder, setPlacingOrder] = useState(false);

  const fetchAddresses = async () => {
    try {
      const { data } = await restaurantApi.get("/api/address/all");
      setAddresses(data || []);
      if (data?.length > 0) setSelectedAddressId(data[0]._id);
    } catch {
      /* ignore */
    } finally {
      setLoadingAddress(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (!cart || cart.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-5xl mb-4">🛒</Text>
        <Text
          className="text-xl text-slate-800 text-center mb-2"
          style={{ fontFamily: "Outfit_700Bold" }}
        >
          Your cart is empty
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          className="mt-4 bg-[#FF5A1F] px-6 py-3 rounded-xl"
        >
          <Text
            className="text-white"
            style={{ fontFamily: "Outfit_600SemiBold" }}
          >
            Browse Restaurants
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;
  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = Math.max(
    0,
    subTotal + deliveryFee + platformFee - discountAmount,
  );

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setPromoError("");
    try {
      const { data } = await restaurantApi.post("/api/promotion/validate", {
        code: promoCode.trim(),
        restaurantId: restaurant._id,
        subtotal: subTotal,
      });
      setAppliedPromo(promoCode.trim().toUpperCase());
      setDiscountAmount(data.discountAmount || 0);
    } catch (e: any) {
      setPromoError(e?.response?.data?.message || "Invalid promo code");
    } finally {
      setValidatingPromo(false);
    }
  };

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const placeOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert(
        "Select Address",
        "Please select a delivery address to continue.",
      );
      return;
    }
    setPlacingOrder(true);
    try {
      // Step 1: Create the order
      const { data: orderData } = await restaurantApi.post("/api/order/new", {
        paymentMethod: "stripe",
        addressId: selectedAddressId,
        distance: 0,
        promoCode: appliedPromo,
      });

      const { orderId } = orderData;

      // Step 2: Create Stripe payment intent
      const { data: intentData } = await utilsApi.post(
        "/api/payment/stripe/intent",
        { orderId },
      );

      // Step 3: Initialize PaymentSheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: "Feasto",
        paymentIntentClientSecret: intentData.clientSecret,
        returnURL: "feasto://stripe-redirect",
      });

      if (initError) {
        Alert.alert("Payment Error", initError.message);
        setPlacingOrder(false);
        return;
      }

      // Step 4: Present PaymentSheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        Alert.alert(`Payment failed`, paymentError.message);
      } else {
        // Step 5: Verify payment on backend
        await utilsApi.post("/api/payment/stripe/verify-intent", {
          paymentIntentId: intentData.clientSecret.split("_secret_")[0],
          orderId,
        });
        await fetchCart();
        router.replace("/ordersuccess" as any);
      }
    } catch (e: any) {
      Alert.alert(
        "Order Failed",
        e?.response?.data?.message ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
        >
          <ArrowLeft size={18} color="#475569" />
        </TouchableOpacity>
        <Text
          className="text-xl text-slate-900"
          style={{ fontFamily: "Outfit_700Bold" }}
        >
          Checkout
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 160, gap: 12 }}
      >
        {/* Delivery Address */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <View className="flex-row items-center gap-2 mb-4">
            <MapPin size={18} color="#FF5A1F" />
            <Text
              className="text-lg text-slate-900"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              Delivery Address
            </Text>
          </View>

          {loadingAddress ? (
            <ActivityIndicator color="#FF5A1F" />
          ) : addresses.length === 0 ? (
            <View className="items-center py-4">
              <Text
                className="text-slate-500 text-center mb-3"
                style={{ fontFamily: "Outfit_400Regular" }}
              >
                No saved addresses. Add one first.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/address")}
                className="bg-[#FF5A1F] px-5 py-2.5 rounded-xl"
              >
                <Text
                  className="text-white"
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  Add Address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="gap-2">
              {addresses.map((addr) => (
                <TouchableOpacity
                  key={addr._id}
                  onPress={() => setSelectedAddressId(addr._id)}
                  className={`flex-row items-center gap-3 p-4 rounded-2xl border ${selectedAddressId === addr._id ? "bg-orange-50 border-[#FF5A1F]" : "border-slate-200"}`}
                >
                  <View
                    className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selectedAddressId === addr._id ? "border-[#FF5A1F]" : "border-slate-300"}`}
                  >
                    {selectedAddressId === addr._id && (
                      <View className="w-2.5 h-2.5 rounded-full bg-[#FF5A1F]" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-slate-800 text-sm"
                      numberOfLines={2}
                      style={{ fontFamily: "Outfit_500Medium" }}
                    >
                      {addr.formattedAddress}
                    </Text>
                    <Text
                      className="text-slate-500 text-xs mt-0.5"
                      style={{ fontFamily: "Outfit_400Regular" }}
                    >
                      📞 {addr.mobile}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => router.push("/address")}
                className="border border-dashed border-slate-300 rounded-2xl p-3 items-center"
              >
                <Text
                  className="text-slate-500 text-sm"
                  style={{ fontFamily: "Outfit_500Medium" }}
                >
                  + Add New Address
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Promo Code */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <View className="flex-row items-center gap-2 mb-4">
            <Tag size={18} color="#FF5A1F" />
            <Text
              className="text-lg text-slate-900"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              Promo Code
            </Text>
          </View>

          {appliedPromo ? (
            <View className="bg-green-50 border border-green-200 rounded-2xl p-3 flex-row items-center justify-between">
              <View>
                <Text
                  className="text-green-700 text-sm"
                  style={{ fontFamily: "Outfit_700Bold" }}
                >
                  🎉 {appliedPromo} applied!
                </Text>
                <Text
                  className="text-green-600 text-xs mt-0.5"
                  style={{ fontFamily: "Outfit_400Regular" }}
                >
                  You save ₹{discountAmount}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setAppliedPromo(null);
                  setDiscountAmount(0);
                  setPromoCode("");
                }}
              >
                <Text
                  className="text-red-500 text-sm"
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 h-11 text-slate-800 text-sm"
                  style={{ fontFamily: "Outfit_400Regular" }}
                  placeholder="Enter promo code"
                  placeholderTextColor="#94a3b8"
                  value={promoCode}
                  onChangeText={(t) => {
                    setPromoCode(t.toUpperCase());
                    setPromoError("");
                  }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={applyPromo}
                  disabled={validatingPromo || !promoCode}
                  className="bg-[#FF5A1F] px-4 rounded-xl items-center justify-center"
                >
                  {validatingPromo ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text
                      className="text-white"
                      style={{ fontFamily: "Outfit_600SemiBold" }}
                    >
                      Apply
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
              {promoError ? (
                <Text
                  className="text-red-500 text-xs mt-2"
                  style={{ fontFamily: "Outfit_400Regular" }}
                >
                  {promoError}
                </Text>
              ) : null}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
          <Text
            className="text-lg text-slate-900 mb-4"
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
            {discountAmount > 0 && (
              <View className="flex-row justify-between">
                <Text
                  className="text-green-600 text-sm"
                  style={{ fontFamily: "Outfit_500Medium" }}
                >
                  Promo Discount
                </Text>
                <Text
                  className="text-green-600 text-sm"
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  -₹{discountAmount}
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

        {/* Trust badges */}
        <View className="flex-row items-center justify-center gap-4 py-2">
          <View className="flex-row items-center gap-1">
            <ShieldCheck size={14} color="#10b981" />
            <Text
              className="text-slate-500 text-xs"
              style={{ fontFamily: "Outfit_400Regular" }}
            >
              Secure Checkout
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <CreditCard size={14} color="#6366f1" />
            <Text
              className="text-slate-500 text-xs"
              style={{ fontFamily: "Outfit_400Regular" }}
            >
              Multiple Payment Options
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-5 pt-4"
        style={{ paddingBottom: 34 }}
      >
        <TouchableOpacity
          onPress={placeOrder}
          disabled={placingOrder || addresses.length === 0}
          activeOpacity={0.85}
          className={`py-4 rounded-2xl items-center flex-row justify-center gap-2 ${addresses.length > 0 ? "bg-[#FF5A1F]" : "bg-slate-300"}`}
        >
          {placingOrder ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <CreditCard size={18} color="#fff" />
              <Text
                className="text-white text-base"
                style={{ fontFamily: "Outfit_700Bold" }}
              >
                Pay ₹{grandTotal} with Stripe
              </Text>
            </>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/orders" as any)}
          className="mt-2 py-2 items-center"
        >
          <Text
            className="text-slate-400 text-xs"
            style={{ fontFamily: "Outfit_500Medium" }}
          >
            Already paid? View your orders →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
