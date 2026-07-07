import { Tabs, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Home, ShoppingCart, Package, User } from 'lucide-react-native';
import { useAppData } from '@/context/AppContext';
import { View, ActivityIndicator } from 'react-native';

export default function TabLayout() {
  const { isAuth, loading, user, quantity } = useAppData();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuth) {
      router.replace('/login');
    }
  }, [loading, isAuth]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#FF5A1F" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF5A1F',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          borderTopColor: '#f1f5f9',
          backgroundColor: '#ffffff',
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontFamily: 'Outfit_600SemiBold',
          fontSize: 11,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <ShoppingCart color={color} size={size} />,
          tabBarBadge: quantity > 0 ? quantity : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF5A1F', fontSize: 10, fontFamily: 'Outfit_700Bold' },
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Package color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
