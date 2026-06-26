import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import {
  BiArrowBack,
  BiMinus,
  BiPlus,
  BiMapPin,
  BiCheck,
} from "react-icons/bi";
import { TbTrash, TbShoppingCart } from "react-icons/tb";

const Cart = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen px-4 py-8 bg-slate-50 sm:py-12">
        <div className="max-w-5xl mx-auto animate-fade-in-up">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 mb-8 text-sm font-bold transition-all cursor-pointer rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white group"
          >
            <BiArrowBack className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </button>

          <div className="flex flex-col items-center justify-center px-4 py-20 text-center bg-white border shadow-sm rounded-3xl border-slate-100">
            <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-slate-50">
              <TbShoppingCart className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-slate-800">
              Your cart is empty
            </h3>
            <p className="max-w-md mx-auto font-medium text-slate-500">
              Explore nearby restaurants and add your favorite dishes to get
              started.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-6 px-6 py-2.5 bg-[#FF5A1F] hover:bg-[#e8521c] text-white font-bold rounded-xl transition-colors shadow-md shadow-[#FF5A1F]/20"
            >
              Browse Restaurants
            </button>
          </div>
        </div>
      </div>
    );
  }

  const restaurant = cart[0].restaurantId as IRestaurant;

  const deliveryFee = subTotal < 250 ? 49 : 0;
  const platformFee = 7;
  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    const confirm = window.confirm("Are you sure you want to clear your cart?");
    if (!confirm) return;
    try {
      setClearingCart(true);
      await axios.delete(`${restaurantService}/api/cart/clear`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      await fetchCart();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setClearingCart(false);
    }
  };

  const checkout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-slate-50 sm:py-12">
      <div className="max-w-5xl mx-auto animate-fade-in-up">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-sm font-bold transition-all cursor-pointer rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white group"
        >
          <BiArrowBack className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back
        </button>

        {/* Checkout Steps Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {(() => {
            const currentStep = 0;
            return ["Cart", "Checkout", "Payment"].map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                      i <= currentStep
                        ? "bg-[#FF5A1F] text-white"
                        : "bg-slate-200 text-slate-500"
                    }`}
                  >
                    {i < currentStep ? <BiCheck size={16} /> : i + 1}
                  </div>
                  <span
                    className={`text-sm font-semibold hidden sm:inline ${
                      i <= currentStep ? "text-slate-800" : "text-slate-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-10 sm:w-16 h-0.5 rounded-full ${
                      i < currentStep ? "bg-[#FF5A1F]" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ));
          })()}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="space-y-4 lg:col-span-2">
            {/* Restaurant */}
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                    {restaurant.name}
                  </h2>
                  <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 font-medium">
                    <BiMapPin className="w-4 h-4 text-[#FF5A1F]" />
                    <span>{restaurant.autoLocation.formattedAddress}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    restaurant.isOpen
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {restaurant.isOpen ? "Open" : "Closed"}
                </span>
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden divide-y divide-slate-50">
              {cart.map((cartItem: ICart) => {
                const item = cartItem.itemId as IMenuItem;
                const isLoading = loadingItemId === item._id;

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-4 p-5 transition-colors hover:bg-slate-50/50"
                  >
                    <div className="relative w-20 h-20 overflow-hidden rounded-2xl shrink-0 bg-slate-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-2xl">🍽️</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate text-slate-800">
                        {item.name}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 mt-0.5">
                        ₹{item.price} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <button
                        className="flex items-center justify-center w-8 h-8 transition-colors border rounded-full border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() => decreaseQty(item._id)}
                      >
                        {isLoading ? (
                          <VscLoading size={14} className="animate-spin" />
                        ) : (
                          <BiMinus size={14} />
                        )}
                      </button>
                      <span className="w-8 font-bold text-center text-slate-800">
                        {cartItem.quantity}
                      </span>
                      <button
                        className="flex items-center justify-center w-8 h-8 transition-colors border rounded-full border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() => increaseQty(item._id)}
                      >
                        {isLoading ? (
                          <VscLoading size={14} className="animate-spin" />
                        ) : (
                          <BiPlus size={14} />
                        )}
                      </button>
                    </div>

                    <p className="w-20 font-extrabold text-right text-slate-800">
                      ₹{item.price * cartItem.quantity}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              disabled={clearingCart}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {clearingCart ? (
                <VscLoading size={16} className="animate-spin" />
              ) : (
                <TbTrash size={16} />
              )}
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 sticky top-24">
              <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between font-medium text-slate-600">
                  <span>Items ({quantity})</span>
                  <span>₹{subTotal}</span>
                </div>

                <div className="flex justify-between font-medium text-slate-600">
                  <span>Delivery Fee</span>
                  <span
                    className={
                      deliveryFee === 0 ? "text-green-600 font-bold" : ""
                    }
                  >
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>

                <div className="flex justify-between font-medium text-slate-600">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>

                {subTotal < 250 && (
                  <div className="rounded-xl bg-[#FF5A1F]/5 px-3 py-2 text-xs font-medium text-[#FF5A1F]">
                    Add items worth ₹{250 - subTotal} to get free delivery 🚀
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <span className="text-base font-extrabold text-slate-900">
                    Grand Total
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              <button
                onClick={checkout}
                className={`mt-5 w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all shadow-md ${
                  !restaurant.isOpen
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-[#FF5A1F] hover:bg-[#e8521c] shadow-[#FF5A1F]/20 active:scale-[0.98]"
                }`}
                disabled={!restaurant.isOpen}
              >
                {!restaurant.isOpen
                  ? "Restaurant is Closed"
                  : "Proceed to Checkout"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
