import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import audioRider from "../assets/rider-notification.mp3";
import toast from "react-hot-toast";
import axios from "axios";
import { riderService } from "../main";
import {
  BiUpload,
  BiLogOut,
  BiCheckShield,
  BiEdit,
  BiWallet,
  BiPackage,
} from "react-icons/bi";
import type { IOrder } from "../types";
import { useSocket } from "../context/SocketContext";
import RiderOrderRequest from "../components/RiderOrderRequest";
import RiderCurrentOrder from "../components/RiderCurrentOrder";
import RiderOrderMap from "../components/RiderOrderMap";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadhaarNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
  totalEarnings: number;
  totalDeliveries: number;
}

const RiderDashboard = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const { socket } = useSocket();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);

  const [toggling, setToggling] = useState(false);

  const [incomingOrders, setIncomingOrders] = useState<string[]>([]);
  const [currentOrder, setCurrentOrder] = useState<IOrder | null>(null);

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAadhaar, setEditAadhaar] = useState("");
  const [editLicense, setEditLicense] = useState("");
  const [editImage, setEditImage] = useState<File | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const [audioUnlocked, setAudioUnlocked] = useState(() => {
    const saved = localStorage.getItem("riderAudioEnabled");
    return saved !== null ? JSON.parse(saved) : false;
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioRider);
      audioRef.current.preload = "auto";
      audioRef.current.load();
    }
  }, []);

  const toggleAudio = () => {
    const newState = !audioUnlocked;
    setAudioUnlocked(newState);
    localStorage.setItem("riderAudioEnabled", JSON.stringify(newState));

    if (newState) {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current!.pause();
            audioRef.current!.currentTime = 0;
            toast.success("Sound Enabled");
          })
          .catch((err) => {
            console.log("Failed to unlock audio: ", err);
            setAudioUnlocked(false);
            localStorage.setItem("riderAudioEnabled", "false");
            toast.error("Tap again to enable sound");
          });
      }
    } else {
      toast.success("Sound Disabled");
    }
  };

  useEffect(() => {
    if (!socket) return;

    const onOrderAvailable = ({ orderId }: { orderId: string }) => {
      setIncomingOrders((prev) =>
        prev.includes(orderId) ? prev : [...prev, orderId],
      );

      if (audioUnlocked && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setIncomingOrders((prev) => prev.filter((id) => id !== orderId));
      }, 10000); // 10 seconds
    };

    socket.on("order:available", onOrderAvailable);

    return () => {
      socket.off("order:available", onOrderAvailable);
    };
  }, [socket, audioUnlocked]);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${riderService}/api/rider/myprofile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setProfile(data || null);
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "rider") fetchProfile();
    else setLoading(false);
  }, [user]);

  const fetchCurrentOrder = async () => {
    try {
      const { data } = await axios.get(
        `${riderService}/api/rider/order/current`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      setCurrentOrder(data.order);
    } catch (error) {
      console.log(error);
      setCurrentOrder(null);
    }
  };

  useEffect(() => {
    fetchCurrentOrder();
  }, []);

  const toggleAvailiblity = () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    setToggling(true); // the button gets disabled

    const targetAvailability = !profile?.isAvailble;

    const performToggle = async (latitude?: number, longitude?: number) => {
      try {
        await axios.patch(
          `${riderService}/api/rider/toggle`,
          {
            isAvailble: targetAvailability,
            ...(latitude !== undefined && longitude !== undefined
              ? { latitude, longitude }
              : {}),
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        toast.success(
          targetAvailability ? "You are online" : "You are offline",
        );

        fetchProfile();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to toggle status");
      } finally {
        setToggling(false);
      }
    };

    if (targetAvailability) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          performToggle(position.coords.latitude, position.coords.longitude);
        },
        () => {
          toast.error("Location access denied. Please enable location.");
          setToggling(false);
        },
      );
    } else {
      performToggle();
    }
  };

  const [phoneNumber, setPhoneNumber] = useState("");
  const [aadhaarNumber, setaadhaarNumber] = useState("");
  const [drivingLicenseNumber, setDrivingLicenseNumber] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        You are not registered as a rider
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        Loading rider details...
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!navigator.geolocation) {
      toast.error("Location Access Required");
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }

    if (!/^\d{12}$/.test(aadhaarNumber)) {
      toast.error("Aadhaar number must be exactly 12 digits");
      return;
    }

    if (
      !/^[A-Z0-9]{15,16}$/i.test(drivingLicenseNumber.replace(/[\s-]/g, ""))
    ) {
      toast.error("Driving license must be 15 or 16 alphanumeric characters");
      return;
    }

    setSubmitting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const formData = new FormData();

        formData.append("phoneNumber", phoneNumber);
        formData.append("aadhaarNumber", aadhaarNumber);
        formData.append("drivingLicenseNumber", drivingLicenseNumber);
        formData.append("latitude", position.coords.latitude.toString());
        formData.append("longitude", position.coords.longitude.toString());

        if (image) {
          formData.append("file", image);
        }

        try {
          const { data } = await axios.post(
            `${riderService}/api/rider/new`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );

          toast.success(data.message);
          fetchProfile();
        } catch (error: any) {
          console.error(
            "Upload error details:",
            error?.response?.status || "Unknown",
            error?.message || "Error",
          );
          toast.error(
            error?.response?.data?.message || "Failed to add profile",
          );
        } finally {
          setSubmitting(false);
        }
      },
      () => {
        toast.error("Location access denied. Please enable location.");
        setSubmitting(false);
      },
    );
  };

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setIsAuth(false);
    setUser(null);
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const openEditModal = () => {
    if (!profile) return;
    setEditPhone(profile.phoneNumber);
    setEditAadhaar("");
    setEditLicense("");
    setEditImage(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (editPhone && !/^\d{10}$/.test(editPhone)) {
      toast.error("Phone number must be exactly 10 digits");
      return;
    }
    if (editAadhaar && !/^\d{12}$/.test(editAadhaar)) {
      toast.error("Aadhaar number must be exactly 12 digits");
      return;
    }
    if (
      editLicense &&
      !/^[A-Z0-9]{15,16}$/i.test(editLicense.replace(/[\s-]/g, ""))
    ) {
      toast.error("Driving license must be 15 or 16 alphanumeric characters");
      return;
    }

    setEditSubmitting(true);
    try {
      const formData = new FormData();
      if (editPhone) formData.append("phoneNumber", editPhone);
      if (editAadhaar) formData.append("aadhaarNumber", editAadhaar);
      if (editLicense) formData.append("drivingLicenseNumber", editLicense);
      if (editImage) formData.append("file", editImage);

      await axios.patch(`${riderService}/api/rider/profile`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Profile updated!");
      setShowEditModal(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setEditSubmitting(false);
    }
  };

  if (user?.role !== "rider") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        You are not registered as a rider
      </div>
    );
  }

  if (!profile)
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-lg rounded-xl bg-white p-6 shadow-sm space-y-5">
          <h1 className="text-xl font-semibold">Add Your Profile</h1>
          <input
            type="tel"
            placeholder="Aadhar number"
            value={aadhaarNumber}
            onChange={(e) => setaadhaarNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
          />
          <input
            type="tel"
            placeholder="Contact Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
          />

          <input
            type="text"
            placeholder="driving Licence"
            value={drivingLicenseNumber}
            onChange={(e) => setDrivingLicenseNumber(e.target.value)}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none"
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-4 text-sm text-gray-600 hover:bg-gray-50">
            <BiUpload className="h-5 w-5 text-orange-600" />
            {image ? image.name : "Upload your image"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />
          </label>

          <button
            className="w-full rounded-lg py-3 text-sm font-semibold text-white bg-[#e14b14]"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Add Profile"}
          </button>
        </div>
      </div>
    );

  return (
    <>
      <div className="min-h-screen bg-slate-50 pb-24">
        {/* ── Top Header ── */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-10 px-4 h-16 flex items-center justify-between shadow-sm">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Rider Dashboard
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                audioUnlocked
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  : "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
              }`}
            >
              {audioUnlocked ? "🔊 Sound On" : "🔇 Sound Off"}
            </button>
            <button
              onClick={logoutHandler}
              className="text-slate-500 hover:text-red-500 transition-colors p-2"
            >
              <BiLogOut size={24} />
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-md px-4 py-6 space-y-6">
          {/* ── Profile Card ── */}
          <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-linear-to-r from-orange-400 to-amber-500 opacity-20"></div>

            <div className="relative mt-2">
              <img
                src={profile.picture}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md z-10 relative"
                alt=""
              />
              {profile.isVerified && (
                <div className="absolute bottom-0 right-0 bg-green-500 text-white rounded-full p-1 border-2 border-white shadow-sm z-20">
                  <BiCheckShield size={16} />
                </div>
              )}
            </div>

            <div className="text-center mt-4 space-y-1">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {user?.name}
              </h2>
              <p className="text-sm font-medium text-slate-500 tracking-wide">
                {profile.phoneNumber}
              </p>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={openEditModal}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors cursor-pointer"
            >
              <BiEdit size={16} /> Edit Profile
            </button>

            {/* Earnings Stats */}
            {profile.isVerified && (
              <div className="w-full mt-5 grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <BiWallet size={16} className="text-emerald-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                      Earnings
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-700">
                    ₹{(profile.totalEarnings || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-4 border border-violet-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                      <BiPackage size={16} className="text-violet-600" />
                    </div>
                    <span className="text-[11px] font-semibold text-violet-600 uppercase tracking-wider">
                      Deliveries
                    </span>
                  </div>
                  <p className="text-2xl font-black text-violet-700">
                    {profile.totalDeliveries || 0}
                  </p>
                </div>
              </div>
            )}

            {/* Toggle Online/Offline */}
            {profile.isVerified && !currentOrder && (
              <div className="w-full mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800">Duty Status</span>
                  <span className="text-xs text-slate-500">
                    {profile.isAvailble
                      ? "You are online and visible"
                      : "You are currently offline"}
                  </span>
                </div>
                <button
                  onClick={toggleAvailiblity}
                  disabled={toggling}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    profile.isAvailble ? "bg-green-500" : "bg-slate-300"
                  } ${toggling ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform shadow-sm ${
                      profile.isAvailble ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}

            {!profile.isAvailble && profile.isVerified && !currentOrder && (
              <div className="w-full mt-4 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 text-center">
                <p className="text-xs font-medium text-blue-800">
                  Tip: Be within a 500m radius of any restaurant (hotspot)
                  before going online to receive orders faster.
                </p>
              </div>
            )}
          </div>
        </div>

        {profile.isAvailble && incomingOrders.length > 0 && (
          <div className="mx-auto max-w-md px-4 space-y-3">
            <h3 className=" font-semibold text-gray-700">Incoming Orders</h3>
            {incomingOrders.map((id) => (
              <RiderOrderRequest
                key={id}
                orderId={id}
                onAccepted={() => {
                  fetchProfile();
                  fetchCurrentOrder();
                }}
              />
            ))}
          </div>
        )}

        {currentOrder && (
          <div className="mx-auto max-w-md px-4 space-y-4">
            <RiderCurrentOrder
              order={currentOrder}
              onStatusUpdate={fetchCurrentOrder}
            />
            <RiderOrderMap order={currentOrder} />
          </div>
        )}
      </div>

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in zoom-in">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Edit Profile</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 10) setEditPhone(val);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Aadhaar Number
                </label>
                <input
                  type="text"
                  value={editAadhaar}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 12) setEditAadhaar(val);
                  }}
                  placeholder="Enter new Aadhaar number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Driving License
                </label>
                <input
                  type="text"
                  value={editLicense}
                  onChange={(e) => {
                    const val = e.target.value
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .toUpperCase();
                    if (val.length <= 16) setEditLicense(val);
                  }}
                  placeholder="Enter new license number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 hover:bg-slate-50 transition-colors">
                <BiUpload className="h-5 w-5 text-orange-500" />
                {editImage ? editImage.name : "Change profile picture"}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => setEditImage(e.target.files?.[0] || null)}
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                disabled={editSubmitting}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 cursor-pointer"
              >
                {editSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RiderDashboard;
