import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Plus, Trash2, Phone } from 'lucide-react-native';
import { restaurantApi } from '@/lib/api';
import * as Location from 'expo-location';

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
  label?: 'Home' | 'Work' | 'Other';
}

const LABELS: ('Home' | 'Work' | 'Other')[] = ['Home', 'Work', 'Other'];

export default function AddressScreen() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [mobile, setMobile] = useState('');
  const [addressText, setAddressText] = useState('');
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const fetchAddresses = async () => {
    try {
      const { data } = await restaurantApi.get('/api/address/all');
      setAddresses(data || []);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const useCurrentLocation = async () => {
    setFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Location permission is needed'); return; }
      const pos = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = pos.coords;
      setLat(latitude); setLng(longitude);
      // Reverse geocode
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const geo = await res.json();
      const parts = [geo.locality, geo.principalSubdivision, geo.countryName].filter(Boolean);
      setAddressText(parts.join(', ') || 'Current Location');
    } catch { Alert.alert('Error', 'Could not get location'); }
    finally { setFetchingLocation(false); }
  };

  const addAddress = async () => {
    if (!mobile.trim() || mobile.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number'); return;
    }
    if (!addressText.trim()) {
      Alert.alert('Address Required', 'Please enter or detect your address'); return;
    }

    setAdding(true);
    try {
      let finalLat = lat;
      let finalLng = lng;

      // If no coordinates, geocode the address text
      if (!finalLat || !finalLng) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressText)}&format=json&limit=1`
        );
        const geoData = await res.json();
        if (geoData && geoData.length > 0) {
          finalLat = parseFloat(geoData[0].lat);
          finalLng = parseFloat(geoData[0].lon);
        } else {
          Alert.alert('Address Not Found', 'We could not geocode this address. Try using current location.');
          return;
        }
      }

      await restaurantApi.post('/api/address/add', {
        mobile: parseInt(mobile),
        formattedAddress: addressText,
        latitude: finalLat,
        longitude: finalLng,
        label,
      });
      await fetchAddresses();
      setShowForm(false);
      setMobile(''); setAddressText(''); setLat(null); setLng(null); setLabel('Home');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add address');
    } finally {
      setAdding(false);
    }
  };

  const deleteAddress = (id: string) => {
    Alert.alert('Delete Address', 'Remove this saved address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await restaurantApi.delete(`/api/address/delete/${id}`);
            await fetchAddresses();
          } catch { Alert.alert('Error', 'Failed to delete address'); }
          finally { setDeletingId(null); }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-white px-5 pt-4 pb-4 border-b border-slate-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()} className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center">
          <ArrowLeft size={18} color="#475569" />
        </TouchableOpacity>
        <Text className="text-xl text-slate-900 flex-1" style={{ fontFamily: 'Outfit_700Bold' }}>
          Manage Addresses
        </Text>
        {!showForm && (
          <TouchableOpacity onPress={() => setShowForm(true)} className="flex-row items-center gap-1 bg-[#FF5A1F] px-3 py-2 rounded-xl">
            <Plus size={14} color="#fff" />
            <Text className="text-white text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 12 }}>
        {/* Add form */}
        {showForm && (
          <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <Text className="text-lg text-slate-900 mb-4" style={{ fontFamily: 'Outfit_700Bold' }}>
              New Address
            </Text>

            {/* Label selector */}
            <Text className="text-sm text-slate-600 mb-2" style={{ fontFamily: 'Outfit_500Medium' }}>Label</Text>
            <View className="flex-row gap-2 mb-4">
              {LABELS.map((l) => (
                <TouchableOpacity
                  key={l}
                  onPress={() => setLabel(l)}
                  className={`px-4 py-2 rounded-full border ${label === l ? 'bg-[#FF5A1F] border-[#FF5A1F]' : 'border-slate-200'}`}
                >
                  <Text className={`text-sm ${label === l ? 'text-white' : 'text-slate-600'}`} style={{ fontFamily: 'Outfit_600SemiBold' }}>
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Mobile */}
            <Text className="text-sm text-slate-600 mb-2" style={{ fontFamily: 'Outfit_500Medium' }}>Mobile Number</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 mb-4">
              <Phone size={14} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-slate-800"
                style={{ fontFamily: 'Outfit_400Regular' }}
                placeholder="10-digit mobile number"
                placeholderTextColor="#94a3b8"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            {/* Address */}
            <Text className="text-sm text-slate-600 mb-2" style={{ fontFamily: 'Outfit_500Medium' }}>Address</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 mb-2"
              style={{ fontFamily: 'Outfit_400Regular', minHeight: 72, textAlignVertical: 'top' }}
              placeholder="Enter full address..."
              placeholderTextColor="#94a3b8"
              value={addressText}
              onChangeText={setAddressText}
              multiline
            />

            <TouchableOpacity
              onPress={useCurrentLocation}
              disabled={fetchingLocation}
              className="flex-row items-center gap-2 mb-4"
            >
              {fetchingLocation ? <ActivityIndicator size="small" color="#FF5A1F" /> : <MapPin size={14} color="#FF5A1F" />}
              <Text className="text-[#FF5A1F] text-sm" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                {fetchingLocation ? 'Detecting...' : 'Use Current Location'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                className="flex-1 border border-slate-200 rounded-2xl py-3.5 items-center"
              >
                <Text className="text-slate-600" style={{ fontFamily: 'Outfit_600SemiBold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={addAddress}
                disabled={adding}
                className="flex-1 bg-[#FF5A1F] rounded-2xl py-3.5 items-center"
              >
                {adding ? <ActivityIndicator color="#fff" size="small" /> : (
                  <Text className="text-white" style={{ fontFamily: 'Outfit_600SemiBold' }}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Saved addresses */}
        {loading ? (
          <View className="items-center py-8">
            <ActivityIndicator color="#FF5A1F" />
          </View>
        ) : addresses.length === 0 && !showForm ? (
          <View className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 items-center">
            <Text className="text-4xl mb-4">📍</Text>
            <Text className="text-lg text-slate-800 text-center" style={{ fontFamily: 'Outfit_700Bold' }}>
              No saved addresses
            </Text>
            <Text className="text-slate-500 text-center mt-2 mb-5" style={{ fontFamily: 'Outfit_400Regular' }}>
              Add your delivery addresses for faster checkout.
            </Text>
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="bg-[#FF5A1F] px-6 py-3 rounded-xl"
            >
              <Text className="text-white" style={{ fontFamily: 'Outfit_600SemiBold' }}>Add First Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((addr) => (
            <View key={addr._id} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-full bg-orange-50 items-center justify-center shrink-0">
                <MapPin size={18} color="#FF5A1F" />
              </View>
              <View className="flex-1">
                {addr.label && (
                  <View className="self-start bg-slate-100 px-2 py-0.5 rounded-full mb-1">
                    <Text className="text-[10px] text-slate-600 uppercase tracking-wider" style={{ fontFamily: 'Outfit_600SemiBold' }}>
                      {addr.label}
                    </Text>
                  </View>
                )}
                <Text className="text-slate-800 text-sm" style={{ fontFamily: 'Outfit_500Medium' }}>
                  {addr.formattedAddress}
                </Text>
                <Text className="text-slate-500 text-xs mt-1" style={{ fontFamily: 'Outfit_400Regular' }}>
                  📞 {addr.mobile}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteAddress(addr._id)}
                disabled={deletingId === addr._id}
                className="w-9 h-9 rounded-full bg-red-50 items-center justify-center"
              >
                {deletingId === addr._id
                  ? <ActivityIndicator size="small" color="#ef4444" />
                  : <Trash2 size={16} color="#ef4444" />}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
