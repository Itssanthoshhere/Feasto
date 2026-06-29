import { Link } from "react-router-dom";
import { BiTime, BiStar } from "react-icons/bi";

type props = {
  id: string;
  image: string;
  name: string;
  eta: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
};

const RestaurantCard = ({
  id,
  image,
  name,
  eta,
  rating,
  totalReviews,
  isOpen,
}: props) => {
  return (
    <Link
      to={`/restaurant/${id}`}
      className={`block group relative bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 ${
        !isOpen ? "opacity-80" : ""
      }`}
    >
      <div className="relative w-full h-48 overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-500 hover:scale-105 ${
            !isOpen ? "grayscale brightness-75" : ""
          }`}
        />

        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/10" />

        <div className="absolute flex gap-2 top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${
              isOpen
                ? "bg-green-500/90 text-white shadow-sm"
                : "bg-black/60 text-white"
            }`}
          >
            {isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <div className="absolute flex flex-col justify-end bottom-4 left-4 right-4">
          {totalReviews > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <BiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-white drop-shadow-sm">
                {rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-300">({totalReviews})</span>
            </div>
          )}
          <h3 className="text-xl font-extrabold leading-tight text-white truncate drop-shadow-sm">
            {name}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <BiTime className="h-5 w-5 text-[#FF5A1F]" />
          <span>{eta}</span>
        </div>
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-[#FF5A1F] transition-colors group-hover:bg-[#FF5A1F]/10">
          <svg
            className="w-4 h-4 translate-x-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default RestaurantCard;
