import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import toast from "react-hot-toast";
import { BiLogOut, BiMapPin, BiPackage, BiChevronRight } from "react-icons/bi";

const Account = () => {
  const { user, setUser, setIsAuth } = useAppData();
  const navigate = useNavigate();

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "?";

  const logoutHandler = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuth(false);
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-md w-full animate-fade-in-up">
         <h1 className="text-3xl font-extrabold text-slate-800 mb-6 text-center tracking-tight">
          My Account
        </h1>

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
          <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-white to-slate-50/50 border-b border-slate-100">
            <div className="relative mb-4 group">
              {user?.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover shadow-md border-4 border-white transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#FF5A1F] to-[#D9480F] text-4xl font-bold text-white shadow-md border-4 border-white transition-transform duration-300 group-hover:scale-105">
                  {firstLetter}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {user?.name || "User"}
            </h2>
            <p className="text-slate-500 font-medium mt-1">{user?.email}</p>

            {/* Role Badge */}
            {user?.role && (
              <span className="mt-4 px-4 py-1.5 bg-[#FF5A1F]/10 text-[#FF5A1F] text-[11px] font-bold uppercase tracking-widest rounded-full">
                {user.role}
              </span>
            )}
          </div>

          {/* Action Links */}
          <div className="p-3 space-y-1">
            <button
              className="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] group"
              onClick={() => navigate("/orders")}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] transition-colors group-hover:bg-[#FF5A1F] group-hover:text-white">
                  <BiPackage className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-700">Your Orders</span>
              </div>
              <BiChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#FF5A1F] transition-colors" />
            </button>

            <button
              className="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-slate-50 active:scale-[0.98] group"
              onClick={() => navigate("/address")}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] transition-colors group-hover:bg-[#FF5A1F] group-hover:text-white">
                  <BiMapPin className="h-5 w-5" />
                </div>
                <span className="font-bold text-slate-700">Addresses</span>
              </div>
              <BiChevronRight className="h-6 w-6 text-slate-300 group-hover:text-[#FF5A1F] transition-colors" />
            </button>
          </div>

          {/* Logout */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50">
            <button
              className="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-red-50 active:scale-[0.98] group"
              onClick={logoutHandler}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-500 transition-colors group-hover:bg-red-500 group-hover:text-white">
                  <BiLogOut className="h-5 w-5" />
                </div>
                <span className="font-bold text-red-600">Logout</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
