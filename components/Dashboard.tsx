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

const SERIES = ["#19E3B1", "#38BDF8", "#8B5CF6", "#EC4899", "#F59E0B"];

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
    <section className="card p-5">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </h2>
      {subtitle && <p className="mt-0.5 text-xs text-muted/70">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Kpi({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <div
      className="card relative overflow-hidden p-5"
      style={{ boxShadow: `0 0 0 1px ${color}22, 0 10px 40px -16px ${color}66` }}
    >
      <span
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
      <span
        className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full opacity-25 blur-2xl"
        style={{ background: color }}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-semibold tracking-tight text-fg">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted/80">{sub}</p>
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

const tooltipStyle = {
  background: "#0B1120",
  border: "1px solid #1E2A44",
  borderRadius: 12,
  color: "#E6ECF5",
  fontSize: 12,
};

export default function Dashboard({ deals }: { deals: Deal[] }) {
  const summary = summarize(deals);
  const revenue = revenueOverTime(deals);
  const reps = repPerformance(deals).slice(0, 12);
  const products = revenueByProductLine(deals);
  const sources = winRateByLeadSource(deals);
  const ttc = timeToClose(deals);
  const wonCount = deals.filter((d) => d.deal_stage === "Closed Won").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          label="Total Revenue"
          value={compactCurrency(summary.wonRevenue)}
          sub={`${wonCount} won deals`}
          color="#19E3B1"
        />
        <Kpi
          label="Win Rate"
          value={`${Math.round(summary.winRate * 100)}%`}
          sub={`of ${summary.totalDeals} total deals`}
          color="#38BDF8"
        />
        <Kpi
          label="Avg Deal Size"
          value={compactCurrency(summary.avgDealSize)}
          sub="closed won"
          color="#F59E0B"
        />
        <Kpi
          label="Avg Days to Close"
          value={`${Math.round(summary.avgDaysToClose)}d`}
          sub="won deals only"
          color="#EC4899"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Revenue Over Time" subtitle="Closed-won revenue by close month">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue} margin={{ left: -8, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#19E3B1" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#19E3B1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#16203a" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#8A99B5" }} stroke="#1E2A44" />
              <YAxis
                tickFormatter={(v) => compactCurrency(v)}
                tick={{ fontSize: 11, fill: "#8A99B5" }}
                stroke="#1E2A44"
                width={64}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ stroke: "#19E3B1", strokeOpacity: 0.3 }}
                formatter={(v: number) => [currency(v), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#19E3B1"
                strokeWidth={2.5}
                fill="url(#rev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Rep Performance" subtitle="Closed-won revenue by rep">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={reps} layout="vertical" margin={{ left: 24, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#16203a" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => compactCurrency(v)}
                tick={{ fontSize: 11, fill: "#8A99B5" }}
                stroke="#1E2A44"
              />
              <YAxis
                type="category"
                dataKey="rep"
                tick={{ fontSize: 11, fill: "#8A99B5" }}
                stroke="#1E2A44"
                width={96}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: "#19E3B1", fillOpacity: 0.06 }}
                formatter={(v: number) => [currency(v), "Won revenue"]}
              />
              <Bar dataKey="wonRevenue" radius={[0, 5, 5, 0]}>
                {reps.map((_, i) => (
                  <Cell key={i} fill={SERIES[i % SERIES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Win Rate by Product Line" subtitle="Closed-won revenue share">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={products}
                dataKey="value"
                nameKey="name"
                innerRadius={58}
                outerRadius={92}
                paddingAngle={3}
                stroke="#0B1120"
                strokeWidth={3}
              >
                {products.map((_, i) => (
                  <Cell key={i} fill={SERIES[i % SERIES.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => currency(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {products.map((p, i) => (
              <span key={p.name} className="flex items-center gap-1.5 text-xs text-muted">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: SERIES[i % SERIES.length] }}
                />
                {p.name}
              </span>
            ))}
          </div>
        </Card>

        <Card title="Win Rate by Lead Source" subtitle="Closed-won / all closed deals">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sources} margin={{ left: -8, right: 8 }}>
              <defs>
                <linearGradient id="wr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#16203a" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8A99B5" }} stroke="#1E2A44" />
              <YAxis
                tickFormatter={(v) => `${Math.round(v * 100)}%`}
                domain={[0, 1]}
                tick={{ fontSize: 11, fill: "#8A99B5" }}
                stroke="#1E2A44"
                width={44}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                cursor={{ fill: "#8B5CF6", fillOpacity: 0.08 }}
                formatter={(v: number) => [`${Math.round(v * 100)}%`, "Win rate"]}
              />
              <Bar dataKey="winRate" fill="url(#wr)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card
        title="Time to Close by Customer"
        subtitle={`${ttc.length} closed-won deals · sorted by fastest close`}
      >
        <div className="max-h-[420px] overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-surface">
              <tr className="border-b border-line text-xs uppercase tracking-wider text-muted">
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
                  className="border-b border-line/50 transition-colors hover:bg-surface-2"
                >
                  <td className="py-2 pr-4 font-medium text-fg">{r.company}</td>
                  <td className="py-2 pr-4 text-muted">{r.rep}</td>
                  <td className="py-2 pr-4 text-muted">{r.product}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-fg/90">
                    {currency(r.value)}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    <span className="rounded-md bg-brand/10 px-2 py-0.5 text-brand">
                      {r.daysToClose}
                    </span>
                  </td>
                  <td className="py-2 text-muted">{r.closeDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
