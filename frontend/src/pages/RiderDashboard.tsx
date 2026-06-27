import { useEffect, useRef, useState } from "react";
import { useAppData } from "../context/AppContext";
import audioRider from "../assets/rider-notification.mp3";
import toast from "react-hot-toast";
import axios from "axios";
import { riderService } from "../main";
import { BiUpload } from "react-icons/bi";

interface IRider {
  _id: string;
  phoneNumber: string;
  aadhaarNumber: string;
  drivingLicenseNumber: string;
  picture: string;
  isVerified: boolean;
  isAvailble: boolean;
}

const RiderDashboard = () => {
  const { user, setUser, setIsAuth } = useAppData();

  const [profile, setProfile] = useState<IRider | null>(null);
  const [loading, setLoading] = useState(true);

  const [toggling, setToggling] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioRider);
      audioRef.current.preload = "auto";
      audioRef.current.load();
    }
  }, []);

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
        (error) => {
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
      (error) => {
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
    <div className="space-y-4">
      <div className="mx-auto max-w-md px-4 py-4">
        <div className="rounded-xl bg-white p-4 shadow space-y-3">
          <img
            src={profile.picture}
            className="mx-auto h-24 w-24 rounded-full object-cover"
            alt=""
          />

          <p className="text-center font-semibold">{user?.name}</p>
          <p className="text-center text-sm text-gray-500">
            {profile.phoneNumber}
          </p>

          <div className="flex justify-center gap-2">
            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
              {profile.isVerified ? "Verified" : "Pending"}
            </span>

            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
              {profile.isAvailble ? "Online" : "Offline"}
            </span>
          </div>

          <div>
            <p className="text-blue-400">
              Please be within a 500 m radius of any restaurant (which we call a
              hotspot) before going online as a rider to receive orders.
            </p>
          </div>

          {profile.isVerified && (
            <button
              onClick={toggleAvailiblity}
              disabled={toggling}
              className={`w-full py-2 rounded-lg text-white font-semibold ${
                toggling
                  ? "bg-gray-400"
                  : profile.isAvailble
                    ? "bg-gray-600"
                    : "bg-[#e14b14]"
              }`}
            >
              {toggling
                ? "Updating..."
                : profile.isAvailble
                  ? "Go Offline"
                  : "Go Online"}
            </button>
          )}

          <button onClick={logoutHandler} className="btn-soft w-full !py-2">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
