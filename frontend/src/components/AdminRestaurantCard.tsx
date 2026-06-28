import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { BiCheckShield, BiShieldX, BiStore, BiPhone } from "react-icons/bi";

const AdminRestaurantCard = ({
  restaurant,
  onVerify,
}: {
  restaurant: any;
  onVerify: () => void;
}) => {
  const verify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Restaurant verified");
      onVerify();
    } catch (error) {
      toast.error("Failed to verify restaurant");
    }
  };

  const unverify = async () => {
    try {
      await axios.patch(
        `${adminService}/api/v1/unverify/restaurant/${restaurant._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Restaurant unverified");
      onVerify();
    } catch (error) {
      toast.error("Failed to unverify restaurant");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
      <div className="relative h-40 w-full">
        <img
          src={restaurant.image}
          className="object-cover w-full h-full"
          alt=""
        />
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-white/90 border border-white/50">
          {restaurant.isVerified ? (
            <>
              <BiCheckShield className="text-green-500" size={16} />{" "}
              <span className="text-green-700">Verified</span>
            </>
          ) : (
            <>
              <BiShieldX className="text-amber-500" size={16} />{" "}
              <span className="text-amber-700">Pending</span>
            </>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
          {restaurant.name}
        </h3>

        <div className="mt-3 space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BiPhone className="text-slate-400" size={16} />
            {restaurant.phone}
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-600">
            <BiStore className="text-slate-400 shrink-0 mt-0.5" size={16} />
            <span className="line-clamp-2">
              {restaurant.autoLocation?.formattedAddress ||
                "No address provided"}
            </span>
          </div>
        </div>

        <div className="mt-5">
          {restaurant.isVerified ? (
            <button
              className="w-full rounded-xl bg-red-50 text-red-600 font-bold py-2.5 text-sm hover:bg-red-100 transition-colors"
              onClick={unverify}
            >
              Revoke Verification
            </button>
          ) : (
            <button
              className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold py-2.5 text-sm hover:from-emerald-600 hover:to-green-600 shadow-sm transition-all"
              onClick={verify}
            >
              Verify Restaurant
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRestaurantCard;
