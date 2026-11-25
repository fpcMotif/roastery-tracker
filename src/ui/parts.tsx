import type { ReactNode } from "react";
import * as stylex from "@stylexjs/stylex";
import { ui } from "./ui.ts";

type Style = stylex.StyleXStyles;

export function Segmented<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  name: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (id: T) => void;
}) {
  return (
    <fieldset {...stylex.props(ui.seg)}>
      <legend {...stylex.props(ui.legend)}>{legend}</legend>
      {options.map((o, i) => (
        <label key={o.id} {...stylex.props(ui.segItem, i === 0 && ui.segFirst, value === o.id && ui.segOn)}>
          <input {...stylex.props(ui.hiddenInput)} type="radio" name={name} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
          {o.label}
        </label>
      ))}
    </fieldset>
  );
}

export function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label {...stylex.props(ui.field, wide && ui.fieldWide)}>
      <span {...stylex.props(ui.label)}>{label}</span>
      {children}
    </label>
  );
}

export function Th({
  children,
  num,
  sort,
}: {
  children: ReactNode;
  num?: boolean;
  sort?: { on: boolean; direction: "ascending" | "descending"; onClick: () => void };
}) {
  return (
    <th scope="col" aria-sort={sort?.on ? sort.direction : undefined} {...stylex.props(ui.th, num && ui.thNum)}>
      {sort ? (
        <button type="button" onClick={sort.onClick} {...stylex.props(ui.sortButton, sort.on && ui.sortOn)}>
          {children}
        </button>
      ) : (
        children
      )}
    </th>
  );
}

export function Td({ label, children, styles }: { label?: string; children?: ReactNode; styles?: Style[] }) {
  return (
    <td data-label={label} {...stylex.props(ui.td, ...(styles ?? []))}>
      {children}
    </td>
  );
}

export function SkeletonRows({ columns }: { columns: number }) {
  return Array.from({ length: 8 }, (_, i) => (
    <tr key={i} aria-hidden="true" {...stylex.props(ui.skeletonRow)}>
      {Array.from({ length: columns }, (_, j) => (
        <td key={j} {...stylex.props(ui.skeletonCell)}>
          <span {...stylex.props(ui.skeletonBar)} />
        </td>
      ))}
    </tr>
  ));
}
