import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Star } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { restaurantApi } from "@/lib/api";
import { analytics } from "@/lib/analytics";

interface Props {
  orderId: string;
}

interface IReview {
  _id: string;
  rating: number;
  comment?: string;
}

export default function ReviewForm({ orderId }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<IReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewStatus();
  }, [orderId]);

  const fetchReviewStatus = async () => {
    try {
      setLoading(true);
      const { data } = await restaurantApi.get(`/api/review/order/${orderId}`);
      if (data.review) setExistingReview(data.review);
    } catch {
      /* no review yet, that's fine */
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating required", "Please select a star rating.");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data } = await restaurantApi.post(`/api/review/new/${orderId}`, {
        rating,
        comment,
      });
      setExistingReview(data.review);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      analytics.track('review_submitted', { orderId, rating, hasComment: !!comment });
      Alert.alert("Thank you! 🎉", "Your review has been submitted.");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.response?.data?.message || "Failed to submit review.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View className="bg-white rounded-3xl p-6 border border-slate-100 items-center justify-center h-32">
        <ActivityIndicator color="#FF5A1F" />
      </View>
    );
  }

  /* ── Already reviewed ── */
  if (existingReview) {
    return (
      <View className="bg-white rounded-3xl p-6 border border-slate-100 gap-3">
        <View className="flex-row items-center justify-between">
          <Text
            className="text-base text-slate-900"
            style={{ fontFamily: "Outfit_700Bold" }}
          >
            Your Review
          </Text>
          <View className="bg-green-50 px-3 py-1 rounded-full border border-green-200">
            <Text
              className="text-xs text-green-700"
              style={{ fontFamily: "Outfit_600SemiBold" }}
            >
              Published ✓
            </Text>
          </View>
        </View>

        {/* Stars display */}
        <View className="flex-row gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              size={22}
              color={i <= existingReview.rating ? "#f59e0b" : "#e2e8f0"}
              fill={i <= existingReview.rating ? "#f59e0b" : "#e2e8f0"}
            />
          ))}
        </View>

        {existingReview.comment ? (
          <View className="bg-slate-50 rounded-2xl p-4">
            <Text
              className="text-sm text-slate-600 italic"
              style={{ fontFamily: "Outfit_400Regular" }}
            >
              "{existingReview.comment}"
            </Text>
          </View>
        ) : null}
      </View>
    );
  }

  /* ── Submit form ── */
  return (
    <View className="bg-white rounded-3xl p-6 border border-slate-100 gap-4">
      <View>
        <Text
          className="text-base text-slate-900"
          style={{ fontFamily: "Outfit_700Bold" }}
        >
          Rate your order ⭐
        </Text>
        <Text
          className="text-sm text-slate-500 mt-1"
          style={{ fontFamily: "Outfit_400Regular" }}
        >
          How was your food? Let the restaurant know!
        </Text>
      </View>

      {/* Star picker */}
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setRating(i);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            activeOpacity={0.7}
          >
            <Star
              size={36}
              color={i <= (hovered || rating) ? "#f59e0b" : "#e2e8f0"}
              fill={i <= (hovered || rating) ? "#f59e0b" : "#e2e8f0"}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Comment */}
      <View>
        <Text
          className="text-xs text-slate-400 uppercase tracking-widest mb-2"
          style={{ fontFamily: "Outfit_600SemiBold" }}
        >
          Comment (optional)
        </Text>
        <TextInput
          className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm"
          style={{
            fontFamily: "Outfit_400Regular",
            minHeight: 80,
            textAlignVertical: "top",
          }}
          placeholder="Tell us what you liked (or didn't like)..."
          placeholderTextColor="#94a3b8"
          multiline
          numberOfLines={3}
          value={comment}
          onChangeText={setComment}
        />
      </View>

      {/* Submit */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className={`py-4 rounded-2xl items-center justify-center flex-row gap-2 ${
          isSubmitting || rating === 0 ? "bg-slate-200" : "bg-[#FF5A1F]"
        }`}
        activeOpacity={0.85}
      >
        {isSubmitting && <ActivityIndicator size="small" color="#fff" />}
        <Text
          className={`text-base ${isSubmitting || rating === 0 ? "text-slate-400" : "text-white"}`}
          style={{ fontFamily: "Outfit_700Bold" }}
        >
          Submit Review
        </Text>
      </TouchableOpacity>
    </View>
  );
}
