import { useState } from "react";
import toast from "react-hot-toast";
import { adminService } from "../main";
import axios from "axios";
import { BiCheckShield, BiShieldX, BiIdCard, BiCar } from "react-icons/bi";
import RiderDetailModal from "./RiderDetailModal";

const RiderAdmin = ({
  rider,
  onVerify,
}: {
  rider: any;
  onVerify: () => void;
}) => {
  const [showModal, setShowModal] = useState(false);

  const verify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.patch(
        `${adminService}/api/v1/verify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Rider verified");
      onVerify();
    } catch (error) {
      toast.error("Failed to verify rider");
    }
  };

  const unverify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await axios.patch(
        `${adminService}/api/v1/unverify/rider/${rider._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Rider unverified");
      onVerify();
    } catch (error) {
      toast.error("Failed to unverify rider");
    }
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] cursor-pointer hover:-translate-y-1"
      >
        <div className="relative h-40 w-full">
          <img
            src={rider.picture}
            className="object-cover w-full h-full"
            alt=""
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md bg-white/90 border border-white/50">
            {rider.isVerified ? (
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
            {rider.phoneNumber}
          </h3>

          <div className="mt-3 space-y-2 flex-1">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BiIdCard className="text-slate-400" size={16} />
              <span className="font-medium text-slate-700">Aadhaar:</span>{" "}
              {rider.aadhaarNumber || rider.aadharNumber}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <BiCar className="text-slate-400 shrink-0" size={16} />
              <span className="font-medium text-slate-700">DL:</span>{" "}
              {rider.drivingLicenseNumber}
            </div>
          </div>

          <div className="mt-5">
            {rider.isVerified ? (
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
                Verify Rider
              </button>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <RiderDetailModal rider={rider} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default RiderAdmin;
