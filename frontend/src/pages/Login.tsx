import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);

    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);

      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center font-sans selection:bg-[#FF5A1F]/40 selection:text-white">
      {/* Immersive Full-Screen Food Background Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.avif')" }}
      >
        {/* Dark overlay to make white text pop like Zomato */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      {/* Centered Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full max-w-4xl text-center animate-fade-in-up">
        {/* Branding */}
        <div className="mb-6 flex flex-col items-center justify-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-2xl overflow-hidden flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Feasto Logo"
              className="w-full h-full object-cover scale-[1.6]"
            />
          </div>
          <span className="text-5xl sm:text-6xl font-black text-white tracking-tighter italic lowercase">
            feasto
          </span>
        </div>

        {/* Headings mimicking Zomato */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-5 drop-shadow-lg">
          The #1 restaurant
          <br />
          management app
        </h1>
        <p className="text-xl sm:text-2xl text-slate-200 mb-10 font-medium drop-shadow-md">
          Experience fast & easy operations on Feasto
        </p>

        {/* Login Action Area */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => googleLogin()}
            disabled={loading}
            className="flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-900 shadow-2xl transition-all hover:scale-105 hover:shadow-white/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <FcGoogle size={28} />
            <span>
              {loading ? "Authenticating..." : "Continue with Google"}
            </span>
          </button>

          {/* Legal Text */}
          <p className="text-sm text-slate-300 mt-8 font-medium">
            By continuing, you agree to our{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-white transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline underline-offset-4 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
