import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import * as stylex from "@stylexjs/stylex";
import { ROASTERIES } from "../roasteries.ts";
import type { Tasting } from "../query.ts";
import { useTastings } from "../ui/tastings.ts";
import { today } from "../ui/format.ts";
import { Field, Td, Th } from "../ui/parts.tsx";
import { ui } from "../ui/ui.ts";

const NAME_OF = new Map(ROASTERIES.map((r) => [r.id, r.name]));
const SORTED = [...ROASTERIES].sort((a, b) => a.name.localeCompare(b.name));

export const Route = createFileRoute("/tried")({
  head: () => ({ meta: [{ title: "Tried · Roast ledger" }] }),
  component: Tried,
});

function Tried() {
  const { tastings, add, removeAt, insertAt } = useTastings();
  const [roasteryId, setRoasteryId] = useState("");
  const [coffee, setCoffee] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(today());
  const [error, setError] = useState("");
  const [undo, setUndo] = useState<{ index: number; tasting: Tasting } | null>(null);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!roasteryId) {
      setError("Pick the roaster first.");
      document.getElementById("tried-roaster")?.focus();
      return;
    }
    const tasting: Tasting = { roasteryId, date };
    if (coffee.trim()) tasting.coffee = coffee.trim();
    if (note.trim()) tasting.note = note.trim();
    add(tasting);
    setCoffee("");
    setNote("");
    setError("");
  }

  return (
    <section aria-labelledby="tried-head">
      <div {...stylex.props(ui.head)}>
        <h1 id="tried-head" {...stylex.props(ui.h1)}>Coffees you have tried</h1>
        <p {...stylex.props(ui.meta)}>Saved in this browser only.</p>
      </div>

      <form onSubmit={submit} noValidate {...stylex.props(ui.filters)}>
        <Field label="Roaster">
          <select
            id="tried-roaster"
            name="roaster"
            value={roasteryId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "tried-error" : undefined}
            onChange={(e) => setRoasteryId(e.target.value)}
            {...stylex.props(ui.control, error !== "" && ui.controlInvalid)}
          >
            <option value="">Choose a roaster</option>
            {SORTED.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Coffee" wide>
          <input name="coffee" type="text" autoComplete="off" placeholder="Keramo, Ethiopia" value={coffee} onChange={(e) => setCoffee(e.target.value)} {...stylex.props(ui.control)} />
        </Field>
        <Field label="Tasting notes" wide>
          <input name="note" type="text" autoComplete="off" placeholder="Jasmine, peach, long finish" value={note} onChange={(e) => setNote(e.target.value)} {...stylex.props(ui.control)} />
        </Field>
        <Field label="Date">
          <input name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} {...stylex.props(ui.control)} />
        </Field>
        <button type="submit" {...stylex.props(ui.btn, ui.btnPrimary)}>Log tasting</button>
        {error ? (
          <p id="tried-error" role="alert" {...stylex.props(ui.fieldError)}>{error}</p>
        ) : null}
      </form>

      {undo ? (
        <p role="status" {...stylex.props(ui.toast)}>
          Removed {undo.tasting.coffee ?? NAME_OF.get(undo.tasting.roasteryId)}.{" "}
          <button type="button" onClick={() => { insertAt(undo.index, undo.tasting); setUndo(null); }} {...stylex.props(ui.linkish)}>
            Undo
          </button>
        </p>
      ) : null}

      <div {...stylex.props(ui.sheet)}>
        {tastings.length === 0 ? (
          <div {...stylex.props(ui.empty)}>
            <p {...stylex.props(ui.p)}>Nothing logged yet. Add the coffee you brewed this morning, or press Log beside one in New coffees.</p>
          </div>
        ) : (
          <table {...stylex.props(ui.table)}>
            <caption {...stylex.props(ui.vh)}>Your tastings, newest first</caption>
            <thead {...stylex.props(ui.thead)}>
              <tr>
                <Th>Date</Th>
                <Th>Roaster</Th>
                <Th>Coffee</Th>
                <Th>Notes</Th>
                <Th><span {...stylex.props(ui.vh)}>Actions</span></Th>
              </tr>
            </thead>
            <tbody>
              {tastings.map((t, i) => (
                <tr key={`${t.date}-${t.roasteryId}-${t.coffee ?? ""}-${i}`} {...stylex.props(ui.tr)}>
                  <Td label="Date" styles={[ui.num, ui.date]}>{t.date}</Td>
                  <Td label="Roaster">{NAME_OF.get(t.roasteryId) ?? t.roasteryId}</Td>
                  <Td label="Coffee" styles={[ui.name]}>{t.coffee ?? <span {...stylex.props(ui.muted)}>Not named</span>}</Td>
                  <Td label="Notes">{t.note ?? ""}</Td>
                  <td {...stylex.props(ui.act)}>
                    <button
                      type="button"
                      aria-label={`Remove ${t.coffee ?? "this tasting"}`}
                      onClick={() => {
                        const removed = removeAt(i);
                        if (removed) setUndo({ index: i, tasting: removed });
                      }}
                      {...stylex.props(ui.btn, ui.btnQuiet, ui.btnSmall)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
