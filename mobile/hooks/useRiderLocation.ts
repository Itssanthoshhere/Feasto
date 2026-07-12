import { useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { restaurantApi } from '@/lib/api';

/**
 * useRiderLocation – Continuously sends the rider's GPS coordinates
 * to the backend while `isActive` is true.
 *
 * Usage: Call with isActive=true when a rider has accepted a delivery
 * and needs to broadcast their position to the customer.
 *
 * NOTE: This hook uses *foreground* location updates (every 5 seconds).
 * Background location requires a standalone build with the
 * `expo-location` background task registered in app.json.
 */
export function useRiderLocation(isActive: boolean, orderId?: string) {
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  const sendLocation = useCallback(
    async (location: Location.LocationObject) => {
      if (!orderId) return;
      try {
        await restaurantApi.post('/api/rider/location', {
          orderId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch {
        // Silently fail – location updates are best-effort
      }
    },
    [orderId],
  );

  useEffect(() => {
    if (!isActive || !orderId) {
      // Tear down if deactivated
      watchRef.current?.remove();
      watchRef.current = null;
      return;
    }

    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted' || cancelled) return;

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // every 5 seconds
          distanceInterval: 10, // or every 10 metres
        },
        (loc) => sendLocation(loc),
      );

      if (cancelled) {
        sub.remove();
      } else {
        watchRef.current = sub;
      }
    })();

    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [isActive, orderId, sendLocation]);
}
