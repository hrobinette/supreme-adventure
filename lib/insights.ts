import { CLOSED_WON, Deal, isClosed } from "./types";

export function parseDate(s: string): Date | null {
  if (!s) return null;
  const parts = s.split("/");
  if (parts.length === 3) {
    const [m, d, y] = parts.map((p) => parseInt(p, 10));
    if (!isNaN(m) && !isNaN(d) && !isNaN(y)) return new Date(y, m - 1, d);
  }
  const t = Date.parse(s);
  return isNaN(t) ? null : new Date(t);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map((n) => parseInt(n, 10));
  const date = new Date(y, m - 1, 1);
  return date.toLocaleString("en-US", { month: "short", year: "numeric" });
}

export const currency = (n: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export interface Summary {
  totalDeals: number;
  wonRevenue: number;
  openPipeline: number;
  winRate: number;
  avgDealSize: number;
  avgDaysToClose: number;
}

export function summarize(deals: Deal[]): Summary {
  const closed = deals.filter((d) => isClosed(d.deal_stage));
  const won = deals.filter((d) => d.deal_stage === CLOSED_WON);
  const open = deals.filter((d) => !isClosed(d.deal_stage));
  const wonRevenue = won.reduce((s, d) => s + d.deal_value, 0);
  const tc = timeToClose(deals);
  const avgDaysToClose =
    tc.length > 0 ? tc.reduce((s, d) => s + d.daysToClose, 0) / tc.length : 0;
  return {
    totalDeals: deals.length,
    wonRevenue,
    openPipeline: open.reduce((s, d) => s + d.deal_value, 0),
    winRate: closed.length > 0 ? won.length / closed.length : 0,
    avgDealSize: won.length > 0 ? wonRevenue / won.length : 0,
    avgDaysToClose,
  };
}

export interface RevenuePoint {
  month: string;
  label: string;
  revenue: number;
  deals: number;
}

export function revenueOverTime(deals: Deal[]): RevenuePoint[] {
  const map = new Map<string, { revenue: number; deals: number }>();
  for (const d of deals) {
    if (d.deal_stage !== CLOSED_WON) continue;
    const date = parseDate(d.close_date);
    if (!date) continue;
    const key = monthKey(date);
    const cur = map.get(key) ?? { revenue: 0, deals: 0 };
    cur.revenue += d.deal_value;
    cur.deals += 1;
    map.set(key, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      label: monthLabel(month),
      revenue: v.revenue,
      deals: v.deals,
    }));
}

export interface RepStat {
  rep: string;
  wonRevenue: number;
  wonDeals: number;
  closedDeals: number;
  winRate: number;
}

export function repPerformance(deals: Deal[]): RepStat[] {
  const map = new Map<string, RepStat>();
  for (const d of deals) {
    const cur =
      map.get(d.rep_name) ??
      ({
        rep: d.rep_name,
        wonRevenue: 0,
        wonDeals: 0,
        closedDeals: 0,
        winRate: 0,
      } as RepStat);
    if (d.deal_stage === CLOSED_WON) {
      cur.wonRevenue += d.deal_value;
      cur.wonDeals += 1;
    }
    if (isClosed(d.deal_stage)) cur.closedDeals += 1;
    map.set(d.rep_name, cur);
  }
  return [...map.values()]
    .map((r) => ({
      ...r,
      winRate: r.closedDeals > 0 ? r.wonDeals / r.closedDeals : 0,
    }))
    .sort((a, b) => b.wonRevenue - a.wonRevenue);
}

export interface CategoryStat {
  name: string;
  value: number;
}

export function revenueByProductLine(deals: Deal[]): CategoryStat[] {
  const map = new Map<string, number>();
  for (const d of deals) {
    if (d.deal_stage !== CLOSED_WON) continue;
    map.set(d.product_line, (map.get(d.product_line) ?? 0) + d.deal_value);
  }
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export interface LeadSourceStat {
  name: string;
  winRate: number;
  wonDeals: number;
  closedDeals: number;
}

export function winRateByLeadSource(deals: Deal[]): LeadSourceStat[] {
  const map = new Map<string, { won: number; closed: number }>();
  for (const d of deals) {
    if (!isClosed(d.deal_stage)) continue;
    const cur = map.get(d.lead_source) ?? { won: 0, closed: 0 };
    cur.closed += 1;
    if (d.deal_stage === CLOSED_WON) cur.won += 1;
    map.set(d.lead_source, cur);
  }
  return [...map.entries()]
    .map(([name, v]) => ({
      name,
      winRate: v.closed > 0 ? v.won / v.closed : 0,
      wonDeals: v.won,
      closedDeals: v.closed,
    }))
    .sort((a, b) => b.winRate - a.winRate);
}

export interface TimeToCloseRow {
  deal_id: string;
  company: string;
  rep: string;
  product: string;
  value: number;
  daysToClose: number;
  closeDate: string;
}

export function timeToClose(deals: Deal[]): TimeToCloseRow[] {
  const rows: TimeToCloseRow[] = [];
  for (const d of deals) {
    if (d.deal_stage !== CLOSED_WON) continue;
    const created = parseDate(d.created_date);
    const closed = parseDate(d.close_date);
    if (!created || !closed) continue;
    const days = Math.round(
      (closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    );
    rows.push({
      deal_id: d.deal_id,
      company: d.company_name,
      rep: d.rep_name,
      product: d.product_line,
      value: d.deal_value,
      daysToClose: days,
      closeDate: d.close_date,
    });
  }
  return rows.sort((a, b) => a.daysToClose - b.daysToClose);
}
