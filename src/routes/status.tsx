import { createFileRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ROASTERIES } from "../roasteries.ts";
import { SkeletonRows, Td, Th } from "../ui/parts.tsx";
import { syncedAt } from "../ui/format.ts";
import { ui } from "../ui/ui.ts";

export const Route = createFileRoute("/status")({
  head: () => ({ meta: [{ title: "Sync status · Roast ledger" }] }),
  component: Status,
});

const STATUS_LABEL = { ok: "OK", degraded: "Degraded", down: "Down" } as const;
const shopName = (id: string) => ROASTERIES.find((r) => r.id === id)?.name ?? id;

function Status() {
  const reports = useQuery(api.health.reports);
  const latest = reports?.[0];

  return (
    <section aria-labelledby="status-head">
      <div {...stylex.props(ui.head)}>
        <h1 id="status-head" {...stylex.props(ui.h1)}>Sync status</h1>
        <p {...stylex.props(ui.meta)}>
          Convex checks its own shop syncs every 12 hours, at 00:00 and 12:00 UTC. Shop APIs should sync 48 times and scraped
          pages 12 times in each report.
        </p>
      </div>

      {latest ? (
        <p {...stylex.props(ui.p, latest.status !== "ok" && ui.warn)}>
          <span {...stylex.props(ui.strong, latest.status !== "ok" && ui.fresh)}>{STATUS_LABEL[latest.status]}.</span>{" "}
          {latest.apiRuns} of {latest.expectedApiRuns} API syncs and {latest.pagesRuns} of {latest.expectedPagesRuns} page syncs
          ran in the 12 hours to {syncedAt(latest.windowEnd)}.{" "}
          {latest.failures.length === 0
            ? "No shop failed."
            : `${latest.failures.length} ${latest.failures.length === 1 ? "shop" : "shops"} failed at least once.`}
          {latest.lastRunAt ? ` Last sync ${syncedAt(latest.lastRunAt)}.` : " No sync has run."}
        </p>
      ) : null}

      <div {...stylex.props(ui.sheet)}>
        <table {...stylex.props(ui.table)}>
          <caption {...stylex.props(ui.vh)}>Health reports, newest first</caption>
          <thead {...stylex.props(ui.thead)}>
            <tr>
              <Th>Report time</Th>
              <Th>Status</Th>
              <Th num>API syncs</Th>
              <Th num>Page syncs</Th>
              <Th>Failed shops</Th>
            </tr>
          </thead>
          <tbody>
            {reports === undefined ? (
              <SkeletonRows columns={5} />
            ) : (
              reports.map((r) => (
                <tr key={r.id} {...stylex.props(ui.tr)}>
                  <Td label="Report time" styles={[ui.date]}>{syncedAt(r.windowEnd)}</Td>
                  <Td label="Status" styles={[r.status === "ok" ? ui.strong : ui.fresh]}>{STATUS_LABEL[r.status]}</Td>
                  <Td label="API syncs" styles={[ui.num]}>{r.apiRuns} / {r.expectedApiRuns}</Td>
                  <Td label="Page syncs" styles={[ui.num]}>{r.pagesRuns} / {r.expectedPagesRuns}</Td>
                  <Td label="Failed shops">
                    {r.failures.length === 0 ? (
                      <span {...stylex.props(ui.muted)}>None</span>
                    ) : (
                      r.failures.map((f) => `${shopName(f.roasteryId)} ×${f.failures}`).join(", ")
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {reports !== undefined && reports.length === 0 ? (
          <div {...stylex.props(ui.empty)}>
            <p {...stylex.props(ui.p)}>No report yet. The first one is written at the next 00:00 or 12:00 UTC.</p>
          </div>
        ) : null}
      </div>

      {latest && latest.failures.length > 0 ? (
        <div {...stylex.props(ui.sheet)}>
          <table {...stylex.props(ui.table)}>
            <caption {...stylex.props(ui.vh)}>Shops that failed in the latest report</caption>
            <thead {...stylex.props(ui.thead)}>
              <tr>
                <Th>Shop</Th>
                <Th num>Failures</Th>
                <Th>Last error</Th>
              </tr>
            </thead>
            <tbody>
              {latest.failures.map((f) => (
                <tr key={f.roasteryId} {...stylex.props(ui.tr)}>
                  <Td label="Shop" styles={[ui.name]}>{shopName(f.roasteryId)}</Td>
                  <Td label="Failures" styles={[ui.num]}>{f.failures}</Td>
                  <Td label="Last error" styles={[ui.muted]}>{f.lastError}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
