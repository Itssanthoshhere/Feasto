import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import {
  BiArrowBack,
  BiMap,
  BiCheck,
  BiCreditCard,
  BiReceipt,
  BiShieldQuarter,
} from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import { TbShoppingCart } from "react-icons/tb";
import { FiPercent } from "react-icons/fi";

interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [addressError, setAddressError] = useState(false);
  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Promo Code State
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        setAddressError(false);
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        setAddresses(data || []);
      } catch (error) {
        console.log(error);
        setAddressError(true);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

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
              Add items to your cart before proceeding to checkout.
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
  const grandTotal = subTotal + deliveryFee + platformFee - discountAmount;

  const validatePromoCode = async () => {
    if (!promoCodeInput.trim()) return;
    
    setIsValidatingPromo(true);
    setPromoError("");
    
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/promotion/validate`,
        {
          code: promoCodeInput.trim(),
          restaurantId: restaurant._id,
          orderTotal: subTotal,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      setAppliedPromo(data.code);
      setDiscountAmount(data.discountAmount);
      setPromoCodeInput("");
      toast.success("Promo code applied!");
    } catch (error: any) {
      setPromoError(error.response?.data?.message || "Invalid promo code");
      setAppliedPromo(null);
      setDiscountAmount(0);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscountAmount(0);
    setPromoError("");
  };

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
          distance: 0,
          promoCode: appliedPromo,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return data;
    } catch (error) {
      toast.error("Failed to create order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Feasto",
        description: "Food Order Payment",
        image: "/logo.png",
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            await fetchCart();
            toast.success("Payment successful!");
            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#FF5A1F",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed, please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);

      const order = await createOrder("stripe");
      if (!order) return;

      const { data } = await axios.post(
        `${utilsService}/api/payment/stripe/create`,
        {
          orderId: order.orderId,
        },
      );

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
    } finally {
      setLoadingStripe(false);
    }
  };

  const isPayDisabled =
    !selectedAddressId || loadingRazorpay || loadingStripe || creatingOrder || isValidatingPromo;

  return (
    <div className="min-h-screen px-4 py-8 bg-slate-50 sm:py-12">
      <div className="max-w-5xl mx-auto animate-fade-in-up">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 mb-6 text-sm font-bold transition-all cursor-pointer rounded-xl text-slate-600 hover:text-slate-900 hover:bg-white group"
        >
          <BiArrowBack className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Back to Cart
        </button>

        {/* Checkout Steps Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {["Cart", "Checkout", "Payment"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                    i <= 1
                      ? "bg-[#FF5A1F] text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {i < 1 ? <BiCheck size={16} /> : i + 1}
                </div>
                <span
                  className={`text-sm font-semibold hidden sm:inline ${
                    i <= 1 ? "text-slate-800" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
              {i < 2 && (
                <div
                  className={`w-10 sm:w-16 h-0.5 rounded-full ${
                    i < 1 ? "bg-[#FF5A1F]" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-5 lg:col-span-2">
            {/* Restaurant Info */}
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 overflow-hidden rounded-2xl shrink-0 bg-slate-100">
                  {restaurant.image ? (
                    <img
                      src={restaurant.image}
                      alt={restaurant.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-[#FF5A1F]/10">
                      <BiReceipt className="w-6 h-6 text-[#FF5A1F]" />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
                    {restaurant.name}
                  </h2>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {restaurant.autoLocation.formattedAddress}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 shrink-0">
                  <BiMap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900">
                    Delivery Address
                  </h3>
                  <p className="text-xs font-medium text-slate-400">
                    Select where you want your order delivered
                  </p>
                </div>
              </div>

              {loadingAddress ? (
                <div className="flex items-center justify-center py-10">
                  <VscLoading
                    size={24}
                    className="animate-spin text-slate-300"
                  />
                </div>
              ) : addressError ? (
                <div className="py-8 text-center rounded-2xl bg-slate-50">
                  <div className="flex justify-center mb-2">
                    <BiMap className="w-10 h-10 text-red-300" />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">
                    Failed to load addresses
                  </p>
                  <button
                    onClick={() => {
                      setLoadingAddress(true);
                      // Trigger re-fetch by toggling a dummy state or just calling fetchCart/useEffect implicitly
                      // For simplicity, we just reload the page or navigate to trigger the effect
                      window.location.reload();
                    }}
                    className="mt-4 px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-8 text-center rounded-2xl bg-slate-50">
                  <BiMap className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-500">
                    No saved addresses found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Please add an address to continue
                  </p>
                  <button
                    onClick={() => navigate("/address")}
                    className="mt-4 px-5 py-2 bg-[#FF5A1F] hover:bg-[#e8521c] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Add Address
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <label
                        key={addr._id}
                        className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#FF5A1F] bg-[#FF5A1F]/5 shadow-sm"
                            : "border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className={`mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-all ${
                            isSelected
                              ? "border-[#FF5A1F] bg-[#FF5A1F]"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <BiCheck className="w-3.5 h-3.5 text-white" />
                          )}
                        </div>
                        <input
                          type="radio"
                          name="address"
                          checked={isSelected}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="sr-only"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                            {addr.formattedAddress}
                          </p>
                          <p className="text-xs font-medium text-slate-400 mt-1">
                            📞 {addr.mobile}
                          </p>
                        </div>
                      </label>
                    );
                  })}

                  {/* Add New Address Button */}
                  <button
                    onClick={() => navigate("/address")}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 p-4 text-sm font-bold text-slate-500 transition-colors hover:border-[#FF5A1F] hover:bg-[#FF5A1F]/5 hover:text-[#FF5A1F]"
                  >
                    + Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden">
              <div className="px-5 pt-5 pb-3">
                <h3 className="font-extrabold text-slate-900">
                  Order Items ({quantity})
                </h3>
              </div>
              <div className="divide-y divide-slate-50">
                {cart.map((cartItem: ICart) => {
                  const item = cartItem.itemId as IMenuItem;
                  return (
                    <div
                      key={cartItem._id}
                      className="flex items-center gap-4 px-5 py-4"
                    >
                      <div className="relative w-14 h-14 overflow-hidden rounded-xl shrink-0 bg-slate-100">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center w-full h-full">
                            <span className="text-xl">🍽️</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate text-slate-800">
                          {item.name}
                        </h4>
                        <p className="text-xs font-medium text-slate-400 mt-0.5">
                          ₹{item.price} × {cartItem.quantity}
                        </p>
                      </div>
                      <p className="font-extrabold text-slate-800">
                        ₹{item.price * cartItem.quantity}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column — Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 sticky top-24">
              <h3 className="mb-4 text-lg font-extrabold text-slate-900">
                Payment Summary
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

                {discountAmount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Discount ({appliedPromo})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                {subTotal < 250 && (
                  <div className="rounded-xl bg-[#FF5A1F]/5 px-3 py-2 text-xs font-medium text-[#FF5A1F]">
                    Add items worth ₹{250 - subTotal} to get free delivery 🚀
                  </div>
                )}

                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <span className="text-base font-extrabold text-slate-900">
                    Total
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mt-6 mb-4">
                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <FiPercent />
                      <span className="text-sm font-bold tracking-wide">
                        {appliedPromo} APPLIED
                      </span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                        placeholder="Enter promo code"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold uppercase outline-none focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/10"
                      />
                      <button
                        onClick={validatePromoCode}
                        disabled={isValidatingPromo || !promoCodeInput.trim()}
                        className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-700 disabled:bg-slate-300"
                      >
                        {isValidatingPromo ? <VscLoading className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {promoError && (
                      <p className="mt-1.5 px-1 text-xs font-bold text-red-500">
                        {promoError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Pay Button */}
              <button
                disabled={isPayDisabled}
                onClick={payWithRazorpay}
                className={`mt-5 w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                  isPayDisabled
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-[#FF5A1F] hover:bg-[#e8521c] shadow-[#FF5A1F]/20 active:scale-[0.98]"
                }`}
              >
                {loadingRazorpay || creatingOrder ? (
                  <VscLoading size={18} className="animate-spin" />
                ) : (
                  <BiCreditCard size={18} />
                )}
                {creatingOrder
                  ? "Creating Order..."
                  : loadingRazorpay
                    ? "Opening Payment..."
                    : `Pay with Razorpay ₹${grandTotal}`}
              </button>

              <button
                disabled={isPayDisabled}
                onClick={payWithStripe}
                className={`mt-5 w-full py-3.5 rounded-2xl text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 ${
                  isPayDisabled
                    ? "cursor-not-allowed bg-slate-300"
                    : "bg-black text-white hover:bg-gray-800 shadow-[#FF5A1F]/20 active:scale-[0.98]"
                }`}
              >
                {loadingStripe || creatingOrder ? (
                  <VscLoading size={18} className="animate-spin" />
                ) : (
                  <BiCreditCard size={18} />
                )}
                {creatingOrder
                  ? "Creating Order..."
                  : loadingStripe
                    ? "Redirecting to Stripe..."
                    : `Pay with Stripe ₹${grandTotal}`}
              </button>

              {!selectedAddressId && addresses.length > 0 && (
                <p className="mt-3 text-xs font-medium text-center text-amber-600">
                  Please select a delivery address to continue
                </p>
              )}

              {/* Security Note */}
              <div className="flex items-center gap-2 mt-4 text-xs font-medium text-slate-400">
                <BiShieldQuarter className="w-4 h-4 shrink-0" />
                <span>Secured payments. Your data is encrypted.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
