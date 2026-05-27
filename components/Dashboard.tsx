"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Deal } from "@/lib/types";
import {
  currency,
  repPerformance,
  revenueByProductLine,
  revenueOverTime,
  summarize,
  timeToClose,
  winRateByLeadSource,
} from "@/lib/insights";

const PIE_COLORS = ["#2563eb", "#7c3aed", "#0891b2", "#059669", "#d97706"];

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

const compactCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);

export default function Dashboard({ deals }: { deals: Deal[] }) {
  const summary = summarize(deals);
  const revenue = revenueOverTime(deals);
  const reps = repPerformance(deals).slice(0, 12);
  const products = revenueByProductLine(deals);
  const sources = winRateByLeadSource(deals);
  const ttc = timeToClose(deals);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Closed-won revenue" value={compactCurrency(summary.wonRevenue)} />
        <Kpi label="Open pipeline" value={compactCurrency(summary.openPipeline)} />
        <Kpi
          label="Win rate"
          value={`${Math.round(summary.winRate * 100)}%`}
        />
        <Kpi
          label="Avg days to close"
          value={`${Math.round(summary.avgDaysToClose)}d`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Revenue over time" subtitle="Closed-won revenue by close month">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue} margin={{ left: -8, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                tickFormatter={(v) => compactCurrency(v)}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                width={64}
              />
              <Tooltip
                formatter={(v: number) => [currency(v), "Revenue"]}
                labelStyle={{ color: "#0f172a" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Sales rep performance" subtitle="Closed-won revenue by rep">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={reps}
              layout="vertical"
              margin={{ left: 24, right: 12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => compactCurrency(v)}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
              />
              <YAxis
                type="category"
                dataKey="rep"
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                width={96}
              />
              <Tooltip
                formatter={(v: number) => [currency(v), "Won revenue"]}
              />
              <Bar dataKey="wonRevenue" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Revenue by product line" subtitle="Closed-won revenue share">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={products}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {products.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => currency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {products.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                {p.name}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Win rate by lead source" subtitle="Closed-won / all closed deals">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sources} margin={{ left: -8, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
              <YAxis
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                domain={[0, 1]}
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                width={44}
              />
              <Tooltip
                formatter={(v: number) => [`${Math.round(v * 100)}%`, "Win rate"]}
              />
              <Bar dataKey="winRate" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card
        title="Time to close by customer"
        subtitle={`${ttc.length} closed-won deals · sorted by fastest close`}
      >
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-2 pr-4 font-medium">Customer</th>
                <th className="py-2 pr-4 font-medium">Rep</th>
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 pr-4 text-right font-medium">Value</th>
                <th className="py-2 pr-4 text-right font-medium">Days to close</th>
                <th className="py-2 font-medium">Close date</th>
              </tr>
            </thead>
            <tbody>
              {ttc.map((r) => (
                <tr
                  key={r.deal_id}
                  className="border-b border-slate-100 hover:bg-slate-50"
                >
                  <td className="py-2 pr-4 font-medium text-slate-800">
                    {r.company}
                  </td>
                  <td className="py-2 pr-4 text-slate-600">{r.rep}</td>
                  <td className="py-2 pr-4 text-slate-600">{r.product}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-slate-700">
                    {currency(r.value)}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums text-slate-700">
                    {r.daysToClose}
                  </td>
                  <td className="py-2 text-slate-500">{r.closeDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
