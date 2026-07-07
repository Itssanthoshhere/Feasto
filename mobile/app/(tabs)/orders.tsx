import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';
import { useAppData } from '@/context/AppContext';
import { restaurantApi } from '@/lib/api';
import type { IOrder } from '@/lib/types';
import {
  ACTIVE_STATUSES, STATUS_FLOW, getOrderStatus,
} from '@/lib/orderConstants';

type Tab = 'active' | 'completed';

export default function OrdersScreen() {
  const { fetchCart } = useAppData();
  const router = useRouter();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      const { data } = await restaurantApi.get('/api/order/myorder');
      setOrders(data.orders || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const completedOrders = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));
  const displayed = activeTab === 'active' ? activeOrders : completedOrders;

  const handleReorder = async (orderId: string) => {
    try {
      setReorderingId(orderId);
      await restaurantApi.post('/api/cart/reorder', { orderId });
      await fetchCart();
      router.push('/(tabs)/cart');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to reorder');
    } finally {
      setReorderingId(null);
    }
  };

  const timeAgo = (dateStr: string | Date) => {
    const date = new Date(dateStr);
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const totalSpent = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.totalAmount, 0);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-2xl text-slate-900" style={{ fontFamily: 'Outfit_800ExtraBold' }}>
              My Orders
            </Text>
            <Text className="text-xs text-slate-400 mt-0.5" style={{ fontFamily: 'Outfit_400Regular' }}>
              Track your orders in real-time
            </Text>
          </View>
          {activeOrders.length > 0 && (
            <View className="flex-row items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-xs text-emerald-700" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                {activeOrders.length} Live
              </Text>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={displayed}
        keyExtractor={(item) => item._id}
        onRefresh={fetchOrders}
        refreshing={loading}
        contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}
        ListHeaderComponent={
          <>
            {/* Stats */}
            {!loading && orders.length > 0 && (
              <View className="flex-row gap-3 mb-4">
                {[
                  { label: 'Active', value: activeOrders.length.toString(), color: '#FF5A1F', bg: '#fff7ed' },
                  { label: 'Total', value: orders.length.toString(), color: '#2563eb', bg: '#eff6ff' },
                  { label: 'Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: '#059669', bg: '#ecfdf5' },
                ].map((s) => (
                  <View key={s.label} className="flex-1 rounded-2xl p-3 border border-slate-100" style={{ backgroundColor: s.bg }}>
                    <Text className="text-[10px] uppercase tracking-wider text-slate-400" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {s.label}
                    </Text>
                    <Text className="text-lg mt-0.5" style={{ fontFamily: 'Outfit_800ExtraBold', color: s.color }}>
                      {s.value}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Tabs */}
            <View className="flex-row bg-white rounded-2xl border border-slate-100 overflow-hidden mb-2">
              {(['active', 'completed'] as Tab[]).map((tab) => {
                const count = tab === 'active' ? activeOrders.length : completedOrders.length;
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => setActiveTab(tab)}
                    className={`flex-1 flex-row items-center justify-center gap-2 py-3.5 ${isActive ? 'border-b-2 border-[#FF5A1F] bg-orange-50' : ''}`}
                  >
                    <Text
                      className={`text-sm ${isActive ? 'text-[#FF5A1F]' : 'text-slate-400'}`}
                      style={{ fontFamily: 'Outfit_600SemiBold' }}
                    >
                      {tab === 'active' ? 'Active' : 'Past Orders'}
                    </Text>
                    <View className={`rounded-full w-5 h-5 items-center justify-center ${isActive ? 'bg-[#FF5A1F]' : 'bg-slate-100'}`}>
                      <Text
                        className={`text-[10px] ${isActive ? 'text-white' : 'text-slate-400'}`}
                        style={{ fontFamily: 'Outfit_700Bold' }}
                      >
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <View className="items-center py-12">
              <ActivityIndicator color="#FF5A1F" />
            </View>
          ) : error ? (
            <View className="items-center py-12 px-6">
              <Text className="text-4xl mb-3">⚠️</Text>
              <Text className="text-lg text-slate-800 mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>Failed to load</Text>
              <Text className="text-slate-500 text-center mb-4" style={{ fontFamily: 'Outfit_400Regular' }}>{error}</Text>
              <TouchableOpacity onPress={fetchOrders} className="bg-slate-800 px-6 py-3 rounded-xl">
                <Text className="text-white" style={{ fontFamily: 'Outfit_600SemiBold' }}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center py-16 px-6">
              <Text className="text-4xl mb-3">{activeTab === 'active' ? '🍽️' : '📦'}</Text>
              <Text className="text-lg text-slate-800 mb-2" style={{ fontFamily: 'Outfit_700Bold' }}>
                {activeTab === 'active' ? 'No active orders' : 'No past orders yet'}
              </Text>
              <Text className="text-slate-500 text-center" style={{ fontFamily: 'Outfit_400Regular' }}>
                {activeTab === 'active'
                  ? 'When you place an order, it will show up here.'
                  : 'Your delivered orders will appear here.'}
              </Text>
              {activeTab === 'active' && (
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)')}
                  className="mt-5 bg-[#FF5A1F] px-6 py-3 rounded-xl"
                >
                  <Text className="text-white" style={{ fontFamily: 'Outfit_600SemiBold' }}>Browse Restaurants</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
        renderItem={({ item: order }) => {
          const { meta, stepIndex, isActive } = getOrderStatus(order.status);
          const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
          const itemsSummary = order.items.slice(0, 2).map((i) => i.name).join(', ');

          return (
            <TouchableOpacity
              onPress={() => router.push(`/order/${order._id}` as any)}
              className={`bg-white rounded-2xl border overflow-hidden`}
              style={{ borderColor: isActive ? meta.borderColor : '#f1f5f9' }}
              activeOpacity={0.8}
            >
              {isActive && (
                <View style={{ height: 3, backgroundColor: meta.color, opacity: 0.6 }} />
              )}
              <View className="p-4 flex-row items-center gap-3">
                <View
                  className="w-12 h-12 rounded-xl items-center justify-center"
                  style={{ backgroundColor: meta.bgColor, borderWidth: 1, borderColor: meta.borderColor }}
                >
                  <Text className="text-xl">{meta.icon}</Text>
                </View>

                <View className="flex-1 min-w-0">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base text-slate-900 flex-1 mr-2" numberOfLines={1} style={{ fontFamily: 'Outfit_700Bold' }}>
                      {order.restaurantName}
                    </Text>
                    <Text className="text-xs text-slate-400" style={{ fontFamily: 'Outfit_400Regular' }}>
                      {timeAgo(order.createdAt)}
                    </Text>
                  </View>
                  <Text className="text-xs text-slate-500 mt-0.5" numberOfLines={1} style={{ fontFamily: 'Outfit_400Regular' }}>
                    {totalQty} item{totalQty > 1 ? 's' : ''} · {itemsSummary}
                  </Text>

                  {isActive ? (
                    <View className="flex-row items-center gap-2 mt-1.5">
                      <View className="flex-row gap-0.5 flex-1 max-w-[90px]">
                        {STATUS_FLOW.slice(0, 6).map((_, i) => (
                          <View
                            key={i}
                            className="flex-1 h-1 rounded-full"
                            style={{ backgroundColor: i <= stepIndex ? meta.color : '#e2e8f0' }}
                          />
                        ))}
                      </View>
                      <Text className="text-[11px]" style={{ fontFamily: 'Outfit_600SemiBold', color: meta.color }}>
                        {meta.label}
                      </Text>
                      <Text className="ml-auto text-base" style={{ fontFamily: 'Outfit_800ExtraBold', color: '#0f172a' }}>
                        ₹{order.totalAmount}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center justify-between mt-1.5">
                      <View className="flex-row items-center gap-1.5">
                        <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: meta.bgColor }}>
                          <Text className="text-[11px]" style={{ fontFamily: 'Outfit_600SemiBold', color: meta.color }}>
                            {meta.icon} {meta.label}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={(e) => { e.stopPropagation?.(); handleReorder(order._id); }}
                          disabled={reorderingId === order._id}
                          className={`px-3 py-1 rounded-lg ${reorderingId === order._id ? 'bg-slate-200' : 'bg-slate-100'}`}
                        >
                          {reorderingId === order._id ? (
                            <ActivityIndicator size="small" color="#64748b" />
                          ) : (
                            <Text className="text-xs text-slate-700" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                              Reorder
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                      <Text className="text-base" style={{ fontFamily: 'Outfit_800ExtraBold', color: '#0f172a' }}>
                        ₹{order.totalAmount}
                      </Text>
                    </View>
                  )}
                </View>

                <ChevronRight size={18} color="#cbd5e1" />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
