import { forwardRef, useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { Input } from "./Input";

type NumberFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: number; // NaN = vazio
  onChange: (value: number) => void;
  invalid?: boolean;
};

// Aceita dígitos, um separador decimal e um sinal de menos só no início.
function sanitize(raw: string): string {
  let s = raw.replace(/[^\d.,-]/g, "").replace(/,/g, ".");
  s = s.replace(/(?!^)-/g, "");
  const dot = s.indexOf(".");
  if (dot !== -1) {
    s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "");
  }
  return s;
}

function toNumber(s: string): number {
  if (s === "" || s === "-" || s === "." || s === "-.") return Number.NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : Number.NaN;
}

function fromValue(v: number): string {
  return Number.isFinite(v) ? String(v) : "";
}

function sameNum(a: number, b: number): boolean {
  return Object.is(a, b) || (Number.isNaN(a) && Number.isNaN(b));
}

// type="text" + estado de texto local: evita o "bad input" do <input
// type=number>, que dessincroniza do React (texto inválido preso, campo
// travando após limpar tudo).
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField({ value, onChange, invalid, inputMode = "decimal", ...rest }, ref) {
    const [text, setText] = useState(() => fromValue(value));
    const lastEmit = useRef(value);

    // Ressincroniza só quando o valor muda por fora (reset, reshape, caso).
    useEffect(() => {
      if (!sameNum(value, lastEmit.current)) {
        setText(fromValue(value));
        lastEmit.current = value;
      }
    }, [value]);

    const handle = (raw: string) => {
      const s = sanitize(raw);
      setText(s);
      const n = toNumber(s);
      lastEmit.current = n;
      onChange(n);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode={inputMode}
        value={text}
        invalid={invalid}
        onChange={(e) => handle(e.target.value)}
        {...rest}
      />
    );
  },
);
