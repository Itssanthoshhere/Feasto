import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Phone, Store, MapPin, Package } from "lucide-react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { restaurantApi } from "@/lib/api";
import type { IOrder } from "@/lib/types";
import {
  getOrderStatus,
  STATUS_FLOW,
  ACTIVE_STATUSES,
  OrderStatus,
} from "@/lib/orderConstants";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import ReviewForm from "@/components/ReviewForm";
import { OrderDetailSkeleton } from "@/components/SkeletonBlock";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // itemId -> image URL map, fetched from menu
  const [menuImages, setMenuImages] = useState<Record<string, string>>({});

  const isActive = order?.status
    ? ACTIVE_STATUSES.includes(order.status as OrderStatus)
    : false;
  const { riderLocation, orderStatus } = useOrderSocket(id as string, isActive);

  useEffect(() => {
    if (orderStatus && order) {
      setOrder((prev) => (prev ? { ...prev, status: orderStatus } : prev));
    }
  }, [orderStatus]);

  const fetchOrder = async () => {
    try {
      const { data } = await restaurantApi.get(`/api/order/${id}`);
      const fetchedOrder: IOrder = data.order || data;
      setOrder(fetchedOrder);

      // Fetch menu items to get images
      if (fetchedOrder.restaurantId) {
        try {
          const menuRes = await restaurantApi.get(
            `/api/item/all/${fetchedOrder.restaurantId}`,
          );
          const menuItems: { _id: string; image?: string }[] =
            menuRes.data || [];
          const imgMap: Record<string, string> = {};
          menuItems.forEach((m) => {
            if (m._id && m.image) imgMap[m._id] = m.image;
          });
          setMenuImages(imgMap);
        } catch {
          /* images optional */
        }
      }
    } catch (e: any) {
      if (e?.response?.status === 404) {
        setOrder(null);
      } else {
        setError(e?.response?.data?.message || "Failed to fetch order");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <OrderDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-4xl mb-4">⚠️</Text>
        <Text
          className="text-xl text-slate-800 text-center"
          style={{ fontFamily: "Outfit_700Bold" }}
        >
          Oops, something went wrong
        </Text>
        <Text
          className="text-slate-400 text-sm text-center mt-2"
          style={{ fontFamily: "Outfit_400Regular" }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchOrder();
          }}
          className="mt-5 bg-[#FF5A1F] px-6 py-3 rounded-xl"
        >
          <Text
            className="text-white"
            style={{ fontFamily: "Outfit_600SemiBold" }}
          >
            Try Again
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-5xl mb-4">🤷‍♂️</Text>
        <Text
          className="text-xl text-slate-800 text-center"
          style={{ fontFamily: "Outfit_700Bold" }}
        >
          Order not found
        </Text>
        <Text
          className="text-slate-400 text-sm text-center mt-2"
          style={{ fontFamily: "Outfit_400Regular" }}
        >
          This order may have been deleted or the link is invalid.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-5 bg-slate-800 px-6 py-3 rounded-xl"
        >
          <Text
            className="text-white"
            style={{ fontFamily: "Outfit_600SemiBold" }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { meta, stepIndex, isCancelled } = getOrderStatus(order.status);

  const orderTime = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

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
        <View className="flex-1">
          <Text
            className="text-xl text-slate-900"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            Order Details
          </Text>
          <Text className="text-xs text-slate-400 mt-0.5 font-mono">
            #{order._id.toUpperCase()}
          </Text>
        </View>
        {isActive && (
          <TouchableOpacity
            onPress={fetchOrder}
            className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
          >
            <Text
              className="text-emerald-700 text-xs"
              style={{ fontFamily: "Outfit_600SemiBold" }}
            >
              ● Refresh
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status Card ── */}
        <View
          className="rounded-3xl overflow-hidden border"
          style={{
            borderColor: meta.borderColor,
            backgroundColor: meta.bgColor,
          }}
        >
          {/* accent top bar */}
          <View
            className="h-1.5 w-full"
            style={{ backgroundColor: meta.color }}
          />

          <View className="p-6 items-center gap-4">
            {/* icon circle */}
            <View
              className="w-20 h-20 rounded-full items-center justify-center border-4"
              style={{
                backgroundColor: meta.bgColor,
                borderColor: meta.borderColor,
              }}
            >
              <Text className="text-4xl">{meta.icon}</Text>
            </View>

            <View className="items-center">
              <Text
                className="text-2xl"
                style={{ fontFamily: "Outfit_800ExtraBold", color: meta.color }}
              >
                {meta.label}
              </Text>
              <Text
                className="text-sm text-slate-500 text-center mt-1"
                style={{ fontFamily: "Outfit_400Regular" }}
              >
                {isCancelled
                  ? "This order was cancelled."
                  : stepIndex === STATUS_FLOW.length - 1
                    ? "Hope you enjoy your meal! 🎉"
                    : "Your order is being processed and will be with you shortly."}
              </Text>
            </View>

            {/* Progress bar */}
            {!isCancelled && (
              <View className="w-full">
                <View className="flex-row gap-1.5">
                  {STATUS_FLOW.slice(0, 6).map((step, i) => (
                    <View
                      key={step}
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#e2e8f0" }}
                    >
                      <View
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: i <= stepIndex ? "100%" : "0%",
                          backgroundColor: meta.color,
                        }}
                      />
                    </View>
                  ))}
                </View>
                <View className="flex-row justify-between mt-1.5">
                  <Text
                    className="text-[10px] text-slate-400 font-bold"
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    Placed
                  </Text>
                  <Text
                    className="text-[10px] text-slate-400 font-bold"
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    Preparing
                  </Text>
                  <Text
                    className="text-[10px] text-slate-400 font-bold"
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    Delivered
                  </Text>
                </View>
              </View>
            )}

            {/* ETA badge */}
            {!isCancelled &&
              (order as any).estimatedDeliveryTime &&
              order.status !== "delivered" && (
                <View className="flex-row items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 border border-orange-100">
                  <Text className="text-xl">⏱️</Text>
                  <Text
                    className="text-sm text-orange-600"
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    Arriving by{" "}
                    {new Date(
                      (order as any).estimatedDeliveryTime,
                    ).toLocaleTimeString("en-IN", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              )}
          </View>
        </View>

        {/* ── Live Tracking Map ── */}
        {isRiderActive &&
          (order.deliveryAddress as any)?.latitude &&
          (order.deliveryAddress as any)?.longitude && (
            <View className="h-64 rounded-3xl overflow-hidden border border-slate-200 shadow-sm mt-2">
              <MapView
                className="w-full h-full"
                initialRegion={{
                  latitude: (order.deliveryAddress as any).latitude,
                  longitude: (order.deliveryAddress as any).longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                region={
                  riderLocation
                    ? {
                        latitude: riderLocation.latitude,
                        longitude: riderLocation.longitude,
                        latitudeDelta: 0.02,
                        longitudeDelta: 0.02,
                      }
                    : undefined
                }
              >
                {/* Delivery Address Pin */}
                <Marker
                  coordinate={{
                    latitude: (order.deliveryAddress as any).latitude,
                    longitude: (order.deliveryAddress as any).longitude,
                  }}
                  title="Delivery Address"
                >
                  <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center border-2 border-white shadow-md">
                    <Text className="text-xl">📍</Text>
                  </View>
                </Marker>

                {/* Live Rider Pin */}
                {riderLocation && (
                  <Marker
                    coordinate={riderLocation}
                    title={order.riderName || "Rider"}
                  >
                    <View className="w-12 h-12 rounded-full bg-violet-100 items-center justify-center border-2 border-white shadow-md">
                      <Text className="text-2xl">🏍️</Text>
                    </View>
                  </Marker>
                )}
              </MapView>
            </View>
          )}

        {/* ── Info Cards Row ── */}
        <View className="flex-row gap-3">
          {/* Restaurant */}
          <View className="flex-1 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm">
            <View className="w-10 h-10 rounded-2xl bg-orange-50 items-center justify-center mb-3">
              <Store size={20} color="#f97316" />
            </View>
            <Text
              className="text-[10px] text-slate-400 mb-1"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              RESTAURANT
            </Text>
            <Text
              className="text-slate-900 text-sm"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              {order.restaurantName}
            </Text>
            {orderTime ? (
              <Text
                className="text-xs text-slate-400 mt-0.5"
                style={{ fontFamily: "Outfit_400Regular" }}
              >
                Ordered at {orderTime}
              </Text>
            ) : null}
          </View>

          {/* Delivery Address */}
          <View className="flex-1 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm">
            <View className="w-10 h-10 rounded-2xl bg-blue-50 items-center justify-center mb-3">
              <MapPin size={20} color="#3b82f6" />
            </View>
            <Text
              className="text-[10px] text-slate-400 mb-1"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              DELIVERY ADDRESS
            </Text>
            <Text
              className="text-slate-900 text-sm"
              style={{ fontFamily: "Outfit_700Bold" }}
              numberOfLines={2}
            >
              {order.deliveryAddress?.formattedAddress}
            </Text>
            {(order.deliveryAddress as any)?.mobile && (
              <Text
                className="text-xs text-slate-400 mt-0.5"
                style={{ fontFamily: "Outfit_400Regular" }}
              >
                📱 {(order.deliveryAddress as any).mobile}
              </Text>
            )}
          </View>
        </View>

        {/* ── Rider Card ── */}
        {order.riderName && (
          <View style={{ borderRadius: 24, overflow: "hidden" }}>
            <View
              style={{
                padding: 1.5,
                borderRadius: 24,
                backgroundColor: "#8b5cf6",
              }}
              className="bg-violet-500"
            >
              <View className="bg-white rounded-[22px] p-4 flex-row items-center gap-3">
                <View className="w-14 h-14 rounded-full bg-violet-100 items-center justify-center border-2 border-violet-200 overflow-hidden">
                  {order.riderPicture ? (
                    <Image
                      source={{ uri: order.riderPicture }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Text className="text-2xl">🏍️</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text
                    className="text-xs text-violet-500"
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    YOUR DELIVERY PARTNER
                  </Text>
                  <Text
                    className="text-slate-900 text-lg mt-0.5"
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    {order.riderName}
                  </Text>
                </View>
                {order.riderPhone && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${order.riderPhone}`)}
                    className="w-10 h-10 rounded-full bg-violet-100 items-center justify-center"
                  >
                    <Phone size={18} color="#7c3aed" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── Order Summary ── */}
        <View className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Header row */}
          <View className="p-5 border-b border-slate-100 flex-row items-center gap-3">
            <Package size={20} color="#94a3b8" />
            <Text
              className="text-lg text-slate-900"
              style={{ fontFamily: "Outfit_700Bold" }}
            >
              Order Summary
            </Text>
          </View>

          <View className="p-5 gap-4">
            {/* Items */}
            <View className="gap-3">
              {order.items.map((item, idx) => {
                const imgUri = item.itemId
                  ? menuImages[item.itemId]
                  : item.image;
                return (
                  <View key={idx} className="flex-row items-center gap-3">
                    {imgUri ? (
                      <Image
                        source={{ uri: imgUri }}
                        className="w-14 h-14 rounded-xl"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="w-14 h-14 rounded-xl bg-slate-100 items-center justify-center">
                        <Text className="text-xl">🍽️</Text>
                      </View>
                    )}
                    <View className="flex-row items-start gap-2 flex-1">
                      <View className="w-6 h-6 rounded bg-slate-50 border border-slate-100 items-center justify-center mt-0.5">
                        <Text
                          className="text-xs text-slate-600"
                          style={{ fontFamily: "Outfit_700Bold" }}
                        >
                          {item.quantity}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text
                          className="text-slate-900"
                          style={{ fontFamily: "Outfit_600SemiBold" }}
                        >
                          {item.name}
                        </Text>
                        <Text
                          className="text-xs text-slate-400"
                          style={{ fontFamily: "Outfit_400Regular" }}
                        >
                          ₹{item.price} each
                        </Text>
                      </View>
                    </View>
                    <Text
                      className="text-slate-900"
                      style={{ fontFamily: "Outfit_700Bold" }}
                    >
                      ₹{item.price * item.quantity}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Bill breakdown */}
            <View className="h-px bg-slate-100" />
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text
                  className="text-slate-500 text-sm"
                  style={{ fontFamily: "Outfit_400Regular" }}
                >
                  Subtotal
                </Text>
                <Text
                  className="text-slate-900 text-sm"
                  style={{ fontFamily: "Outfit_600SemiBold" }}
                >
                  ₹{(order as any).subtotal ?? order.totalAmount}
                </Text>
              </View>
              {(order as any).deliveryFee !== undefined && (
                <View className="flex-row justify-between">
                  <Text
                    className="text-slate-500 text-sm"
                    style={{ fontFamily: "Outfit_400Regular" }}
                  >
                    Delivery Fee
                  </Text>
                  <Text
                    className="text-slate-900 text-sm"
                    style={{ fontFamily: "Outfit_600SemiBold" }}
                  >
                    ₹{(order as any).deliveryFee}
                  </Text>
                </View>
              )}
              {(order as any).platformFee !== undefined && (
                <View className="flex-row justify-between">
                  <Text
                    className="text-slate-500 text-sm"
                    style={{ fontFamily: "Outfit_400Regular" }}
                  >
                    Platform Fee
                  </Text>
                  <Text
                    className="text-slate-900 text-sm"
                    style={{ fontFamily: "Outfit_600SemiBold" }}
                  >
                    ₹{(order as any).platformFee}
                  </Text>
                </View>
              )}
              {(order as any).discountAmount ? (
                <View className="flex-row justify-between">
                  <Text
                    className="text-emerald-600 text-sm"
                    style={{ fontFamily: "Outfit_600SemiBold" }}
                  >
                    Discount{" "}
                    {(order as any).promoCode
                      ? `(${(order as any).promoCode})`
                      : ""}
                  </Text>
                  <Text
                    className="text-emerald-600 text-sm"
                    style={{ fontFamily: "Outfit_600SemiBold" }}
                  >
                    -₹{(order as any).discountAmount}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Grand Total footer */}
          <View className="bg-slate-50 px-5 py-4 flex-row items-center justify-between">
            <View>
              <Text
                className="text-[10px] text-slate-500 font-bold"
                style={{ fontFamily: "Outfit_700Bold" }}
              >
                GRAND TOTAL
              </Text>
              <View className="flex-row items-center gap-2 mt-1">
                <View
                  className={`px-2 py-0.5 rounded ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100"
                      : order.paymentStatus === "failed"
                        ? "bg-red-100"
                        : "bg-amber-100"
                  }`}
                >
                  <Text
                    className={`text-[10px] font-bold ${
                      order.paymentStatus === "paid"
                        ? "text-green-700"
                        : order.paymentStatus === "failed"
                          ? "text-red-700"
                          : "text-amber-700"
                    }`}
                    style={{ fontFamily: "Outfit_700Bold" }}
                  >
                    {order.paymentStatus === "paid"
                      ? "PAID"
                      : order.paymentStatus === "failed"
                        ? "FAILED"
                        : "PENDING"}
                  </Text>
                </View>
                {order.paymentMethod && (
                  <Text
                    className="text-xs text-slate-400 capitalize"
                    style={{ fontFamily: "Outfit_500Medium" }}
                  >
                    via {order.paymentMethod}
                  </Text>
                )}
              </View>
            </View>
            <Text
              className="text-3xl text-slate-900"
              style={{ fontFamily: "Outfit_800ExtraBold" }}
            >
              ₹{order.totalAmount.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>
        {/* ── Leave a Review (delivered orders only) ── */}
        {order.status === "delivered" && (
          <View className="mt-2">
            <ReviewForm orderId={order._id} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
