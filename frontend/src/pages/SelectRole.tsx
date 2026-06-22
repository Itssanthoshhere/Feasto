import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { authService } from "../main";
import toast from "react-hot-toast";

// type Role = "customer" | "rider" | "seller" | null;
type ValidRole = "customer" | "rider" | "seller";
type Role = ValidRole | null;

const SelectRole = () => {
  const [role, setRole] = useState<Role>(null);
  const { setUser } = useAppData();
  const navigate = useNavigate();

  // const roles: Role[] = ["customer", "rider", "seller"];
  const roles: ValidRole[] = ["customer", "rider", "seller"];

  const roleDetails = {
    customer: {
      title: "Customer",
      description: "Order delicious food",
      emoji: "🍔",
    },
    rider: {
      title: "Rider",
      description: "Deliver happiness",
      emoji: "🛵",
    },
    seller: {
      title: "Seller",
      description: "Grow your business",
      emoji: "🏪",
    },
  };

  const addRole = async () => {
    try {
      const { data } = await axios.put(
        `${authService}/api/auth/add/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      localStorage.setItem("token", data.token);
      setUser(data.user);

      navigate("/", { replace: true });
    } catch (error) {
      toast.error("Something went wrong");
      console.log(error);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center font-sans selection:bg-[#FF5A1F]/40 selection:text-white">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.avif')" }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-lg px-4 animate-fade-in-up">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 text-center drop-shadow-md">
            Join Feasto As
          </h1>
          <p className="text-slate-300 text-center mb-8 font-medium">
            Select how you'd like to use our platform
          </p>

          <div className="w-full space-y-4">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`
                  w-full group flex items-center p-4 rounded-2xl border-2 transition-all duration-300 ease-out
                  ${
                    role === r
                      ? "border-[#FF5A1F] bg-[#FF5A1F]/10 shadow-[0_0_20px_rgba(255,90,31,0.2)]"
                      : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30"
                  }
                `}
              >
                <div
                  className={`
                  flex items-center justify-center w-14 h-14 rounded-full text-2xl
                  ${role === r ? "bg-[#FF5A1F] text-white" : "bg-white/10 text-white group-hover:scale-110 transition-transform"}
                `}
                >
                  {roleDetails[r].emoji}
                </div>
                <div className="ml-5 text-left">
                  <h3
                    className={`text-xl font-bold ${role === r ? "text-white" : "text-slate-200"}`}
                  >
                    {roleDetails[r].title}
                  </h3>
                  <p
                    className={`text-sm ${role === r ? "text-slate-200" : "text-slate-400"}`}
                  >
                    {roleDetails[r].description}
                  </p>
                </div>

                <div
                  className={`
                  ml-auto w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                  ${role === r ? "border-[#FF5A1F]" : "border-white/30"}
                `}
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-[#FF5A1F] transition-transform ${role === r ? "scale-100" : "scale-0"}`}
                  />
                </div>
              </button>
            ))}
          </div>

          <button
            disabled={!role}
            onClick={addRole}
            className={`
              mt-8 w-full rounded-2xl px-6 py-4 text-lg font-bold transition-all duration-300
              ${
                role
                  ? "bg-[#FF5A1F] text-white shadow-[0_8px_20px_rgba(255,90,31,0.3)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-white/10 text-white/40 cursor-not-allowed border border-white/5"
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div> 
  );
};

export default SelectRole;
