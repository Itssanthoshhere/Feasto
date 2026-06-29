import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { IMenuItem, IRestaurant, IPromotion } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantProfile from "../components/RestaurantProfile";
import MenuItems from "../components/MenuItems";
import ReviewList from "../components/ReviewList";
import { BiArrowBack, BiStore, BiSearch, BiSolidOffer } from "react-icons/bi";

const RestaurantPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<IRestaurant | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItem[]>([]);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [menuSearch, setMenuSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRestaurant(data || null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/item/all/${id}`,
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

  const fetchPromotions = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/promotion/active/${id}`,
      );
      setPromotions(data.promotions || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      setRestaurant(null);
      setMenuItems([]);
      setPromotions([]);
      setMenuSearch("");
      Promise.all([
        fetchRestaurant(),
        fetchMenuItems(),
        fetchPromotions(),
      ]).finally(() => {
        // loading state handled internally by fetchRestaurant
      });
    }
  }, [id]);

  const filteredMenu = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearch.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-8 bg-slate-50 sm:py-12">
        <div className="max-w-5xl mx-auto animate-fade-in-up">
          {/* Back button */}
          <div className="mb-6">
            <div className="h-10 w-28 rounded-xl bg-slate-200 animate-pulse" />
          </div>

          {/* Profile */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 mb-6">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="w-full h-40 sm:w-48 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="flex-1 space-y-4">
                <div className="w-2/3 h-8 rounded-lg bg-slate-200 animate-pulse" />
                <div className="w-full h-4 rounded-lg bg-slate-100 animate-pulse" />
                <div className="w-3/4 h-4 rounded-lg bg-slate-100 animate-pulse" />
                <div className="flex gap-3 pt-2">
                  <div className="w-24 h-10 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="w-24 h-10 rounded-xl bg-slate-100 animate-pulse" />
                  <div className="w-24 h-10 rounded-xl bg-slate-100 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Menu */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
            <div className="w-40 mb-6 rounded-lg h-7 bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-50">
                  <div className="w-20 h-20 rounded-xl bg-slate-200 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-3/4 h-5 rounded bg-slate-200 animate-pulse" />
                    <div className="w-1/2 h-4 rounded bg-slate-100 animate-pulse" />
                    <div className="w-1/4 h-4 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen px-4 py-8 bg-slate-50 sm:py-12">
        <div className="max-w-5xl mx-auto animate-fade-in-up">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 mb-8 text-sm font-bold transition-all rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white group"
          >
            <BiArrowBack className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>

          <div className="flex flex-col items-center justify-center px-4 py-20 text-center bg-white border shadow-sm rounded-3xl border-slate-100">
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-slate-50">
              <BiStore className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">
              Restaurant not found
            </h3>
            <p className="max-w-md mx-auto font-medium text-slate-500">
              This restaurant may have been removed or the link may be
              incorrect.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2.5 bg-[#FF5A1F] hover:bg-[#e8521c] text-white font-bold rounded-xl transition-colors shadow-md shadow-[#FF5A1F]/20"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-slate-50 sm:py-12">
      <div className="max-w-5xl mx-auto animate-fade-in-up">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-sm font-bold transition-all rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white group"
        >
          <BiArrowBack className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        {/* Restaurant Profile */}
        <RestaurantProfile
          restaurant={restaurant}
          onUpdate={setRestaurant}
          isSeller={false}
        />

        {/* Promotions Section */}
        {promotions.length > 0 && (
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-[#FF5A1F]/5 rounded-3xl p-6 sm:p-8 border border-[#FF5A1F]/20">
            <h2 className="flex items-center gap-2 mb-4 text-xl font-extrabold tracking-tight sm:text-2xl text-slate-900">
              <BiSolidOffer className="text-[#FF5A1F]" />
              Available Offers
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {promotions.map((promo) => (
                <div
                  key={promo._id}
                  className="bg-white rounded-2xl p-4 border border-[#FF5A1F]/20 shadow-sm flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-[#FF5A1F] text-lg">
                      {promo.discountType === "percent"
                        ? `${promo.discountValue}% OFF`
                        : `₹${promo.discountValue} OFF`}
                    </div>
                    <div className="text-sm font-medium text-slate-500">
                      On orders above ₹{promo.minOrderValue}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-sm font-bold tracking-widest text-slate-700">
                    {promo.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Section */}
        <div className="mt-6 bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
          <div className="flex flex-col justify-between gap-4 mb-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl text-slate-900">
                Menu
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                {filteredMenu.length}{" "}
                {filteredMenu.length === 1 ? "item" : "items"} available
              </p>
            </div>
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <BiSearch className="w-4 h-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search menu..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A1F]/20 focus:border-[#FF5A1F] transition-all"
              />
            </div>
          </div>

          <MenuItems
            isSeller={false}
            items={filteredMenu}
            onItemDeleted={() => {}}
          />
        </div>

        {/* Reviews Section */}
        <ReviewList restaurantId={restaurant._id} />
      </div>
    </div>
  );
};

export default RestaurantPage;
