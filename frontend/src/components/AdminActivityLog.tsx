import { useState } from "react";
import type { ReactNode } from "react";
import { BiCheckShield, BiShieldX, BiBell, BiHistory, BiChevronDown } from "react-icons/bi";

const iconMap: Record<string, ReactNode> = {
  "Verified Restaurant": <BiCheckShield className="text-green-500" size={20} />,
  "Verified Rider": <BiCheckShield className="text-green-500" size={20} />,
  "Unverified Restaurant": <BiShieldX className="text-red-500" size={20} />,
  "Unverified Rider": <BiShieldX className="text-red-500" size={20} />,
};

const AdminActivityLog = ({ logs }: { logs: any[] }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <BiHistory size={22} className="text-orange-500" /> Activity Log
      </h3>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 p-6 dark:bg-slate-800 dark:border-slate-700">
        {logs.length === 0 ? (
          <p className="text-center text-slate-400 py-10">
            No activity recorded yet.
          </p>
        ) : (
          <div className="space-y-0">
            {logs.map((log) => (
              <div
                key={log._id}
                className="flex flex-col py-4 border-b border-slate-100 last:border-0 dark:border-slate-700"
              >
                <button 
                  type="button"
                  className={`flex items-start gap-4 w-full text-left ${log.details ? "cursor-pointer group" : ""}`}
                  onClick={() => log.details && setExpandedId(expandedId === log._id ? null : log._id)}
                  aria-expanded={log.details ? expandedId === log._id : undefined}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 dark:bg-slate-700">
                    {iconMap[log.action] || (
                      <BiBell className="text-orange-500" size={20} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {log.action}
                      {log.details && (
                        <BiChevronDown 
                          size={16} 
                          className={`text-slate-400 transition-transform ${expandedId === log._id ? "rotate-180" : ""}`} 
                        />
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {log.targetType}
                      {log.targetId ? ` • ID: ${log.targetId.slice(-8)}` : ""}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 shrink-0 dark:text-slate-500">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleString()
                      : "—"}
                  </span>
                </button>
                
                {log.details && expandedId === log._id && (
                  <div className="mt-3 ml-14 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-700/50 dark:text-slate-300 border border-slate-100 dark:border-slate-600">
                    {log.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminActivityLog;
