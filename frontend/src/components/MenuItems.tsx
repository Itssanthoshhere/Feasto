import { useState } from "react";
import { createPortal } from "react-dom";
import type { IMenuItem } from "../types";
import { FiEyeOff } from "react-icons/fi";
import { BsCartPlus, BsEye } from "react-icons/bs";
import { BiTrash, BiEdit, BiX } from "react-icons/bi";
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

  const editItem = async (itemId: string, formData: FormData) => {
    try {
      setLoadingItemId(itemId);
      const { data } = await axios.put(
        `${restaurantService}/api/item/edit/${itemId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.success(data.message);
      onItemDeleted();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update item");
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
      toast.error(
        error?.response?.data?.message || "Failed to add item to cart",
      );
    } finally {
      setLoadingItemId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard
          key={item._id}
          item={item}
          isSeller={isSeller}
          isLoading={loadingItemId === item._id}
          onDelete={handleDelete}
          onToggleAvailability={toggleAvailability}
          onAddToCart={addToCart}
          onEdit={editItem}
        />
      ))}
    </div>
  );
};

interface MenuItemCardProps {
  item: IMenuItem;
  isSeller: boolean;
  isLoading: boolean;
  onDelete: (id: string) => void;
  onToggleAvailability: (id: string) => void;
  onAddToCart: (restaurantId: string, itemId: string) => void;
  onEdit: (id: string, formData: FormData) => Promise<void>;
}

const MenuItemCard = ({
  item,
  isSeller,
  isLoading,
  onDelete,
  onToggleAvailability,
  onAddToCart,
  onEdit,
}: MenuItemCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price.toString());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(item.image);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name || !price) {
      toast.error("Name and price are required");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    await onEdit(item._id, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(item.name);
    setDescription(item.description || "");
    setPrice(item.price.toString());
    setImageFile(null);
    setPreviewUrl(item.image);
  };

  return (
    <>
      <div
        className={`relative bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-[0_4px_20px_rgb(0,0,0,0.08)] hover:-translate-y-0.5 flex flex-col ${
          !item.isAvailable ? "opacity-70" : ""
        }`}
      >
        <div
          className="relative w-full overflow-hidden h-36 shrink-0 cursor-pointer group"
          onClick={() => setIsModalOpen(true)}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                !item.isAvailable ? "grayscale brightness-75" : ""
              }`}
            />
          ) : (
            <div
              className={`h-full w-full bg-slate-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
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

        <div className="p-4 flex flex-col flex-1">
          <div
            className="cursor-pointer flex-1"
            onClick={() => setIsModalOpen(true)}
          >
            <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-[#FF5A1F] transition-colors">
              {item.name}
            </h3>
            {item.description && (
              <p className="mt-1 text-xs font-medium line-clamp-2 text-slate-500">
                {item.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-1.5 mt-auto pt-3 border-t border-slate-50">
            {isSeller && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setIsModalOpen(true);
                  }}
                  disabled={isLoading}
                  className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                  title="Edit item"
                >
                  <BiEdit size={16} />
                </button>
                <button
                  onClick={() => onToggleAvailability(item._id)}
                  disabled={isLoading}
                  className={`rounded-xl p-2 transition-colors ${
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
                  onClick={() => onDelete(item._id)}
                  disabled={isLoading}
                  className="p-2 text-red-400 transition-colors rounded-xl hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  title="Delete item"
                >
                  <BiTrash size={16} />
                </button>
              </>
            )}

            {!isSeller && (
              <button
                disabled={!item.isAvailable || isLoading}
                onClick={() => onAddToCart(item.restaurantId, item._id)}
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

      {/* Item Detail Modal — rendered via portal to escape overflow-hidden ancestors */}
      {isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => {
              setIsModalOpen(false);
              if (isEditing) handleCancel();
            }}
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  if (isEditing) handleCancel();
                }}
                className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
              >
                <BiX className="h-6 w-6" />
              </button>

              {isEditing ? (
                <div className="overflow-y-auto max-h-[90vh]">
                  <div className="relative w-full h-48 shrink-0 bg-slate-100 group">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <span className="text-4xl">📸</span>
                      </div>
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-sm backdrop-blur-sm">
                      Change Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Item name"
                        className="w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#FF5A1F] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Price"
                        className="w-full text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#FF5A1F] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Item description"
                        rows={3}
                        className="w-full text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#FF5A1F] transition-colors resize-none"
                      />
                    </div>
                    <div className="flex items-center justify-end gap-3 mt-2">
                      <button
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-4 py-2.5 text-xs font-bold text-white bg-[#FF5A1F] hover:bg-[#e8521c] rounded-lg shadow-md shadow-[#FF5A1F]/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isLoading && (
                          <VscLoading size={14} className="animate-spin" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="overflow-y-auto max-h-[90vh]">
                  <div className="w-full h-56 sm:h-64 shrink-0 bg-slate-100 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <span className="text-6xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-2xl font-extrabold text-slate-900">
                        {item.name}
                      </h3>
                      <span className="text-xl font-black text-[#FF5A1F] shrink-0">
                        ₹{item.price}
                      </span>
                    </div>

                    {item.description ? (
                      <p className="mt-4 text-sm font-medium leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    ) : (
                      <p className="mt-4 text-sm italic text-slate-400">
                        No description provided.
                      </p>
                    )}

                    {!isSeller ? (
                      <div className="mt-8">
                        <button
                          disabled={!item.isAvailable || isLoading}
                          onClick={() => {
                            onAddToCart(item.restaurantId, item._id);
                            setIsModalOpen(false);
                          }}
                          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold shadow-md transition-all ${
                            !item.isAvailable || isLoading
                              ? "cursor-not-allowed bg-slate-100 text-slate-400"
                              : "bg-[#FF5A1F] text-white shadow-[#FF5A1F]/20 hover:bg-[#e8521c] active:scale-[0.98]"
                          }`}
                        >
                          {isLoading ? (
                            <VscLoading size={20} className="animate-spin" />
                          ) : (
                            <BsCartPlus size={20} />
                          )}
                          {item.isAvailable
                            ? "Add to Cart"
                            : "Currently Unavailable"}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-8">
                        <button
                          disabled={isLoading}
                          onClick={() => {
                            setIsEditing(true);
                          }}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-base font-bold shadow-md transition-all bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-[0.98] disabled:opacity-50"
                        >
                          <BiEdit size={20} />
                          Edit Item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default MenuItems;
