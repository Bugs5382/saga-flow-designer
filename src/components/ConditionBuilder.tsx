/*
 * Copyright 2026 Shane
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { type Pill } from "../workflowScope";
import {
  cn,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "./primitives";

// A reusable condition builder for decision / switch / filter / while predicates.
// Instead of hand-typing raw CEL, the author picks a FIELD/PILL, an OPERATOR,
// and a VALUE; the three compose to a CEL string stored in config. A "raw CEL"
// escape-hatch toggle swaps in a textarea for advanced expressions.
//
// The composed value is the single source of truth stored in config[key]; the
// structured parts are a best-effort PARSE of that string, so switching between
// raw and builder modes round-trips cleanly for simple expressions.

/**
 * An operator the builder offers, with the CEL rendering it produces.
 *
 * @since 1.0.0
 */
export interface OperatorSpec {
  id: string;
  label: string;
  // Render the CEL for this operator. `value` is already normalised (quoted for
  // string literals unless it looks like a pill/number/bool).
  render: (field: string, value: string) => string;
  // Some operators take no right-hand value (e.g. is-empty).
  unary?: boolean;
}

/**
 * The operators the condition builder offers, in stable display order.
 *
 * @since 1.0.0
 */
export const CONDITION_OPERATORS: OperatorSpec[] = [
  { id: "==", label: "equals (==)", render: (f, v) => `${f} == ${v}` },
  { id: "!=", label: "not equals (!=)", render: (f, v) => `${f} != ${v}` },
  { id: ">", label: "greater than (>)", render: (f, v) => `${f} > ${v}` },
  { id: ">=", label: "at least (>=)", render: (f, v) => `${f} >= ${v}` },
  { id: "<", label: "less than (<)", render: (f, v) => `${f} < ${v}` },
  { id: "<=", label: "at most (<=)", render: (f, v) => `${f} <= ${v}` },
  {
    id: "contains",
    label: "contains",
    render: (f, v) => `${f}.contains(${v})`,
  },
  {
    id: "startsWith",
    label: "starts with",
    render: (f, v) => `${f}.startsWith(${v})`,
  },
  {
    id: "endsWith",
    label: "ends with",
    render: (f, v) => `${f}.endsWith(${v})`,
  },
  { id: "in", label: "in list", render: (f, v) => `${f} in ${v}` },
  {
    id: "matches",
    label: "matches (regex)",
    render: (f, v) => `${f}.matches(${v})`,
  },
  {
    id: "isEmpty",
    label: "is empty",
    render: (f) => `size(${f}) == 0`,
    unary: true,
  },
  {
    id: "isNotEmpty",
    label: "is not empty",
    render: (f) => `size(${f}) > 0`,
    unary: true,
  },
];

// Normalise a raw value token into a CEL literal. Pills / numbers / booleans /
// list & string literals pass through; a bare word becomes a quoted string.
const PILL_RE = /^(?:record|vars|trigger|item)\.[A-Za-z0-9_.]+$/;
const normaliseValue = (raw: string): string => {
  const v = raw.trim();
  if (!v) return "''";
  if (PILL_RE.test(v)) return v; // a pill reference
  if (/^-?\d+(?:\.\d+)?$/.test(v)) return v; // number
  if (["false", "null", "true"].includes(v)) return v; // literal
  if (/^['"].*['"]$/.test(v)) return v; // already-quoted string
  if (/^\[.*\]$/.test(v) || /^\{.*\}$/.test(v)) return v; // list / object literal
  return `'${v.replaceAll("'", String.raw`\'`)}'`; // bare word -> quoted string
};

/**
 * The structured parts of a builder-shaped condition.
 *
 * @since 1.0.0
 */
export interface ConditionParts {
  field: string;
  operator: string;
  value: string;
}

/**
 * Best-effort parse of a composed CEL string back into builder parts. Only the
 * simple field-operator-value shapes the builder itself emits are recovered;
 * anything else returns undefined (the caller falls back to raw mode).
 *
 * @since 1.0.0
 */
export const parseCondition = (cel: string): ConditionParts | undefined => {
  const s = (cel ?? "").trim();
  if (!s) return { field: "", operator: "==", value: "" };
  // method-style: field.op(value)
  const method = s.match(/^([A-Za-z0-9_.]+)\.(contains|startsWith|endsWith|matches)\((.*)\)$/);
  if (method)
    return {
      field: method[1],
      operator: method[2],
      value: stripQuotes(method[3]),
    };
  const empty = s.match(/^size\(([A-Za-z0-9_.]+)\)\s*==\s*0$/);
  if (empty) return { field: empty[1], operator: "isEmpty", value: "" };
  const notEmpty = s.match(/^size\(([A-Za-z0-9_.]+)\)\s*>\s*0$/);
  if (notEmpty) return { field: notEmpty[1], operator: "isNotEmpty", value: "" };
  const inList = s.match(/^([A-Za-z0-9_.]+)\s+in\s+(.+)$/);
  if (inList) return { field: inList[1], operator: "in", value: inList[2] };
  const binary = s.match(/^([A-Za-z0-9_.]+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (binary)
    return {
      field: binary[1],
      operator: binary[2],
      value: stripQuotes(binary[3]),
    };
  return undefined; // not a builder-shaped expression
};

const stripQuotes = (v: string): string => {
  const t = v.trim();
  if (/^'.*'$/.test(t) || /^".*"$/.test(t)) return t.slice(1, -1);
  return t;
};

/**
 * Compose builder parts into a CEL string. Returns "" when no field is set.
 *
 * @since 1.0.0
 */
export const composeCondition = (parts: ConditionParts): string => {
  const op = CONDITION_OPERATORS.find((o) => o.id === parts.operator) ?? CONDITION_OPERATORS[0];
  if (!parts.field.trim()) return "";
  if (op.unary) return op.render(parts.field, "");
  return op.render(parts.field, normaliseValue(parts.value));
};

/**
 * Props for {@link ConditionBuilder}.
 *
 * @since 1.0.0
 */
export interface ConditionBuilderProps {
  examples?: string[];
  label: string;
  onChange: (cel: string) => void;
  onRawChange: (raw: boolean) => void;
  pills: Pill[];
  // Persisted raw-mode flag (config[`${key}_raw`] === "1").
  raw: boolean;
  // The current composed CEL string (config[key]).
  value: string;
}

/**
 * A field/operator/value condition builder that composes a CEL predicate, with
 * a raw-CEL escape hatch for advanced expressions.
 *
 * @since 1.0.0
 */
export const ConditionBuilder = ({
  examples,
  label,
  onChange,
  onRawChange,
  pills,
  raw,
  value,
}: ConditionBuilderProps) => {
  const parsed = parseCondition(value);
  // If the stored expression isn't builder-shaped, force raw so we never lose it.
  const builderUsable = Boolean(parsed);
  const parts: ConditionParts = parsed ?? {
    field: "",
    operator: "==",
    value: "",
  };
  const op = CONDITION_OPERATORS.find((o) => o.id === parts.operator) ?? CONDITION_OPERATORS[0];

  const setPart = (patch: Partial<ConditionParts>) => {
    onChange(composeCondition({ ...parts, ...patch }));
  };

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-slate-600">{label}</Label>
        <label className="flex items-center gap-1.5 text-[10px] text-slate-600">
          raw CEL
          <Switch
            checked={raw || !builderUsable}
            disabled={!builderUsable && raw}
            onCheckedChange={(next) => onRawChange(next)}
          />
        </label>
      </div>

      {raw || !builderUsable ? (
        <div className="grid gap-1.5">
          <Textarea
            className="min-h-16 font-mono text-xs"
            onChange={(event) => onChange(event.target.value)}
            placeholder="CEL expression — e.g. record.priority == 'P1'"
            value={value}
          />
          {!builderUsable && !raw ? (
            <p className="text-[10px] italic text-slate-500">
              This expression is too advanced for the builder — editing as raw CEL.
            </p>
          ) : null}
          {examples?.length ? (
            <div className="flex flex-wrap items-center gap-1">
              <span className="font-mono text-[10px] font-semibold text-teal-600">fx</span>
              {examples.map((example) => (
                <button
                  className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                  key={example}
                  onClick={() => onChange(example)}
                  title="Use example"
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="grid gap-1.5 rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2">
          {/* Field / pill picker */}
          <div className="grid gap-1">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Field</span>
            <Select onValueChange={(field) => setPart({ field })} value={parts.field || undefined}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue placeholder="Pick a field / pill…" />
              </SelectTrigger>
              <SelectContent>
                {pills.length === 0 ? (
                  <SelectItem disabled value="_none">
                    No pills in scope here
                  </SelectItem>
                ) : (
                  pills.map((pill) => (
                    <SelectItem key={pill.ref} value={pill.ref}>
                      <span className="font-mono text-xs">{pill.ref}</span>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Operator */}
          <div className="grid gap-1">
            <span className="text-[10px] font-semibold uppercase text-slate-500">Operator</span>
            <Select onValueChange={(operator) => setPart({ operator })} value={parts.operator}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONDITION_OPERATORS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Value (hidden for unary operators) */}
          {op.unary ? null : (
            <div className="grid gap-1">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Value</span>
              <Input
                className="h-7 font-mono text-xs"
                onChange={(event) => setPart({ value: event.target.value })}
                placeholder="literal, number, or a pill (record.x)"
                value={parts.value}
              />
            </div>
          )}

          {/* Live composed CEL preview */}
          <div
            className={cn(
              "mt-0.5 rounded bg-white px-2 py-1 font-mono text-[10px]",
              value ? "text-slate-600" : "italic text-slate-400",
            )}
          >
            {value || "— compose a condition above —"}
          </div>
        </div>
      )}
    </div>
  );
};
