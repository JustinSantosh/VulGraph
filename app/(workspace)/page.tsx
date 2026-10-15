import { auth } from "@clerk/nextjs/server";
import { connection } from "next/server";
import { AnalysisList } from "@/components/analysis-list";
import type { RowData } from "@/components/progress/analysis-row";
import { SubmitForm } from "@/components/submit-form";
import { isStale } from "@/lib/pipeline/stages";
import { createServerSupabase } from "@/lib/supabase/server";
import { ago } from "@/lib/time";

const LIST_LIMIT = 100;

export default async function DashboardPage() {
  const { sessionClaims } = await auth.protect();

  // Read off the token, never fetched from Clerk. If the claim is missing the
  // session token hasn't been customised yet, and that should be obvious.
  const orgName = sessionClaims?.org_name;
  if (!orgName) {
    throw new Error(
      'Session token has no org_name claim. Add "org_name": "{{org.name}}" in Clerk → Sessions → Customize session token.',
    );
  }

  const rows = await loadRows();

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4 sm:p-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-accent">Repository intelligence</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">{orgName} workspace</h1>
          <p className="mt-1 text-xs text-fg-muted">
            Explore dependency structure and understand change impact across your repositories.
          </p>
        </div>
        <div className="rounded border border-line bg-surface px-3 py-2 text-right">
          <p className="font-mono text-lg font-semibold tabular-nums">{rows.length}{rows.length === LIST_LIMIT ? "+" : ""}</p>
          <p className="text-[10px] uppercase tracking-wider text-fg-muted">Analyses tracked</p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface p-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium">Map a repository</p>
          <p className="mt-0.5 text-[11px] text-fg-muted">Start with a public GitHub URL to inspect its dependency graph.</p>
        </div>
        <SubmitForm />
      </div>

      <AnalysisList rows={rows} />
    </div>
  );
}

// Loaded before rendering, and the clock read here: stale and "3m ago" are
// facts about the moment of the request, worked out once. Nothing ticks in
// the browser.
async function loadRows(): Promise<RowData[]> {
  // No organization filter: the row policy scopes this to the organization on
  // the token. Switching organization changes the token, not this query.
  const supabase = await createServerSupabase();
  const { data: analyses, error } = await supabase
    .from("analyses")
    .select("id, status, stage, stage_message, commit_sha, error, created_at, started_at, finished_at, projects(repo_owner, repo_name)")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);
  if (error) throw new Error(`Couldn't load analyses: ${error.message}`);

  await connection();
  const now = Date.now();
  return analyses.map((a) => ({
    id: a.id,
    repository: a.projects ? { owner: a.projects.repo_owner, name: a.projects.repo_name } : null,
    commitSha: a.commit_sha,
    progress: { status: a.status, stage: a.stage, message: a.status === "failed" ? a.error : a.stage_message },
    staleAtRender: isStale(a, now),
    created: { iso: a.created_at, ago: ago(a.created_at, now) },
    finished: a.finished_at ? { iso: a.finished_at, ago: ago(a.finished_at, now) } : null,
  }));
}
