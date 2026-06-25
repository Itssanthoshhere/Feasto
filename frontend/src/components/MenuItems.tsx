import { useState } from "react";
import type { IMenuItem } from "../types";
import { FiEyeOff } from "react-icons/fi";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}

const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const { fetchCart } = useAppData();

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailability = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    } finally {
      setLoadingItemId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-4 border bg-slate-50 rounded-2xl border-slate-100">
          <span className="text-2xl">📋</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800">Your Menu is Empty</h2>
        <p className="max-w-sm mt-2 text-sm font-medium text-slate-500">
          Start adding delicious items to your menu to attract customers.
        </p>
      </div>
    );
  }

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      toast.success(data.message);
      fetchCart();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            className={`relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 ${
              !item.isAvailable ? "opacity-70" : ""
            }`}
            key={item._id}
          >
            <div className="relative w-full overflow-hidden h-36">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className={`h-full w-full object-cover ${
                    !item.isAvailable ? "grayscale brightness-75" : ""
                  }`}
                />
              ) : (
                <div
                  className={`h-full w-full bg-slate-100 flex items-center justify-center ${
                    !item.isAvailable ? "brightness-75" : ""
                  }`}
                >
                  <span className="text-4xl">🍽️</span>
                </div>
              )}
              {!item.isAvailable && (
                <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
                  Unavailable
                </span>
              )}
              <span className="absolute px-3 py-1 text-sm font-extrabold rounded-full shadow-sm bottom-3 right-3 bg-white/90 backdrop-blur-sm text-slate-800">
                ₹{item.price}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-base font-bold text-slate-800">
                {item.name}
              </h3>
              {item.description && (
                <p className="mt-1 text-sm font-medium line-clamp-2 text-slate-500">
                  {item.description}
                </p>
              )}

              <div className="flex items-center justify-end gap-1.5 mt-3 pt-3 border-t border-slate-50">
                {isSeller && (
                  <>
                    <button
                      onClick={() => toggleAvailability(item._id)}
                      disabled={isLoading}
                      className={`rounded-xl p-2 text-sm transition-colors ${
                        item.isAvailable
                          ? "text-green-600 hover:bg-green-50"
                          : "text-slate-400 hover:bg-slate-50"
                      } disabled:opacity-50`}
                      title={
                        item.isAvailable ? "Mark unavailable" : "Mark available"
                      }
                    >
                      {isLoading ? (
                        <VscLoading size={16} className="animate-spin" />
                      ) : item.isAvailable ? (
                        <BsEye size={16} />
                      ) : (
                        <FiEyeOff size={16} />
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-2 text-red-400 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600"
                      title="Delete item"
                    >
                      <BiTrash size={16} />
                    </button>
                  </>
                )}

                {!isSeller && (
                  <button
                    disabled={!item.isAvailable || isLoading}
                    onClick={() => addToCart(item.restaurantId, item._id)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-bold transition-all ${
                      !item.isAvailable || isLoading
                        ? "cursor-not-allowed text-slate-300 bg-slate-50"
                        : "text-[#FF5A1F] bg-[#FF5A1F]/5 hover:bg-[#FF5A1F]/10"
                    }`}
                  >
                    {isLoading ? (
                      <VscLoading size={14} className="animate-spin" />
                    ) : (
                      <BsCartPlus size={14} />
                    )}
                    Add
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
