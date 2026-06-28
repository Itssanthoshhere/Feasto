import type { IOrder } from "../types";
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { riderService } from "../main";

declare module "leaflet" {
  namespace Routing {
    function control(options: any): any;
    function osrmv1(options?: any): any;
  }
}

const riderIcon = new L.DivIcon({
  html: "🛵",
  iconSize: [30, 30],
  className: "",
});

const deliveryIcon = new L.DivIcon({
  html: "📦",
  iconSize: [30, 30],
  className: "",
});

interface Props {
  order: IOrder;
}

const Routing = ({
  from,
  to,
}: {
  from: [number, number];
  to: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    let control: any = null;
    let mounted = true;

    const initRouting = async () => {
      // Ensure plugin can attach to Leaflet in ESM/Vite builds.
      (window as any).L = L;
      // @ts-expect-error - no types available for this specific build
      await import("leaflet-routing-machine/dist/leaflet-routing-machine.js");

      if (!mounted) return;

      if (!(L as any).Routing?.control) {
        console.error("Leaflet Routing Machine failed to load");
        return;
      }

      control = (L as any).Routing.control({
        waypoints: [L.latLng(from), L.latLng(to)],
        lineOptions: {
          styles: [{ color: "#FF5A1F", weight: 5 }],
        },
        addWaypoints: false,
        draggableWaypoints: false,
        show: false,
        createMarker: () => null,
        router: (L as any).Routing.osrmv1({
          serviceUrl:
            import.meta.env.VITE_OSRM_URL ||
            "https://router.project-osrm.org/route/v1",
        }),
      }).addTo(map);
    };

    initRouting();

    return () => {
      mounted = false;
      if (control) {
        map.removeControl(control);
      }
    };
  }, [from, to, map]);

  return null;
};

const RiderOrderMap = ({ order }: Props) => {
  const [riderLocation, setRiderLocation] = useState<[number, number] | null>(
    null,
  );

  if (
    order.deliveryAddress.latitude == null ||
    order.deliveryAddress.longitude == null
  ) {
    return null;
  }

  const deliveryLocation: [number, number] = [
    order.deliveryAddress.latitude,
    order.deliveryAddress.longitude,
  ];

  useEffect(() => {
    const fetchLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latitude = pos.coords.latitude;
          const longitude = pos.coords.longitude;

          setRiderLocation([latitude, longitude]);

          axios
            .post(
              `${riderService}/api/rider/location`,
              {
                orderId: order._id,
                latitude,
                longitude,
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                timeout: 5000,
              },
            )
            .catch((err) => {
              console.error("Location reporting failed:", err?.message || err);
            });
        },
        (err) => console.log("Location Error:", err),
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000,
        },
      );
    };

    fetchLocation();
    const interval = setInterval(fetchLocation, 10000);

    return () => clearInterval(interval);
  }, [order.userId]);

  if (!riderLocation) return null;

  return (
    <div className="rounded-3xl bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-2 overflow-hidden relative">
      <div className="absolute top-5 left-5 z-400 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
          Live Navigation
        </span>
      </div>
      <MapContainer
        center={riderLocation}
        zoom={14}
        className="h-[350px] w-full rounded-2xl z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <Marker position={riderLocation} icon={riderIcon}>
          <Popup>You (Rider)</Popup>
        </Marker>

        <Marker position={deliveryLocation} icon={deliveryIcon}>
          <Popup>Delivery Location</Popup>
        </Marker>

        <Routing from={riderLocation} to={deliveryLocation} />
      </MapContainer>
    </div>
  );
};

export default RiderOrderMap;
