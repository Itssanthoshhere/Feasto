import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";
import { VscLoading } from "react-icons/vsc";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { fetchCart } = useAppData();

  const sessionId = params.get("session_id");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        await axios.post(`${utilsService}/api/payment/stripe/verify`, {
          sessionId,
        });

        setVerified(true);
        await fetchCart();
        toast.success("Payment successful!");
      } catch (error) {
        toast.error("Stripe verification failed");
        console.log(error);
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center
   px-4"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-sm text-center space-y-4">
        {verifying ? (
          <>
            <VscLoading
              size={48}
              className="mx-auto text-[#e14b14] animate-spin"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              Verifying Payment...
            </h1>
            <p className="text-sm text-gray-500">
              Please wait while we confirm your payment
            </p>
          </>
        ) : verified ? (
          <>
            <BiCheckCircle size={64} className="mx-auto text-green-500" />

            <h1 className="text-2xl font-bold text-gray-800">
              Payment Successful
            </h1>

            <p className="text-sm text-gray-500">
              Your order has been placed successfully 🎉
            </p>

            {sessionId && (
              <div className="rounded-lg bg-gray-50 p-3">
                <span className="text-gray-500">Session ID: </span>
                <p className="font-mono text-sm break-all text-gray-500">
                  {sessionId}
                </p>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e14b14] py-3 text-sm font-semibold text-white hover:bg-[#b83a0e] transition-colors active:scale-[0.98]"
                onClick={() => navigate("/")}
              >
                Order More <BsArrowRight size={16} />
              </button>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors active:scale-[0.98]"
                onClick={() => navigate("/orders")}
              >
                Your Orders <BsArrowRight size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <span className="text-3xl">❌</span>
            </div>

            <h1 className="text-2xl font-bold text-gray-800">
              Verification Failed
            </h1>

            <p className="text-sm text-gray-500">
              We couldn't verify your payment. Please contact support.
            </p>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#e14b14] py-3 text-sm font-semibold text-white hover:bg-[#b83a0e] transition-colors active:scale-[0.98]"
              onClick={() => navigate("/")}
            >
              Go Home <BsArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;
