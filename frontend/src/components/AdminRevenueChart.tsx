import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const AdminRevenueChart = ({
  data,
}: {
  data: { date: string; revenue: number }[];
}) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="text-lg font-bold text-slate-900 mb-4 dark:text-white">
        Revenue — Last 30 Days
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => d.slice(5)}
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `₹${v}`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              fontSize: "13px",
            }}
            formatter={(value: number) => [`₹${value}`, "Revenue"]}
            labelFormatter={(label: string) => `Date: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#f97316"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminRevenueChart;
