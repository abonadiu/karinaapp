import React from 'react';
import type { SoulPlanResult } from '@/lib/soul-plan-calculator';

interface StarOfCreationProps {
  result: SoulPlanResult;
  size?: number;
}

const StarOfCreation: React.FC<StarOfCreationProps> = ({ result, size = 400 }) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38; // radius for outer points

  // Star of David geometry: two overlapping equilateral triangles
  // Downward triangle (Mundano) - gold/terracotta
  // Upward triangle (Espiritual) - purple/violet

  // Points of the hexagram (6 outer points)
  // Starting from top, going clockwise
  const angles = [
    -90,  // top (Spiritual Goal)
    -30,  // top-right (Worldly Goal)
    30,   // bottom-right (Worldly Talent)
    90,   // bottom (Spiritual Talent)
    150,  // bottom-left (Spiritual Challenge)
    210,  // top-left (Worldly Challenge)
  ];

  const points = angles.map(angle => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  }));

  // Downward triangle: top, bottom-left, bottom-right (indices 0, 2, 4)
  const downTriangle = `${points[0].x},${points[0].y} ${points[2].x},${points[2].y} ${points[4].x},${points[4].y}`;
  // Upward triangle: bottom, top-left, top-right (indices 3, 5, 1)
  const upTriangle = `${points[3].x},${points[3].y} ${points[5].x},${points[5].y} ${points[1].x},${points[1].y}`;

  const { positions } = result;

  // Map positions to star points (clockwise from top-left)
  // Position mapping on the Star of Creation:
  // Top-left (210°) = Worldly Challenge
  // Bottom-left (150°) = Spiritual Challenge
  // Bottom-right (30°) = Worldly Talent
  // Bottom (90°) = Spiritual Talent
  // Top-right (-30°) = Worldly Goal
  // Top (-90°) = Spiritual Goal
  // Center = Soul Destiny

  const positionMap = [
    { pos: positions.spiritualGoal, index: 0, color: '#7B2D8E', label: 'Obj. Espiritual' },
    { pos: positions.worldlyGoal, index: 1, color: '#B8860B', label: 'Obj. Mundano' },
    { pos: positions.worldlyTalent, index: 2, color: '#B8860B', label: 'Tal. Mundano' },
    { pos: positions.spiritualTalent, index: 3, color: '#7B2D8E', label: 'Tal. Espiritual' },
    { pos: positions.spiritualChallenge, index: 4, color: '#7B2D8E', label: 'Des. Espiritual' },
    { pos: positions.worldlyChallenge, index: 5, color: '#B8860B', label: 'Des. Mundano' },
  ];

  const labelOffset = size * 0.14;
  const fontSize = Math.max(10, size * 0.028);
  const pairFontSize = Math.max(12, size * 0.035);
  const centerFontSize = Math.max(14, size * 0.04);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="mx-auto"
    >
      {/* Background circle */}
      <circle
        cx={cx}
        cy={cy}
        r={r * 1.15}
        fill="none"
        stroke="#e8e0d4"
        strokeWidth="1.5"
        strokeDasharray="4 4"
        opacity="0.5"
      />

      {/* Downward triangle (Mundano - gold) */}
      <polygon
        points={downTriangle}
        fill="none"
        stroke="#B8860B"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* Upward triangle (Espiritual - purple) */}
      <polygon
        points={upTriangle}
        fill="none"
        stroke="#7B2D8E"
        strokeWidth="2"
        opacity="0.7"
      />

      {/* Central hexagon fill */}
      {(() => {
        const innerR = r * 0.5;
        const hexPoints = Array.from({ length: 6 }, (_, i) => {
          const angle = ((i * 60 - 90) * Math.PI) / 180;
          return `${cx + innerR * Math.cos(angle)},${cy + innerR * Math.sin(angle)}`;
        }).join(' ');
        return (
          <polygon
            points={hexPoints}
            fill="#DAA520"
            opacity="0.08"
            stroke="#DAA520"
            strokeWidth="1"
          />
        );
      })()}

      {/* Position nodes on the star points */}
      {positionMap.map(({ pos, index, color, label }) => {
        const point = points[index];
        // Calculate label position (pushed outward)
        const angle = (angles[index] * Math.PI) / 180;
        const labelX = cx + (r + labelOffset) * Math.cos(angle);
        const labelY = cy + (r + labelOffset) * Math.sin(angle);

        return (
          <g key={index}>
            {/* Node circle */}
            <circle
              cx={point.x}
              cy={point.y}
              r={size * 0.045}
              fill="white"
              stroke={color}
              strokeWidth="2.5"
            />
            {/* Pair number */}
            <text
              x={point.x}
              y={point.y + 1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={pairFontSize}
              fontWeight="700"
              fill={color}
            >
              {pos.pair}
            </text>
            {/* Label */}
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize}
              fill="#6b5c4c"
              fontWeight="500"
            >
              {label}
            </text>
            {/* Hebrew letter name */}
            <text
              x={labelX}
              y={labelY + fontSize + 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={fontSize * 0.85}
              fill="#9b8c7c"
              fontStyle="italic"
            >
              {pos.energy?.hebrewLetter || ''}
            </text>
          </g>
        );
      })}

      {/* Soul Destiny (center) */}
      <circle
        cx={cx}
        cy={cy}
        r={size * 0.07}
        fill="white"
        stroke="#DAA520"
        strokeWidth="3"
      />
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={centerFontSize}
        fontWeight="800"
        fill="#DAA520"
      >
        {positions.soulDestiny.pair}
      </text>
      <text
        x={cx}
        y={cy + centerFontSize + 4}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize}
        fill="#DAA520"
        fontWeight="600"
      >
        Destino da Alma
      </text>
      <text
        x={cx}
        y={cy + centerFontSize + fontSize + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={fontSize * 0.85}
        fill="#b8a088"
        fontStyle="italic"
      >
        {positions.soulDestiny.energy?.hebrewLetter || ''}
      </text>

      {/* Legend */}
      <g transform={`translate(${size * 0.05}, ${size * 0.92})`}>
        <rect x="0" y="0" width="12" height="12" rx="2" fill="#B8860B" opacity="0.7" />
        <text x="16" y="10" fontSize={fontSize * 0.85} fill="#6b5c4c">Mundano</text>
        <rect x={size * 0.25} y="0" width="12" height="12" rx="2" fill="#7B2D8E" opacity="0.7" />
        <text x={size * 0.25 + 16} y="10" fontSize={fontSize * 0.85} fill="#6b5c4c">Espiritual</text>
        <rect x={size * 0.55} y="0" width="12" height="12" rx="2" fill="#DAA520" opacity="0.7" />
        <text x={size * 0.55 + 16} y="10" fontSize={fontSize * 0.85} fill="#6b5c4c">Destino</text>
      </g>
    </svg>
  );
};

export default StarOfCreation;
