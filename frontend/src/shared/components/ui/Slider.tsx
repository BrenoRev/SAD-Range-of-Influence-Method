import { type ChangeEvent } from "react";
import { cn } from "@/shared/lib/utils";

type SliderProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  ariaLabel?: string;
  ariaValueText?: string;
};

export function Slider({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  ariaLabel,
  ariaValueText,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };
  return (
    <input
      type="range"
      className={cn("rim-slider", className)}
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={ariaLabel}
      aria-valuetext={ariaValueText}
      onChange={handleChange}
      style={{ ["--p" as string]: `${pct}%` } as React.CSSProperties}
    />
  );
}
