import { useEffect, useState } from "react";
import type { IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import AddRestaurant from "../components/AddRestaurant";
import RestaurantProfile from "../components/RestaurantProfile";
import { useAppData } from "../context/AppContext";
import MenuItems from "../components/MenuItems";
import AddMenuItem from "../components/AddMenuItem";
import RestaurantOrders from "../components/RestaurantOrders";
import RestaurantAnalytics from "../components/RestaurantAnalytics";

type SellerTab = "menu" | "add-item" | "sales";

const Restaurant = () => {
  const { setUser } = useAppData();
  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SellerTab>("menu");

  const fetchMyRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRestaurant(data.restaurant || null);

      if (data.token) {
        localStorage.setItem("token", data.token);
        try {
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          if (payload.user) {
            setUser(payload.user);
          }
        } catch (e) {
          console.error("Failed to parse token", e);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurant();
  }, []);

  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);

  const fetchMenuItems = async (restaurantId: string) => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${restaurantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setMenuItems(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (restaurant?._id) {
      fetchMenuItems(restaurant._id);
    }
  }, [restaurant]);

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading your restaurant...</p>
      </div>
    );

  if (!restaurant) {
    return <AddRestaurant fetchMyRestaurant={fetchMyRestaurant} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl w-full animate-fade-in-up space-y-8">
        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={true}
        />

        <RestaurantOrders restaurantId={restaurant._id} />

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[
              { key: "menu", label: "Menu Items" },
              { key: "add-item", label: "Add Item" },
              { key: "sales", label: "Sales" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as SellerTab)}
                className={`flex-1 px-4 py-4 text-sm font-bold transition-all ${
                  tab === t.key
                    ? "border-b-2 border-[#FF5A1F] text-[#FF5A1F] bg-[#FF5A1F]/5"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 min-h-[400px]">
            {tab === "menu" && (
              <MenuItems
                items={menuItems}
                onItemDeleted={() => fetchMenuItems(restaurant._id)}
                isSeller={true}
              />
            )}
            {tab === "add-item" && (
              <AddMenuItem onItemAdded={() => fetchMenuItems(restaurant._id)} />
            )}
            {tab === "sales" && (
              <RestaurantAnalytics restaurantId={restaurant._id} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurant;
