"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { parseCsv } from "@/lib/parse";
import { setWorkingDeals } from "@/lib/storage";
import { Deal } from "@/lib/types";

export default function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [deals, setDeals] = useState<Deal[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setBusy(true);
    setErrors([]);
    setDeals([]);
    setFileName(file.name);
    try {
      const text = await file.text();
      const result = parseCsv(text);
      setErrors(result.errors);
      setDeals(result.deals);
    } catch {
      setErrors(["Could not read the file."]);
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function submit() {
    if (deals.length === 0) return;
    const label = fileName.replace(/\.csv$/i, "") || "Sales upload";
    setWorkingDeals(deals, label);
    router.push("/insights");
  }

  const ready = deals.length > 0 && errors.length === 0;

  return (
    <div className="mt-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-brand bg-brand/5"
            : "border-line bg-surface/60 hover:border-brand/60"
        }`}
      >
        <svg
          className="mb-3 h-10 w-10 text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="text-sm font-medium text-fg">
          {fileName ? fileName : "Upload Data (CSV)"}
        </p>
        <p className="mt-1 text-xs text-muted">
          Click to browse or drag and drop a .csv file
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {busy && <p className="mt-3 text-sm text-muted">Reading file…</p>}

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-accent-pink/30 bg-accent-pink/10 p-4">
          <p className="text-sm font-medium text-accent-pink">
            We couldn&apos;t use this file:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-accent-pink/90">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {ready && (
        <div className="mt-4 rounded-xl border border-brand/30 bg-brand/10 p-4 text-sm text-brand">
          Parsed <strong>{deals.length}</strong> deals successfully.
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={submit}
          disabled={!ready}
          className="rounded-lg bg-brand-gradient px-5 py-2 text-sm font-semibold text-ink shadow-glow transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
