import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { restaurantService } from "../main";
import type { IReview } from "../types";
import { VscLoading } from "react-icons/vsc";
import { FaStar } from "react-icons/fa";

interface Props {
  orderId: string;
}

const ReviewForm = ({ orderId }: Props) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<IReview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewStatus();
  }, [orderId]);

  const fetchReviewStatus = async () => {
    try {
      const { data } = await axios.get(
        `${restaurantService}/api/review/order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      if (data.review) {
        setExistingReview(data.review);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        `${restaurantService}/api/review/new/${orderId}`,
        { rating, comment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success("Review submitted successfully!");
      setExistingReview(data.review);
    } catch (error) {
      console.log(error);
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to submit review");
      } else {
        toast.error("Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center justify-center h-40">
        <VscLoading size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (existingReview) {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">Your Review</h3>
          <span className="text-xs font-bold px-2.5 py-1 bg-green-50 text-green-700 rounded-full">
            Published
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <FaStar
              key={i}
              className={`h-5 w-5 ${
                i < existingReview.rating ? "text-amber-400" : "text-slate-200"
              }`}
            />
          ))}
        </div>
        {existingReview.comment && (
          <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl italic">
            "{existingReview.comment}"
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-2">Rate your order</h3>
      <p className="text-sm text-slate-500 mb-6">
        How was your food? Let the restaurant know by leaving a review.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-2">
          {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;
            return (
              <button
                type="button"
                key={i}
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              >
                <FaStar
                  className={`h-8 w-8 transition-colors ${
                    ratingValue <= (hover || rating)
                      ? "text-amber-400 drop-shadow-sm"
                      : "text-slate-200"
                  }`}
                />
              </button>
            );
          })}
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Leave a comment (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you liked (or didn't like)..."
            rows={3}
            className="w-full text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#FF5A1F] focus:ring-4 focus:ring-[#FF5A1F]/10 transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full py-3.5 px-4 bg-[#FF5A1F] hover:bg-[#e8521c] text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-[#FF5A1F]/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting && <VscLoading size={16} className="animate-spin" />}
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
