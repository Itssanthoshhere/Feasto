import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Star, Clock, ChevronRight } from 'lucide-react-native';

interface Props {
  id: string;
  name: string;
  image: string;
  eta: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  distance?: string;
}

export default function RestaurantCard({
  id, name, image, eta, rating, totalReviews, isOpen, distance,
}: Props) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push(`/restaurant/${id}` as any)}
      activeOpacity={0.8}
      className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
    >
      {/* Image */}
      <View className="h-44 bg-slate-200 relative">
        {image ? (
          <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="w-full h-full items-center justify-center bg-orange-50">
            <Text className="text-5xl">🍽️</Text>
          </View>
        )}

        {/* Open/Closed badge */}
        <View
          className={`absolute top-3 right-3 px-3 py-1 rounded-full ${isOpen ? 'bg-green-500' : 'bg-slate-700'}`}
          style={{ opacity: 0.95 }}
        >
          <Text className="text-white text-xs" style={{ fontFamily: 'Outfit_700Bold' }}>
            {isOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View className="p-4">
        <View className="flex-row items-start justify-between">
          <Text className="text-lg text-slate-900 flex-1 mr-2" numberOfLines={1} style={{ fontFamily: 'Outfit_700Bold' }}>
            {name}
          </Text>
          <View className="flex-row items-center gap-1">
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            <Text className="text-sm text-slate-700" style={{ fontFamily: 'Outfit_600SemiBold' }}>
              {rating?.toFixed(1)}
            </Text>
            <Text className="text-xs text-slate-400" style={{ fontFamily: 'Outfit_400Regular' }}>
              ({totalReviews})
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-4 mt-2">
          <View className="flex-row items-center gap-1">
            <Clock size={12} color="#94a3b8" />
            <Text className="text-xs text-slate-500" style={{ fontFamily: 'Outfit_500Medium' }}>
              {eta}
            </Text>
          </View>
          {distance && (
            <Text className="text-xs text-slate-400" style={{ fontFamily: 'Outfit_400Regular' }}>
              📍 {distance}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
