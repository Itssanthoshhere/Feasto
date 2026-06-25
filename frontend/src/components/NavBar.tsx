import { useState } from "react";
import { useAppData } from "../context/AppContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CgShoppingCart } from "react-icons/cg";
import { BiMapPin, BiSearch } from "react-icons/bi";

const Navbar = () => {
  const currLocation = useLocation();
  const navigate = useNavigate();
  const isHomePage = currLocation.pathname === "/";

  const { isAuth, city, quantity } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/`);
    }
  };

  return (
    <div className="sticky top-0 z-50 w-full transition-all duration-300 border-b shadow-sm bg-white/85 backdrop-blur-xl border-slate-200/60">
      <div className="flex flex-col gap-3 px-4 py-3 mx-auto max-w-7xl md:flex-row md:items-center md:justify-between md:gap-6">
        {/* Top Row: Logo & Actions (Mobile) / Left & Right (Desktop) */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* Logo */}
          <Link to={"/"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] shadow-lg shadow-[#FF5A1F]/30 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Feasto"
                className="w-full h-full object-cover scale-[1.5]"
              />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-[#FF5A1F] italic lowercase drop-shadow-sm">
              feasto
            </span>
          </Link>

          {/* Actions (Mobile Only) */}
          <div className="flex items-center gap-3 md:hidden">
            <Link
              to={"/cart"}
              className="relative rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#FF5A1F]"
            >
              <CgShoppingCart className="w-6 h-6" />
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF5A1F] text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                0
              </span>
            </Link>

            {isAuth ? (
              <Link
                to="/account"
                className="flex items-center justify-center px-4 py-2 text-sm font-bold transition rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 active:scale-95"
              >
                Account
              </Link>
            ) : (
              <Link
                to="/Login"
                className="flex items-center justify-center rounded-full bg-[#FF5A1F] px-4 py-2 text-sm font-bold text-white shadow-md shadow-[#FF5A1F]/20 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FF5A1F]/40 active:translate-y-0 active:scale-95"
              >
                Login
              </Link>
            )}
          </div>
        </div>

        {!isHomePage ? (
          <form
            onSubmit={handleSearch}
            className="flex-1 w-full max-w-2xl mx-auto animate-fade-in-up md:animate-none"
          >
            <div className="flex items-center w-full rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md focus-within:border-[#FF5A1F]/50 focus-within:ring-4 focus-within:ring-[#FF5A1F]/10">
              <div className="hidden sm:flex items-center gap-1.5 rounded-l-full bg-slate-50 px-4 py-2.5 text-slate-600 border-r border-slate-200 transition-colors hover:bg-slate-100 cursor-pointer">
                <BiMapPin className="h-5 w-5 text-[#FF5A1F]" />
                <span className="max-w-[100px] truncate text-sm font-semibold">
                  {city || "Select Location"}
                </span>
              </div>

              {/* Search */}
              <div className="flex flex-1 items-center gap-2 px-4 py-2.5">
                <BiSearch className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for restaurants, cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm font-medium bg-transparent outline-none text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center flex-1 w-full my-2 animate-fade-in-up md:animate-none md:my-0">
            <div className="flex items-center gap-2 px-5 py-2 transition-all border rounded-full shadow-sm cursor-pointer border-slate-200 bg-white/50 backdrop-blur-sm hover:shadow-md hover:bg-white group">
              <BiMapPin className="h-5 w-5 text-[#FF5A1F] transition-transform group-hover:scale-110" />
              <span className="max-w-[150px] sm:max-w-[200px] truncate text-sm font-extrabold text-slate-700">
                {city || "Fetching location..."}
              </span>
            </div>
          </div>
        )}

        {/* Actions (Desktop Only) */}
        <div className="items-center hidden gap-4 md:flex">
          <Link
            to={"/cart"}
            className="relative rounded-full p-2.5 text-slate-600 transition-all hover:bg-slate-100 hover:text-[#FF5A1F] active:scale-95"
          >
            <CgShoppingCart className="h-[22px] w-[22px]" />
            <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF5A1F] text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
              {quantity}
            </span>
          </Link>

          {isAuth ? (
            <Link
              to="/account"
              className="flex items-center justify-center rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
            >
              Account
            </Link>
          ) : (
            <Link
              to="/Login"
              className="flex items-center justify-center rounded-full bg-[#FF5A1F] px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-[#FF5A1F]/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#FF5A1F]/40 active:translate-y-0 active:scale-95"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
