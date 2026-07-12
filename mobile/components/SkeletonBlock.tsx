import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";

interface SkeletonBlockProps {
  width?: number | `${number}%` | "auto";
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonBlock({
  width = "100%",
  height = 16,
  borderRadius = 8,
  style,
}: SkeletonBlockProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#e2e8f0",
          opacity,
        },
        style,
      ]}
    />
  );
}

/** A full home-screen restaurant card skeleton */
export function RestaurantCardSkeleton() {
  return (
    <View
      style={{
        backgroundColor: "white",
        borderRadius: 24,
        overflow: "hidden",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f1f5f9",
      }}
    >
      {/* Image placeholder */}
      <SkeletonBlock height={160} borderRadius={0} />
      <View style={{ padding: 16, gap: 8 }}>
        <SkeletonBlock height={18} width="60%" borderRadius={6} />
        <SkeletonBlock height={12} width="40%" borderRadius={6} />
        <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
          <SkeletonBlock height={24} width={70} borderRadius={20} />
          <SkeletonBlock height={24} width={70} borderRadius={20} />
        </View>
      </View>
    </View>
  );
}

/** A single menu-item row skeleton */
export function MenuItemSkeleton() {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 12,
        backgroundColor: "#f8fafc",
        borderRadius: 16,
        marginBottom: 10,
      }}
    >
      <SkeletonBlock width={80} height={80} borderRadius={12} />
      <View style={{ flex: 1, gap: 8 }}>
        <SkeletonBlock height={14} width="70%" borderRadius={6} />
        <SkeletonBlock height={11} width="90%" borderRadius={6} />
        <SkeletonBlock height={14} width="30%" borderRadius={6} />
      </View>
      <SkeletonBlock width={36} height={36} borderRadius={18} />
    </View>
  );
}

/** Order detail skeleton */
export function OrderDetailSkeleton() {
  return (
    <View style={{ padding: 16, gap: 16 }}>
      {/* Status banner */}
      <SkeletonBlock height={80} borderRadius={20} />
      {/* Progress steps */}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonBlock
            key={i}
            height={8}
            borderRadius={4}
            style={{ flex: 1 }}
          />
        ))}
      </View>
      {/* Items card */}
      <SkeletonBlock height={120} borderRadius={20} />
      {/* Info rows */}
      <View style={{ gap: 10 }}>
        <SkeletonBlock height={60} borderRadius={16} />
        <SkeletonBlock height={60} borderRadius={16} />
      </View>
    </View>
  );
}
