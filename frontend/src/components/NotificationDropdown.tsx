import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { BiBell } from "react-icons/bi";
import toast from "react-hot-toast";

interface Notification {
  _id: string;
  message: string;
  createdAt: string;
}

export const NotificationDropdown = ({
  fetchUrl,
  storageKey,
}: {
  fetchUrl: string;
  storageKey: string;
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastToastedIdRef = useRef<string | null>(
    localStorage.getItem(storageKey),
  );

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await axios.get(fetchUrl, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const fetched = data.notifications || [];
        setNotifications(fetched);

        if (fetched.length > 0) {
          const lastViewedId = localStorage.getItem(storageKey);
          if (fetched[0]._id !== lastViewedId) {
            setHasUnread(true);

            if (fetched[0]._id !== lastToastedIdRef.current) {
              toast(`Admin: ${fetched[0].message}`, {
                position: "bottom-right",
                duration: 6000,
                icon: "🔔",
                id: "admin-notif-" + fetched[0]._id, // prevent duplicate toasts
              });
              lastToastedIdRef.current = fetched[0]._id;
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [fetchUrl, storageKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length > 0) {
      setHasUnread(false);
      localStorage.setItem(storageKey, notifications[0]._id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-slate-500 hover:text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-sm border border-slate-200"
      >
        <BiBell size={20} />
        {hasUnread && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-sm ring-2 ring-white"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 transform origin-top-right transition-all">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Notifications</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                No notifications yet
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className="p-4 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-sm text-slate-800">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
