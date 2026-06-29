import { useState, useEffect } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiTrash, BiCheck, BiX } from "react-icons/bi";
import { FiPercent } from "react-icons/fi";

interface IPromotion {
  _id: string;
  code: string;
  discountType: "percent" | "flat";
  discountValue: number;
  isActive: boolean;
  minOrderValue: number;
  expiresAt?: string;
  createdAt: string;
}

const RestaurantPromotions = () => {
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [loading, setLoading] = useState(true);

  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "percent",
    discountValue: "",
    minOrderValue: "",
    expiresAt: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${restaurantService}/api/promotion/my`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      setPromotions(data.promotions || []);
    } catch (error) {
      console.log(error);
      toast.error("Failed to load promotions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code || !newPromo.discountValue) {
      toast.error("Code and discount value are required");
      return;
    }

    try {
      setIsCreating(true);
      const { data } = await axios.post(
        `${restaurantService}/api/promotion/new`,
        newPromo,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      setNewPromo({
        code: "",
        discountType: "percent",
        discountValue: "",
        minOrderValue: "",
        expiresAt: "",
      });
      fetchPromotions();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to create promo code",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggle = async (promoId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/promotion/toggle/${promoId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      fetchPromotions();
    } catch (error) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!window.confirm("Delete this promo code?")) return;
    try {
      const { data } = await axios.delete(
        `${restaurantService}/api/promotion/${promoId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(data.message);
      fetchPromotions();
    } catch (error) {
      toast.error("Failed to delete promo code");
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <VscLoading size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        {/* Left Col: List of promotions */}
        <div className="space-y-4">
          <h3 className="text-xl font-extrabold text-slate-800">
            Your Promotions
          </h3>
          {promotions.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-8 text-center">
              <span className="mb-2 block text-3xl">🎫</span>
              <p className="font-medium text-slate-500">No active promotions</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {promotions.map((promo) => (
                <div
                  key={promo._id}
                  className={`relative flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all ${
                    promo.isActive
                      ? "border-emerald-100 bg-emerald-50/50"
                      : "border-slate-100 bg-slate-50 grayscale-[0.5]"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-white px-2 py-1 text-sm font-black uppercase tracking-widest shadow-sm border border-slate-100">
                        {promo.code}
                      </span>
                      {!promo.isActive && (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-600">
                      Discount:{" "}
                      <span className="font-bold text-slate-800">
                        {promo.discountType === "percent"
                          ? `${promo.discountValue}%`
                          : `₹${promo.discountValue}`}
                      </span>
                      {promo.minOrderValue > 0 && (
                        <span className="ml-2 text-xs text-slate-400">
                          (Min order: ₹{promo.minOrderValue})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(promo._id)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        promo.isActive
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                      title={promo.isActive ? "Deactivate" : "Activate"}
                    >
                      {promo.isActive ? (
                        <BiCheck size={18} />
                      ) : (
                        <BiX size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(promo._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100"
                      title="Delete"
                    >
                      <BiTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Create form */}
        <div>
          <div className="sticky top-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800 flex items-center gap-2">
              <FiPercent className="text-[#FF5A1F]" /> Create Promo
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Promo Code
                </label>
                <input
                  type="text"
                  required
                  value={newPromo.code}
                  onChange={(e) =>
                    setNewPromo({
                      ...newPromo,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold uppercase outline-none focus:border-[#FF5A1F]"
                  placeholder="e.g. SUMMER20"
                />
              </div>

              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Type
                  </label>
                  <select
                    value={newPromo.discountType}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        discountType: e.target.value as "percent" | "flat",
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm font-medium outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="percent">% Off</option>
                    <option value="flat">₹ Flat</option>
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">
                    Value
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newPromo.discountValue}
                    onChange={(e) =>
                      setNewPromo({
                        ...newPromo,
                        discountValue: e.target.value,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold outline-none focus:border-[#FF5A1F]"
                    placeholder={
                      newPromo.discountType === "percent" ? "20" : "150"
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-400">
                  Min Order Value (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newPromo.minOrderValue}
                  onChange={(e) =>
                    setNewPromo({ ...newPromo, minOrderValue: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#FF5A1F]"
                  placeholder="e.g. 500"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                {isCreating && <VscLoading className="animate-spin" />}
                Create Code
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantPromotions;
