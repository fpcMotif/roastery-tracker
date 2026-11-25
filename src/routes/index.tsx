import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { COUNTRY_NAMES, ROASTERIES, type CountryCode } from "../roasteries.ts";
import { convertTo } from "../fx.ts";
import { useTastings } from "../ui/tastings.ts";
import { money, shortDate, syncedAt, today } from "../ui/format.ts";
import { Field, Segmented, SkeletonRows, Td, Th } from "../ui/parts.tsx";
import { ui } from "../ui/ui.ts";

const PERIODS = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
  { id: "all", label: "All" },
] as const;
type Period = (typeof PERIODS)[number]["id"];

type LedgerSearch = {
  period?: Period;
  country?: CountryCode;
  roaster?: string;
  currency?: string;
  sort?: "price";
  soldout?: true;
  q?: string;
};

const PAGE = 60;
const SHOP_COUNTRIES = [...new Set(ROASTERIES.filter((r) => r.feed).map((r) => r.country))];
const COUNTRY_OF = new Map(ROASTERIES.map((r) => [r.id, r.country]));
const nonEmpty = (value: unknown) => (typeof value === "string" && value.trim() !== "" ? value : undefined);

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): LedgerSearch => ({
    period: PERIODS.some((p) => p.id === String(search.period)) && String(search.period) !== "30" ? (String(search.period) as Period) : undefined,
    country: typeof search.country === "string" && search.country in COUNTRY_NAMES ? (search.country as CountryCode) : undefined,
    roaster: nonEmpty(search.roaster),
    currency: typeof search.currency === "string" && /^[A-Z]{3}$/.test(search.currency) && search.currency !== "USD" ? search.currency : undefined,
    sort: search.sort === "price" ? "price" : undefined,
    soldout: search.soldout === true || search.soldout === "true" ? true : undefined,
    q: nonEmpty(search.q),
  }),
  component: Ledger,
});

function Ledger() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const set = (patch: LedgerSearch) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const period = search.period ?? "30";
  const currency = search.currency ?? "USD";
  const beans = useQuery(api.beans.list);
  const status = useQuery(api.beans.status);
  const [shown, setShown] = useState(PAGE);
  const { tastings, add } = useTastings();

  const rates = status?.rates ?? null;
  const currencies = useMemo(() => (rates ? [rates.base, ...Object.keys(rates.rates)].sort() : ["USD"]), [rates]);

  const rows = useMemo(() => {
    if (!beans) return undefined;
    const since = period === "all" ? 0 : Date.now() - Number(period) * 86_400_000;
    const needle = (search.q ?? "").toLowerCase();
    const list = beans
      .filter(
        (b) =>
          (search.soldout || b.available) &&
          (!search.roaster || b.roasteryId === search.roaster) &&
          (!search.country || COUNTRY_OF.get(b.roasteryId) === search.country) &&
          (!needle || `${b.title} ${b.roasteryName}`.toLowerCase().includes(needle)) &&
          (period === "all" || Date.parse(b.publishedAt) >= since),
      )
      .map((b) => ({ ...b, per100: rates ? convertTo(b.pricePer100g, b.currency, currency, rates) : undefined }));
    return search.sort === "price"
      ? list.sort((a, b) => (a.per100 ?? Infinity) - (b.per100 ?? Infinity))
      : list.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [beans, rates, period, currency, search]);

  const logged = useMemo(() => new Set(tastings.map((t) => `${t.roasteryId}|${t.coffee ?? ""}`)), [tastings]);
  const weekAgo = Date.now() - 7 * 86_400_000;
  const filtered = Boolean(search.country || search.roaster || search.q || search.period || search.soldout);

  return (
    <section aria-labelledby="ledger-head">
      <div {...stylex.props(ui.head)}>
        <h1 id="ledger-head" {...stylex.props(ui.h1)}>New coffees, priced per 100 g</h1>
        <p aria-live="polite" {...stylex.props(ui.meta)}>
          {status === undefined
            ? "Checking the last sync…"
            : status.lastRun
              ? `Synced ${syncedAt(status.lastRun.finishedAt)} from ${status.lastRun.shops - status.lastRun.failed.length} of ${status.lastRun.shops} shops. Rates of ${rates?.date ?? "unknown date"}.`
              : "The first sync has not run yet. It runs every 15 minutes."}
        </p>
      </div>

      <form aria-label="Filter the ledger" role="search" onSubmit={(e) => e.preventDefault()} {...stylex.props(ui.filters)}>
        <label {...stylex.props(ui.field, ui.search)}>
          <span {...stylex.props(ui.label)}>Search</span>
          <input
            type="search"
            name="q"
            autoComplete="off"
            placeholder="Gesha, Kenya, SEY"
            value={search.q ?? ""}
            onChange={(e) => set({ q: e.target.value || undefined })}
            {...stylex.props(ui.control)}
          />
        </label>
        <Segmented legend="Released in" name="period" value={period} options={PERIODS} onChange={(id) => set({ period: id === "30" ? undefined : id })} />
        <Field label="Country">
          <select
            value={search.country ?? ""}
            onChange={(e) => set({ country: (e.target.value || undefined) as CountryCode | undefined, roaster: undefined })}
            {...stylex.props(ui.control)}
          >
            <option value="">All countries</option>
            {SHOP_COUNTRIES.map((c) => (
              <option key={c} value={c}>{COUNTRY_NAMES[c]}</option>
            ))}
          </select>
        </Field>
        <Field label="Roaster">
          <select value={search.roaster ?? ""} onChange={(e) => set({ roaster: e.target.value || undefined })} {...stylex.props(ui.control)}>
            <option value="">All roasters</option>
            {ROASTERIES.filter((r) => r.feed &&(!search.country || r.country === search.country)).map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Currency">
          <select value={currency} onChange={(e) => set({ currency: e.target.value === "USD" ? undefined : e.target.value })} {...stylex.props(ui.control)}>
            {currencies.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <label {...stylex.props(ui.check)}>
          <input
            type="checkbox"
            checked={search.soldout === true}
            onChange={(e) => set({ soldout: e.target.checked ? true : undefined })}
            {...stylex.props(ui.checkBox)}
          />
          <span>Include sold out</span>
        </label>
      </form>

      <div {...stylex.props(ui.sheet)}>
        <table {...stylex.props(ui.table)}>
          <caption {...stylex.props(ui.vh)}>Coffees released by the roasters. Sort by release date or by price per 100 g.</caption>
          <thead {...stylex.props(ui.thead)}>
            <tr>
              <Th sort={{ on: search.sort !== "price", direction: "descending", onClick: () => set({ sort: undefined }) }}>Released</Th>
              <Th>Roaster</Th>
              <Th>Coffee</Th>
              <Th num>Bag</Th>
              <Th num>Shop price</Th>
              <Th num sort={{ on: search.sort === "price", direction: "ascending", onClick: () => set({ sort: "price" }) }}>
                Per 100 g, {currency}
              </Th>
              <Th><span {...stylex.props(ui.vh)}>Actions</span></Th>
            </tr>
          </thead>
          <tbody>
            {rows === undefined ? (
              <SkeletonRows columns={7} />
            ) : (
              rows.slice(0, shown).map((b) => {
                const isLogged = logged.has(`${b.roasteryId}|${b.title}`);
                return (
                  <tr key={b.id} {...stylex.props(ui.tr, !b.available && ui.trOut)}>
                    <Td label="Released" styles={[ui.num, ui.date]}>
                      <span {...stylex.props(Date.parse(b.publishedAt) >= weekAgo && ui.fresh)}>{shortDate(b.publishedAt)}</span>
                    </Td>
                    <Td label="Roaster">{b.roasteryName}</Td>
                    <Td label="Coffee" styles={[ui.name]}>
                      <a href={b.url} target="_blank" rel="noreferrer" {...stylex.props(ui.link)}>{b.title}</a>
                      {b.available ? null : <span {...stylex.props(ui.outTag)}>Sold out</span>}
                    </Td>
                    <Td label="Bag" styles={[ui.num]}>{b.grams}&nbsp;g</Td>
                    <Td label="Shop price" styles={[ui.num]}>{money(b.price, b.currency)}</Td>
                    <Td label="Per 100 g" styles={[ui.num, ui.strong]}>{b.per100 === undefined ? "No rate" : money(b.per100, currency)}</Td>
                    <td {...stylex.props(ui.act)}>
                      <button
                        type="button"
                        disabled={isLogged}
                        aria-label={isLogged ? `${b.title} is in your tried log` : `Log ${b.title} as tried`}
                        onClick={() => add({ roasteryId: b.roasteryId, coffee: b.title, date: today() })}
                        {...stylex.props(ui.btn, ui.btnQuiet, ui.btnSmall)}
                      >
                        {isLogged ? "Logged" : "Log"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {rows !== undefined && rows.length === 0 ? (
          <div {...stylex.props(ui.empty)}>
            <p {...stylex.props(ui.p)}>
              {status?.lastRun ? "No coffees match these filters." : "No coffees yet. The first shop sync fills this page within 15 minutes."}
            </p>
            {filtered ? (
              <button type="button" onClick={() => navigate({ search: {}, replace: true })} {...stylex.props(ui.btn, ui.btnQuiet)}>
                Clear filters
              </button>
            ) : null}
          </div>
        ) : null}

        {rows !== undefined && rows.length > 0 ? (
          <div {...stylex.props(ui.sheetFoot)}>
            <p {...stylex.props(ui.meta)}>Showing {Math.min(shown, rows.length)} of {rows.length} coffees.</p>
            {rows.length > shown ? (
              <button type="button" onClick={() => setShown((n) => n + PAGE)} {...stylex.props(ui.btn, ui.btnQuiet)}>
                Show {Math.min(PAGE, rows.length - shown)} more
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      {status?.lastRun && status.lastRun.failed.length > 0 ? (
        <p {...stylex.props(ui.meta, ui.warn)}>
          Not updated this hour: {status.lastRun.failed.map((f) => ROASTERIES.find((r) => r.id === f.roasteryId)?.name ?? f.roasteryId).join(", ")}.
        </p>
      ) : null}
    </section>
  );
}
