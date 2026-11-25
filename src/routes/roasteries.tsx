import { useMemo } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { COUNTRY_NAMES, ROASTERIES, type CountryCode } from "../roasteries.ts";
import { useTastings } from "../ui/tastings.ts";
import { Field, Td, Th } from "../ui/parts.tsx";
import { ui } from "../ui/ui.ts";

const COUNTRIES = [...new Set(ROASTERIES.map((r) => r.country))];

export const Route = createFileRoute("/roasteries")({
  validateSearch: (search: Record<string, unknown>): { country?: CountryCode } => ({
    country: typeof search.country === "string" && search.country in COUNTRY_NAMES ? (search.country as CountryCode) : undefined,
  }),
  head: () => ({ meta: [{ title: "Roasteries · Roast ledger" }] }),
  component: Roasteries,
});

function Roasteries() {
  const { country } = Route.useSearch();
  const navigate = Route.useNavigate();
  const beans = useQuery(api.beans.list);
  const { tastings } = useTastings();

  const inStock = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of beans ?? []) if (b.available) counts.set(b.roasteryId, (counts.get(b.roasteryId) ?? 0) + 1);
    return counts;
  }, [beans]);
  const tried = useMemo(() => new Set(tastings.map((t) => t.roasteryId)), [tastings]);
  const rows = ROASTERIES.filter((r) => !country || r.country === country);

  return (
    <section aria-labelledby="roasteries-head">
      <div {...stylex.props(ui.head)}>
        <h1 id="roasteries-head" {...stylex.props(ui.h1)}>{ROASTERIES.length} roasters worth the postage</h1>
        <p {...stylex.props(ui.meta)}>You have tried {tried.size} of them. Those with a shop feed show what they sell right now.</p>
      </div>

      <form aria-label="Filter roasters" onSubmit={(e) => e.preventDefault()} {...stylex.props(ui.filters)}>
        <Field label="Country">
          <select
            value={country ?? ""}
            onChange={(e) => navigate({ search: { country: (e.target.value || undefined) as CountryCode | undefined }, replace: true })}
            {...stylex.props(ui.control)}
          >
            <option value="">All countries</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{COUNTRY_NAMES[c]}</option>
            ))}
          </select>
        </Field>
      </form>

      <div {...stylex.props(ui.sheet)}>
        <table {...stylex.props(ui.table)}>
          <caption {...stylex.props(ui.vh)}>Roasters, with their city, country and coffees in stock</caption>
          <thead {...stylex.props(ui.thead)}>
            <tr>
              <Th>Roaster</Th>
              <Th>City</Th>
              <Th>Country</Th>
              <Th num>In stock</Th>
              <Th>You</Th>
              <Th>Note</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} {...stylex.props(ui.tr)}>
                <Td label="Roaster" styles={[ui.name]}>
                  {r.shop ? (
                    <Link to="/" search={{ roaster: r.id, period: "all" }} {...stylex.props(ui.link)}>
                      {r.name}
                    </Link>
                  ) : (
                    r.name
                  )}
                </Td>
                <Td label="City">{r.city}</Td>
                <Td label="Country">{COUNTRY_NAMES[r.country]}</Td>
                <Td label="In stock" styles={[ui.num]}>
                  {r.shop ? (beans === undefined ? "" : (inStock.get(r.id) ?? 0)) : <span {...stylex.props(ui.muted)}>No feed</span>}
                </Td>
                <Td label="You">{tried.has(r.id) ? "Tried" : <span {...stylex.props(ui.muted)}>Not yet</span>}</Td>
                <Td label="Note" styles={[ui.muted]}>{r.note ?? ""}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
