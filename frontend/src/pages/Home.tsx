import { useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState } from "react";
import type { IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import RestaurantCard from "../components/RestaurantCard";
import { BiSearch, BiMapAlt } from "react-icons/bi";

const Home = () => {
  const { location, loadingLocation } = useAppData();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const [restaurants, setRestaurants] = useState<IRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  const getDistanceKm = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371; // Earth radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const fetchRestaurants = async () => {
    if (location?.latitude == null || location?.longitude == null) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${restaurantService}/api/restaurant/all`,
        {
          params: {
            latitude: location.latitude,
            longitude: location.longitude,
            search,
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setRestaurants(data.restaurants ?? []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, [location, search]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) {
      setSearchParams({ search: searchInput });
    } else {
      setSearchParams({});
    }
  };

  if (loading || loadingLocation) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="h-16 w-16 bg-[#FF5A1F]/20 rounded-full flex items-center justify-center">
            <BiMapAlt className="h-8 w-8 text-[#FF5A1F]" />
          </div>
          <p className="font-medium tracking-wide text-slate-500">
            Finding restaurants near you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-slate-50 sm:py-12">
      <div className="mx-auto max-w-7xl animate-fade-in-up">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-[#FF5A1F]/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-[#FF5A1F]/5 rounded-full blur-2xl" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="inline-block px-3 py-1 mb-4 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-xs font-bold uppercase tracking-[0.15em]">
              FEASTO EXCLUSIVE
            </span>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight sm:text-5xl text-slate-900">
              Discover Great Food <br className="hidden sm:block" /> Around You
            </h1>
            <p className="mb-8 text-lg font-medium text-slate-500">
              Freshly prepared meals from nearby restaurants, delivered fast to
              your door.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center max-w-xl mx-auto shadow-sm"
            >
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <BiSearch className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for restaurants, cuisines..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-24 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-[#FF5A1F]/10 focus:border-[#FF5A1F] focus:bg-white transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 px-5 py-2 bg-[#FF5A1F] hover:bg-[#e14b14] text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Restaurants Section */}
        {search && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">
              Search results for{" "}
              <span className="text-[#FF5A1F]">"{search}"</span>
            </h2>
            <button
              onClick={() => {
                setSearchInput("");
                setSearchParams({});
              }}
              className="text-sm font-semibold transition-colors text-slate-500 hover:text-slate-800"
            >
              Clear Search
            </button>
          </div>
        )}

        {restaurants.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {restaurants.map((res) => {
              const [resLng, resLat] = res.autoLocation.coordinates;

              const distance = getDistanceKm(
                location.latitude,
                location.longitude,
                resLat,
                resLng,
              );

              return (
                <div key={res._id} className="group">
                  <RestaurantCard
                    id={res._id}
                    name={res.name}
                    image={res.image ?? ""}
                    distance={`${distance}`}
                    isOpen={res.isOpen}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-20 text-center bg-white border shadow-sm rounded-3xl border-slate-100">
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-slate-50">
              <BiSearch className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">
              No restaurants found
            </h3>
            <p className="max-w-md mx-auto font-medium text-slate-500">
              {search
                ? `We couldn't find any restaurants matching "${search}" near your location.`
                : "It looks like there aren't any restaurants available in your area right now."}
            </p>

            {search && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearchParams({});
                }}
                className="mt-6 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
