import React from "react";
import { cn } from "@/lib/utils";
import { LIKERT_OPTIONS } from "@/lib/diagnostic-questions";

interface LikertScaleProps {
  value?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function LikertScale({ value, onChange, disabled }: LikertScaleProps) {
  return (
    <div className="space-y-4">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex justify-between gap-2">
        {LIKERT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "flex-1 py-4 px-2 rounded-lg border-2 transition-colors duration-150 text-sm font-medium",
              "hover:border-primary hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted bg-background text-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="text-2xl font-bold mb-1">{option.value}</div>
            <div className="text-sm leading-tight opacity-80">{option.label}</div>
          </button>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden space-y-2">
        {LIKERT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={cn(
              "w-full py-3 px-4 rounded-lg border-2 transition-colors duration-150",
              "flex items-center gap-4",
              "hover:border-primary hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              value === option.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-muted bg-background text-foreground",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-xl font-bold w-8">{option.value}</span>
            <span className="text-base">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
