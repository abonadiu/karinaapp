import React from "react";

interface BrandSymbolProps {
  className?: string;
  color?: string;
  size?: number;
}

export function BrandSymbol({ className = "", color = "currentColor", size = 48 }: BrandSymbolProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Top flame/drop */}
      <path
        d="M50 8 C50 8, 44 22, 44 28 C44 31.3, 46.7 34, 50 34 C53.3 34, 56 31.3, 56 28 C56 22, 50 8, 50 8Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Top-right petal */}
      <path
        d="M54 36 C60 30, 76 28, 82 40 C88 52, 72 60, 62 56"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Bottom-right petal */}
      <path
        d="M62 64 C72 60, 88 68, 82 80 C76 92, 60 90, 54 84"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Top-left petal */}
      <path
        d="M46 36 C40 30, 24 28, 18 40 C12 52, 28 60, 38 56"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Bottom-left petal */}
      <path
        d="M38 64 C28 60, 12 68, 18 80 C24 92, 40 90, 46 84"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Bottom drop */}
      <path
        d="M50 112 C50 112, 56 98, 56 92 C56 88.7, 53.3 86, 50 86 C46.7 86, 44 88.7, 44 92 C44 98, 50 112, 50 112Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      {/* Center crossing lines */}
      <path
        d="M38 56 C44 52, 56 52, 62 56"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M38 64 C44 68, 56 68, 62 64"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
    </svg>
  );
}
