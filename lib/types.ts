export interface Deal {
  deal_id: string;
  company_name: string;
  industry: string;
  rep_name: string;
  lead_source: string;
  product_line: string;
  deal_stage: string;
  deal_value: number;
  created_date: string;
  close_date: string;
  days_in_stage: number;
  last_activity_days_ago: number;
  probability_pct: number;
  competitor_mentioned: string;
  num_stakeholders: number;
  next_action: string;
}

export interface Snapshot {
  id: string;
  label: string;
  created_at: string;
  deals: Deal[];
}

export const REQUIRED_COLUMNS: (keyof Deal)[] = [
  "deal_id",
  "company_name",
  "industry",
  "rep_name",
  "lead_source",
  "product_line",
  "deal_stage",
  "deal_value",
  "created_date",
  "close_date",
  "days_in_stage",
  "last_activity_days_ago",
  "probability_pct",
  "competitor_mentioned",
  "num_stakeholders",
  "next_action",
];

export const CLOSED_WON = "Closed Won";
export const CLOSED_LOST = "Closed Lost";

export function isClosed(stage: string): boolean {
  return stage === CLOSED_WON || stage === CLOSED_LOST;
}
