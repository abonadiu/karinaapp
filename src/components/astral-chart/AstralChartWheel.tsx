import React from 'react';
import {
  AstralChartResult,
  SIGN_SYMBOLS,
  PLANET_SYMBOLS,
  SIGN_COLORS,
  ELEMENT_COLORS,
  SIGN_ELEMENTS,
} from '@/lib/astral-chart-calculator';

interface AstralChartWheelProps {
  result: AstralChartResult;
  size?: number;
}

// Helper: convert ecliptic degree to SVG angle (0° Aries at left, counterclockwise)
function eclipticToAngle(eclipticDeg: number, ascDeg: number): number {
  // In a natal chart, the Ascendant is at the left (180° in SVG terms)
  // Degrees increase counterclockwise
  return 180 - (eclipticDeg - ascDeg);
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const diff = endAngle - startAngle;
  const largeArc = Math.abs(diff) > 180 ? 1 : 0;
  // counterclockwise = sweep 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

// Aspect colors
const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#FFD700',
  opposition: '#E74C3C',
  trine: '#2ECC71',
  square: '#E74C3C',
  sextile: '#3498DB',
  quincunx: '#9B59B6',
  quintile: '#F39C12',
  'semi-square': '#E67E22',
  'semi-sextile': '#1ABC9C',
  septile: '#8E44AD',
};

const ASPECT_DASH: Record<string, string> = {
  conjunction: 'none',
  opposition: 'none',
  trine: 'none',
  square: 'none',
  sextile: '4,4',
  quincunx: '2,4',
  quintile: '6,3',
  'semi-square': '2,2',
  'semi-sextile': '4,2',
  septile: '1,3',
};

export const AstralChartWheel: React.FC<AstralChartWheelProps> = ({
  result,
  size = 500,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.46;
  const signR = size * 0.38;
  const houseR = size * 0.30;
  const innerR = size * 0.15;
  const planetR = size * 0.34;
  const aspectR = size * 0.14;

  const ascDeg = result.ascendant.eclipticDegree;

  // Sign order (starting from Aries = 0°)
  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
  ];

  // Render sign segments (outer ring)
  const signSegments = signs.map((sign, i) => {
    const startEcliptic = i * 30;
    const endEcliptic = (i + 1) * 30;
    const startAngle = eclipticToAngle(startEcliptic, ascDeg);
    const endAngle = eclipticToAngle(endEcliptic, ascDeg);
    const midAngle = (startAngle + endAngle) / 2;
    const labelPos = polarToCartesian(cx, cy, (outerR + signR) / 2, midAngle);
    const element = SIGN_ELEMENTS[sign];
    const color = ELEMENT_COLORS[element] || '#666';

    return (
      <g key={sign}>
        {/* Sign arc background */}
        <path
          d={`${describeArc(cx, cy, outerR, startAngle, endAngle)} L ${polarToCartesian(cx, cy, signR, endAngle).x} ${polarToCartesian(cx, cy, signR, endAngle).y} ${describeArc(cx, cy, signR, endAngle, startAngle).replace('M', 'L')} Z`}
          fill={`${color}15`}
          stroke={`${color}40`}
          strokeWidth="0.5"
        />
        {/* Sign divider line */}
        <line
          x1={polarToCartesian(cx, cy, signR, startAngle).x}
          y1={polarToCartesian(cx, cy, signR, startAngle).y}
          x2={polarToCartesian(cx, cy, outerR, startAngle).x}
          y2={polarToCartesian(cx, cy, outerR, startAngle).y}
          stroke={`${color}60`}
          strokeWidth="0.5"
        />
        {/* Sign symbol */}
        <text
          x={labelPos.x}
          y={labelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.032}
          fill={color}
          fontWeight="bold"
        >
          {SIGN_SYMBOLS[sign]}
        </text>
      </g>
    );
  });

  // Render house lines
  const houseLines = result.houses.map((house) => {
    const angle = eclipticToAngle(house.eclipticDegreeStart, ascDeg);
    const inner = polarToCartesian(cx, cy, innerR, angle);
    const outer = polarToCartesian(cx, cy, signR, angle);
    const isAngular = [1, 4, 7, 10].includes(house.id);

    return (
      <line
        key={`house-${house.id}`}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={isAngular ? '#335072' : '#99999960'}
        strokeWidth={isAngular ? 1.5 : 0.5}
      />
    );
  });

  // Render house numbers
  const houseNumbers = result.houses.map((house, i) => {
    const startAngle = eclipticToAngle(house.eclipticDegreeStart, ascDeg);
    const nextHouse = result.houses[(i + 1) % 12];
    const endAngle = eclipticToAngle(nextHouse.eclipticDegreeStart, ascDeg);
    let midAngle = (startAngle + endAngle) / 2;
    // Handle wrap-around
    if (Math.abs(startAngle - endAngle) > 180) {
      midAngle = ((startAngle + endAngle + 360) / 2) % 360;
    }
    const pos = polarToCartesian(cx, cy, (innerR + houseR) / 2, midAngle);

    return (
      <text
        key={`house-num-${house.id}`}
        x={pos.x}
        y={pos.y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.022}
        fill="#999"
        fontWeight="500"
      >
        {house.id}
      </text>
    );
  });

  // Render planets - with collision avoidance
  const planetPositions: { key: string; angle: number; label: string; symbol: string; retrograde: boolean }[] = [];
  
  // Main planets only for the wheel
  const mainPlanets = result.planets.filter(p => 
    ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(p.key)
  );

  mainPlanets.forEach((planet) => {
    const angle = eclipticToAngle(planet.eclipticDegree, ascDeg);
    planetPositions.push({
      key: planet.key,
      angle,
      label: planet.label,
      symbol: PLANET_SYMBOLS[planet.key] || '?',
      retrograde: planet.isRetrograde,
    });
  });

  // Simple collision avoidance: spread planets that are too close
  const minSeparation = 8; // minimum degrees between planets on chart
  planetPositions.sort((a, b) => a.angle - b.angle);
  for (let i = 1; i < planetPositions.length; i++) {
    const diff = planetPositions[i].angle - planetPositions[i - 1].angle;
    if (Math.abs(diff) < minSeparation) {
      planetPositions[i].angle = planetPositions[i - 1].angle + minSeparation;
    }
  }

  const planetElements = planetPositions.map((planet) => {
    const pos = polarToCartesian(cx, cy, planetR, planet.angle);
    const signKey = mainPlanets.find(p => p.key === planet.key)?.sign || '';
    const element = SIGN_ELEMENTS[signKey];
    const color = ELEMENT_COLORS[element] || '#335072';

    return (
      <g key={planet.key}>
        {/* Planet dot on the ecliptic */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r={size * 0.018}
          fill="white"
          stroke={color}
          strokeWidth="1.5"
        />
        {/* Planet symbol */}
        <text
          x={pos.x}
          y={pos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.024}
          fill={color}
          fontWeight="bold"
        >
          {planet.symbol}
        </text>
        {/* Retrograde indicator */}
        {planet.retrograde && (
          <text
            x={pos.x + size * 0.02}
            y={pos.y - size * 0.015}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={size * 0.014}
            fill="#E74C3C"
            fontWeight="bold"
          >
            R
          </text>
        )}
      </g>
    );
  });

  // Render aspect lines (major only, inside the inner circle)
  const majorAspects = result.aspects.filter(a => 
    ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.type)
  );

  const aspectLines = majorAspects.slice(0, 20).map((aspect, i) => {
    const planet1 = result.planets.find(p => p.key === aspect.point1);
    const planet2 = result.planets.find(p => p.key === aspect.point2);
    if (!planet1 || !planet2) return null;

    const angle1 = eclipticToAngle(planet1.eclipticDegree, ascDeg);
    const angle2 = eclipticToAngle(planet2.eclipticDegree, ascDeg);
    const pos1 = polarToCartesian(cx, cy, innerR * 0.95, angle1);
    const pos2 = polarToCartesian(cx, cy, innerR * 0.95, angle2);
    const color = ASPECT_COLORS[aspect.type] || '#999';
    const dash = ASPECT_DASH[aspect.type] || 'none';

    return (
      <line
        key={`aspect-${i}`}
        x1={pos1.x}
        y1={pos1.y}
        x2={pos2.x}
        y2={pos2.y}
        stroke={color}
        strokeWidth="0.8"
        strokeDasharray={dash}
        opacity="0.6"
      />
    );
  });

  // ASC and MC labels
  const ascAngle = eclipticToAngle(result.ascendant.eclipticDegree, ascDeg);
  const mcAngle = eclipticToAngle(result.midheaven.eclipticDegree, ascDeg);
  const ascLabelPos = polarToCartesian(cx, cy, outerR + size * 0.04, ascAngle);
  const mcLabelPos = polarToCartesian(cx, cy, outerR + size * 0.04, mcAngle);

  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        style={{ maxWidth: size, maxHeight: size }}
        className="drop-shadow-sm"
      >
        {/* Background */}
        <circle cx={cx} cy={cy} r={outerR} fill="white" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx={cx} cy={cy} r={signR} fill="white" stroke="#e5e7eb" strokeWidth="0.5" />
        <circle cx={cx} cy={cy} r={innerR} fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.5" />

        {/* Sign segments */}
        {signSegments}

        {/* House lines */}
        {houseLines}

        {/* House numbers */}
        {houseNumbers}

        {/* Aspect lines */}
        {aspectLines}

        {/* Planets */}
        {planetElements}

        {/* ASC label */}
        <text
          x={ascLabelPos.x}
          y={ascLabelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.022}
          fill="#335072"
          fontWeight="bold"
        >
          ASC
        </text>

        {/* MC label */}
        <text
          x={mcLabelPos.x}
          y={mcLabelPos.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.022}
          fill="#335072"
          fontWeight="bold"
        >
          MC
        </text>

        {/* Center info */}
        <text
          x={cx}
          y={cy - size * 0.02}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.018}
          fill="#666"
        >
          {result.birthData.cityName}
        </text>
        <text
          x={cx}
          y={cy + size * 0.02}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.015}
          fill="#999"
        >
          {`${result.birthData.day}/${result.birthData.month}/${result.birthData.year}`}
        </text>
      </svg>
    </div>
  );
};
