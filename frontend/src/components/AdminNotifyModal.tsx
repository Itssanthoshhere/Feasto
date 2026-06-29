import { useState } from "react";
import axios from "axios";
import { adminService } from "../main";
import toast from "react-hot-toast";
import { BiX, BiBell } from "react-icons/bi";

const AdminNotifyModal = ({ onClose }: { onClose: () => void }) => {
  const [target, setTarget] = useState<"riders" | "restaurants">("riders");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    setSending(true);
    try {
      await axios.post(
        `${adminService}/api/v1/admin/notify`,
        { target, message },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      toast.success(`Notification sent to ${target}`);
      onClose();
    } catch {
      toast.error("Failed to send notification");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-slate-800">
        <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <BiBell size={24} />
            <h2 className="text-xl font-black">Send Notification</h2>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/40 text-white backdrop-blur-md rounded-full p-2 transition-colors"
          >
            <BiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              Send to
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setTarget("riders")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  target === "riders"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                🏍️ All Riders
              </button>
              <button
                onClick={() => setTarget("restaurants")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                  target === "restaurants"
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                🍽️ All Restaurants
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your notification message..."
              rows={4}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold py-3 text-sm hover:from-orange-600 hover:to-amber-600 shadow-sm transition-all disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Notification"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifyModal;
