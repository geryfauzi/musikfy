"use client";

import * as React from "react";
import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

interface SliderProps extends Omit<SliderPrimitive.Root.Props, "value" | "defaultValue" | "onValueChange"> {
  className?: string;
  defaultValue?: number | number[];
  value?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number) => void;
}

function Slider({
  className,
  defaultValue = 0,
  value,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  ...props
}: SliderProps) {
  // Ensure value is a number if single value
  const currentValue = typeof value === "number" ? value : Array.isArray(value) ? value[0] : (defaultValue as number);

  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center py-1", className)}
      data-slot="slider"
      value={currentValue}
      min={min}
      max={max}
      step={step}
      onValueChange={(val) => {
        if (onValueChange) {
          const num = typeof val === "number" ? val : Array.isArray(val) ? val[0] : 0;
          onValueChange(num);
        }
      }}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none data-disabled:opacity-50 h-4 cursor-pointer">
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="relative grow overflow-hidden rounded-full bg-slate-800 select-none h-1.5 w-full"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="bg-emerald-400 select-none h-full"
          />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          className="relative block size-3.5 shrink-0 rounded-full border border-slate-700 bg-white ring-emerald-500/50 shadow-sm transition-all select-none hover:scale-110 focus-visible:ring-2 focus-visible:outline-hidden active:scale-110 cursor-grab active:cursor-grabbing"
        />
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
