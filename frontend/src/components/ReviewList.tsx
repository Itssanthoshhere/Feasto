import { useState, useEffect } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import type { IReview } from "../types";
import { FaStar } from "react-icons/fa";
import { VscLoading } from "react-icons/vsc";

interface Props {
  restaurantId: string;
}

const ReviewList = ({ restaurantId }: Props) => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId]);

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/review/restaurant/${restaurantId}`,
      );
      setReviews(data.reviews || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-40 mt-6">
        <VscLoading size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 text-center mt-6">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
          ⭐
        </div>
        <h3 className="text-lg font-bold text-slate-800">No reviews yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">
          Be the first to review this restaurant after your order is delivered!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 mt-6">
      <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl text-slate-900 mb-6">
        Customer Reviews ({reviews.length})
      </h2>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="border-b border-slate-100 pb-6 last:border-0 last:pb-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                  {review.userImage ? (
                    <img
                      src={review.userImage}
                      alt={review.userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-lg font-bold uppercase">
                      {review.userName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    {review.userName}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                <FaStar className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-bold text-amber-700">
                  {review.rating.toFixed(1)}
                </span>
              </div>
            </div>
            {review.comment && (
              <p className="mt-3 text-sm font-medium leading-relaxed text-slate-600">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
