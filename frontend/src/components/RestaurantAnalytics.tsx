import { useState, useEffect } from "react";
import axios from "axios";
import { restaurantService } from "../main";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalRevenue: number;
  netEarnings: number;
  totalOrders: number;
  averageOrderValue: number;
  chartData: {
    date: string;
    day: string;
    revenue: number;
    orders: number;
  }[];
}

const RestaurantAnalytics = ({ restaurantId }: { restaurantId: string }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `${restaurantService}/api/order/analytics/${restaurantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Loading analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="text-sm font-semibold text-slate-500 mb-1">
            Total Revenue
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{data.totalRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full">
            Net Earnings: ₹{data.netEarnings.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="text-sm font-semibold text-slate-500 mb-1">
            Total Orders
          </div>
          <div className="text-3xl font-black text-slate-900">
            {data.totalOrders}
          </div>
          <div className="mt-2 text-xs font-medium text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded-full">
            Completed Deliveries
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <div className="text-sm font-semibold text-slate-500 mb-1">
            Average Order Value
          </div>
          <div className="text-3xl font-black text-slate-900">
            ₹{data.averageOrderValue.toLocaleString()}
          </div>
          <div className="mt-2 text-xs font-medium text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded-full">
            Per Order Average
          </div>
        </div>
      </div>

      {/* ── Chart ── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
        <h3 className="text-lg font-bold text-slate-800 mb-6">
          Last 7 Days Revenue
        </h3>
        {data.chartData && data.chartData.length > 0 ? (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `₹${value}`}
                  dx={-10}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 25px -5px rgb(0 0 0 / 0.1)",
                    fontWeight: "bold",
                  }}
                  itemStyle={{ color: "#0f172a" }}
                  formatter={(value: any) => [`₹${value}`, "Revenue"]}
                  labelStyle={{ color: "#64748b", marginBottom: "4px" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#FF5A1F"
                  radius={[6, 6, 6, 6]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm">
            <span>No sales data in the last 7 days.</span>
            <span>Check back later!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAnalytics;
