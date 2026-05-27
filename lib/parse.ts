import Papa from "papaparse";
import { Deal, REQUIRED_COLUMNS } from "./types";

export interface ParseResult {
  deals: Deal[];
  errors: string[];
}

const NUMERIC_FIELDS: (keyof Deal)[] = [
  "deal_value",
  "days_in_stage",
  "last_activity_days_ago",
  "probability_pct",
  "num_stakeholders",
];

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "").replace(/[$,\s]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function parseCsv(text: string): ParseResult {
  const errors: string[] = [];
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length) {
    for (const e of parsed.errors.slice(0, 5)) {
      errors.push(`Row ${e.row ?? "?"}: ${e.message}`);
    }
  }

  const headers = parsed.meta.fields ?? [];
  const missing = REQUIRED_COLUMNS.filter((c) => !headers.includes(c));
  if (missing.length) {
    errors.push(`Missing required column(s): ${missing.join(", ")}`);
    return { deals: [], errors };
  }

  const deals: Deal[] = (parsed.data || [])
    .filter((row) => row.deal_id && row.deal_id.trim() !== "")
    .map((row) => {
      const deal = {} as Deal;
      for (const col of REQUIRED_COLUMNS) {
        const raw = row[col];
        if (NUMERIC_FIELDS.includes(col)) {
          (deal[col] as number) = toNumber(raw);
        } else {
          (deal[col] as string) = (raw ?? "").trim();
        }
      }
      return deal;
    });

  if (deals.length === 0 && errors.length === 0) {
    errors.push("No data rows found in the CSV.");
  }

  return { deals, errors };
}
