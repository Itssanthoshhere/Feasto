import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Star, Search, Tag, Plus, Minus } from 'lucide-react-native';
import { restaurantApi } from '@/lib/api';
import type { IRestaurant, IMenuItem, IPromotion } from '@/lib/types';
import { useAppData } from '@/context/AppContext';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { fetchCart } = useAppData();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [menuSearch, setMenuSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    setLoading(true);

    Promise.all([
      restaurantApi.get(`/api/restaurant/${id}`),
      restaurantApi.get(`/api/item/all/${id}`),
      restaurantApi.get(`/api/promotion/active/${id}`).catch(() => ({ data: { promotions: [] } })),
    ]).then(([restRes, menuRes, promoRes]) => {
      if (!ignore) {
        setRestaurant(restRes.data || null);
        setMenuItems(menuRes.data || []);
        setPromotions(promoRes.data.promotions || []);
      }
    }).catch(() => {}).finally(() => { if (!ignore) setLoading(false); });

    return () => { ignore = true; };
  }, [id]);

  const filtered = menuItems.filter((item) => {
    const s = menuSearch.toLowerCase();
    return item.name.toLowerCase().includes(s) || (item.description || '').toLowerCase().includes(s);
  });

  const addToCart = async (itemId: string) => {
    setAddingId(itemId);
    try {
      await restaurantApi.post('/api/cart/add', { itemId, restaurantId: id });
      await fetchCart();
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Failed to add item';
      Alert.alert('Error', msg);
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#FF5A1F" />
      </SafeAreaView>
    );
  }

  if (!restaurant) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-5xl mb-4">🏪</Text>
        <Text className="text-xl text-slate-800 text-center" style={{ fontFamily: 'Outfit_700Bold' }}>
          Restaurant not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-5 bg-[#FF5A1F] px-6 py-3 rounded-xl">
          <Text className="text-white" style={{ fontFamily: 'Outfit_600SemiBold' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView>
        {/* Hero image */}
        <View className="h-52 bg-slate-200 relative">
          {restaurant.image ? (
            <Image source={{ uri: restaurant.image }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-orange-50">
              <Text className="text-6xl">🍽️</Text>
            </View>
          )}
          <View className="absolute inset-0 bg-black/30" />
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 w-10 h-10 bg-white/90 rounded-full items-center justify-center"
          >
            <ArrowLeft size={20} color="#1e293b" />
          </TouchableOpacity>
        </View>

        <View className="p-4 gap-4">
          {/* Restaurant info */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <View className="flex-row items-start justify-between mb-3">
              <Text className="text-2xl text-slate-900 flex-1 mr-2" style={{ fontFamily: 'Outfit_800ExtraBold' }}>
                {restaurant.name}
              </Text>
              <View className={`px-3 py-1 rounded-full ${restaurant.isOpen ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <Text
                  className={`text-xs ${restaurant.isOpen ? 'text-green-600' : 'text-red-600'}`}
                  style={{ fontFamily: 'Outfit_600SemiBold' }}
                >
                  {restaurant.isOpen ? '● Open' : '● Closed'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#f59e0b" fill="#f59e0b" />
                <Text className="text-slate-700 text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                  {restaurant.rating?.toFixed(1)} ({restaurant.totalReviews} reviews)
                </Text>
              </View>
              {restaurant.cuisineType && restaurant.cuisineType.length > 0 && (
                <Text className="text-slate-400 text-sm" style={{ fontFamily: 'Outfit_400Regular' }}>
                  {restaurant.cuisineType.join(', ')}
                </Text>
              )}
            </View>
          </View>

          {/* Promotions */}
          {promotions.length > 0 && (
            <View className="bg-orange-50 rounded-3xl p-4 border border-orange-200">
              <View className="flex-row items-center gap-2 mb-3">
                <Tag size={16} color="#FF5A1F" />
                <Text className="text-slate-900" style={{ fontFamily: 'Outfit_700Bold' }}>
                  Available Offers
                </Text>
              </View>
              <View className="gap-2">
                {promotions.map((promo) => (
                  <View key={promo._id} className="bg-white rounded-2xl p-3 flex-row items-center justify-between border border-orange-100">
                    <View>
                      <Text className="text-[#FF5A1F]" style={{ fontFamily: 'Outfit_700Bold' }}>
                        {promo.discountType === 'percent' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                      </Text>
                      <Text className="text-slate-500 text-xs mt-0.5" style={{ fontFamily: 'Outfit_400Regular' }}>
                        On orders above ₹{promo.minOrderValue}
                      </Text>
                    </View>
                    <View className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
                      <Text className="text-slate-700 text-xs tracking-widest" style={{ fontFamily: 'Outfit_700Bold' }}>
                        {promo.code}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Menu Section */}
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className="text-xl text-slate-900" style={{ fontFamily: 'Outfit_700Bold' }}>
                  Menu
                </Text>
                <Text className="text-sm text-slate-500 mt-0.5" style={{ fontFamily: 'Outfit_400Regular' }}>
                  {filtered.length} item{filtered.length !== 1 ? 's' : ''} available
                </Text>
              </View>
            </View>

            {/* Menu search */}
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 h-11 mb-4">
              <Search size={14} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-slate-800 text-sm"
                style={{ fontFamily: 'Outfit_400Regular' }}
                placeholder="Search menu..."
                placeholderTextColor="#94a3b8"
                value={menuSearch}
                onChangeText={setMenuSearch}
              />
            </View>

            {/* Menu items */}
            <View className="gap-3">
              {filtered.length === 0 ? (
                <View className="items-center py-8">
                  <Text className="text-3xl mb-2">🍽️</Text>
                  <Text className="text-slate-500 text-sm" style={{ fontFamily: 'Outfit_400Regular' }}>
                    No items found
                  </Text>
                </View>
              ) : (
                filtered.map((item) => {
                  const isAdding = addingId === item._id;
                  return (
                    <View
                      key={item._id}
                      className="flex-row items-center gap-3 p-3 bg-slate-50 rounded-2xl"
                    >
                      <View className="w-20 h-20 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                        {item.image ? (
                          <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                          <View className="w-full h-full items-center justify-center">
                            <Text className="text-2xl">🍽️</Text>
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-slate-800" numberOfLines={1} style={{ fontFamily: 'Outfit_600SemiBold' }}>
                          {item.name}
                        </Text>
                        {item.description && (
                          <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={2} style={{ fontFamily: 'Outfit_400Regular' }}>
                            {item.description}
                          </Text>
                        )}
                        <Text className="text-[#FF5A1F] mt-1" style={{ fontFamily: 'Outfit_700Bold' }}>
                          ₹{item.price}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => addToCart(item._id)}
                        disabled={!restaurant.isOpen || isAdding}
                        className={`w-9 h-9 rounded-full items-center justify-center ${!restaurant.isOpen ? 'bg-slate-200' : 'bg-[#FF5A1F]'}`}
                      >
                        {isAdding ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Plus size={18} color={restaurant.isOpen ? '#fff' : '#94a3b8'} />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
