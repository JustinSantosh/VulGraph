"use client";

import { useMemo, useState } from "react";
import { AnalysisRow, type RowData } from "@/components/progress/analysis-row";
import type { Status } from "@/lib/pipeline/stages";

type Filter = "all" | Status | "stale";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "queued", label: "Queued" },
  { value: "stale", label: "Stale" },
  { value: "complete", label: "Complete" },
  { value: "failed", label: "Failed" },
];

export function AnalysisList({ rows }: { rows: RowData[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const repository = row.repository
        ? `${row.repository.owner}/${row.repository.name}`.toLocaleLowerCase()
        : "";
      const matchesQuery = !needle || repository.includes(needle);
      const status = row.staleAtRender ? "stale" : row.progress.status;
      return matchesQuery && (filter === "all" || filter === status);
    });
  }, [filter, query, rows]);

  return (
    <section className="min-h-0 flex-1 overflow-hidden rounded-md border border-line bg-surface" aria-label="Repository analyses">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
        <label className="sr-only" htmlFor="analysis-search">Search repositories</label>
        <input
          id="analysis-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search owner or repository"
          className="h-8 min-w-48 flex-1 rounded border border-line bg-canvas px-2 text-xs outline-none placeholder:text-fg-muted focus:border-accent sm:max-w-72"
        />
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter analyses by status">
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filter === value}
              onClick={() => setFilter(value)}
              className={`rounded px-2 py-1 text-xs transition-colors ${filter === value ? "bg-accent text-accent-fg" : "text-fg-muted hover:bg-raised hover:text-fg"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs tabular-nums text-fg-muted">
          {visibleRows.length} / {rows.length}
        </span>
      </div>

      {visibleRows.length === 0 ? (
        <div className="px-4 py-10 text-center text-xs text-fg-muted">
          <p className="text-fg">{rows.length ? "No matching analyses." : "No analyses yet."}</p>
          <p className="mt-1">
            {rows.length ? "Try another repository name or status filter." : "Add a public GitHub repository above to create your first map."}
          </p>
        </div>
      ) : (
        <div className="max-h-full overflow-auto">
          <table className="w-full table-fixed border-collapse text-xs">
            <colgroup>
              <col />
              <col className="w-28" />
              <col className="hidden w-20 sm:table-column" />
              <col className="w-20" />
              <col className="hidden w-20 sm:table-column" />
            </colgroup>
            <thead className="sticky top-0 bg-canvas text-left text-fg-muted">
              <tr className="h-8 border-b border-line">
                <th className="px-3 font-normal">Repository</th>
                <th className="px-3 font-normal">State</th>
                <th className="hidden px-3 font-normal sm:table-cell">Commit</th>
                <th className="px-3 text-right font-normal">Started</th>
                <th className="hidden px-3 text-right font-normal sm:table-cell">Finished</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => <AnalysisRow key={row.id} row={row} />)}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
