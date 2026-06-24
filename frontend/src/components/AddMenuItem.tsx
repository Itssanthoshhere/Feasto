import axios from "axios";
import { useState } from "react";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { BiUpload } from "react-icons/bi";

const AddMenuItem = ({ onItemAdded }: { onItemAdded: () => void }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage(null);
    setPreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !image) {
      toast.error("Name, price and image are required");
      return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("file", image);

    try {
      setLoading(true);
      await axios.post(`${restaurantService}/api/item/new`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item added successfully");
      resetForm();
      onItemAdded();
    } catch (error) {
      console.log(error);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Add Menu Item
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Create a new item for your restaurant menu
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Item Name
        </label>
        <input
          type="text"
          placeholder="e.g. Butter Chicken"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-[#FF5A1F] focus:bg-white placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Description
        </label>
        <textarea
          placeholder="A short description of this item..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-[#FF5A1F] focus:bg-white resize-none placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Price (₹)
        </label>
        <input
          type="number"
          placeholder="e.g. 249"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 outline-none transition-colors focus:border-[#FF5A1F] focus:bg-white placeholder:text-slate-400"
        />
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
          Item Image
        </label>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-sm font-medium text-slate-500 transition-colors hover:border-[#FF5A1F]/40 hover:bg-[#FF5A1F]/5">
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-32 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <BiUpload className="h-8 w-8 text-[#FF5A1F]/60" />
          )}
          <span className="text-slate-600">
            {image ? image.name : "Click to upload an image"}
          </span>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </label>
      </div>

      <button
        disabled={loading}
        onClick={handleSubmit}
        className="w-full rounded-xl bg-[#FF5A1F] hover:bg-[#e14b14] text-white text-sm font-bold py-3.5 transition-all shadow-lg shadow-[#FF5A1F]/20 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:scale-100"
      >
        {loading ? "Adding..." : "Add Item"}
      </button>
    </div>
  );
};

export default AddMenuItem;
