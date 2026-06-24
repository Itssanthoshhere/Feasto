import { useNavigate } from "react-router-dom";
import { BiMapPin } from "react-icons/bi";

type props = {
  id: string;
  image: string;
  name: string;
  distance: string;
  isOpen: boolean;
};

const RestaurantCard = ({ id, image, name, distance, isOpen }: props) => {
  const navigate = useNavigate();
  return (
    <div
      className={`relative bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 ${
        !isOpen ? "opacity-80" : ""
      }`}
      onClick={() => navigate(`/restaurant/${id}`)}
    >
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className={`h-full w-full object-cover transition-transform duration-500 hover:scale-105 ${
            !isOpen ? "grayscale brightness-75" : ""
          }`}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

        <div className="absolute top-4 left-4 flex gap-2">
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

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <h3 className="truncate text-xl font-extrabold text-white drop-shadow-sm leading-tight">
            {name}
          </h3>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
          <BiMapPin className="h-4 w-4 text-[#FF5A1F]" />
          <span>{distance} km away</span>
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
    </div>
  );
};

export default RestaurantCard;
