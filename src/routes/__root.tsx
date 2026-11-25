import type { ReactNode } from "react";
import { HeadContent, Link, Outlet, Scripts, createRootRoute, useLocation } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { COUNTRY_NAMES, ROASTERIES } from "../roasteries.ts";
import { useTastings } from "../ui/tastings.ts";
import { ui } from "../ui/ui.ts";
import appCss from "../styles.css?url";

const DEV_STYLEX = import.meta.env.DEV;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Roast ledger" },
      { name: "description", content: `New coffee releases from ${ROASTERIES.length} specialty roasters, with prices per 100 g in one currency.` },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: appCss },
      ...(DEV_STYLEX ? [{ rel: "stylesheet", href: "/virtual:stylex.css" }] : []),
    ],
    scripts: DEV_STYLEX ? [{ type: "module", src: "/@id/virtual:stylex:runtime" }] : [],
  }),
  shellComponent: RootDocument,
  component: Shell,
  errorComponent: LoadError,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...stylex.props(ui.html)}>
      <head>
        <HeadContent />
      </head>
      <body {...stylex.props(ui.body)}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const VIEWS = [
  { to: "/", label: "New coffees" },
  { to: "/roasteries", label: "Roasteries" },
  { to: "/tried", label: "Tried" },
  { to: "/status", label: "Status" },
] as const;

function Shell() {
  const { tastings } = useTastings();
  const pathname = useLocation({ select: (location) => location.pathname });
  return (
    <>
      <a href="#main" {...stylex.props(ui.skip)}>
        Skip to the ledger
      </a>
      <header {...stylex.props(ui.bar)}>
        <div {...stylex.props(ui.container, ui.barInner)}>
          <Link to="/" aria-label="Roast ledger, new coffees" {...stylex.props(ui.wordmark)}>
            Roast ledger
          </Link>
          <nav aria-label="Views">
            <ul {...stylex.props(ui.tabs)}>
              {VIEWS.map((v) => (
                <li key={v.to}>
                  <Link to={v.to} activeOptions={{ exact: true, includeSearch: false }} {...stylex.props(ui.tab, pathname === v.to && ui.tabOn)}>
                    {v.label}
                    {v.to === "/tried" && tastings.length > 0 ? <span {...stylex.props(ui.count)}>{tastings.length}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="main" {...stylex.props(ui.container, ui.main)}>
        <Outlet />
      </main>
      <footer {...stylex.props(ui.container, ui.foot)}>
        <p {...stylex.props(ui.footText)}>
          {ROASTERIES.length} roasters in {Object.keys(COUNTRY_NAMES).length} countries. Prices come from each roaster's own shop, checked every 15
          minutes, or hourly for shops read page by page. Exchange rates are the European Central Bank's, via Frankfurter. Shipping is never included.
        </p>
      </footer>
    </>
  );
}

function LoadError({ reset }: { reset: () => void }) {
  return (
    <main {...stylex.props(ui.container, ui.main)}>
      <section role="alert" {...stylex.props(ui.notice)}>
        <h2 {...stylex.props(ui.h2)}>The ledger could not reach its database</h2>
        <p {...stylex.props(ui.p)}>Check your connection, then try again.</p>
        <button type="button" onClick={reset} {...stylex.props(ui.btn)}>
          Try again
        </button>
      </section>
    </main>
  );
}

function NotFound() {
  return (
    <section {...stylex.props(ui.notice)}>
      <h2 {...stylex.props(ui.h2)}>No page at this address</h2>
      <Link to="/" {...stylex.props(ui.link)}>
        Back to new coffees
      </Link>
    </section>
  );
}
