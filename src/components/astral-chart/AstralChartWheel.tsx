import React, { useMemo } from 'react';
import {
  AstralChartResult,
  SIGN_SYMBOLS,
  PLANET_SYMBOLS,
  SIGN_ELEMENTS,
} from '@/lib/astral-chart-calculator';

interface AstralChartWheelProps {
  result: AstralChartResult;
  size?: number;
}

// ============================================================
// CONSTANTS
// ============================================================

const COLORS = {
  primary: '#335072',
  accent: '#B38F8F',
  lightBg: '#F2E9E4',
  darkGray: '#555',
  lightGray: '#ccc',
};

const ELEMENT_BG: Record<string, { bg: string; text: string; border: string }> = {
  fire:  { bg: '#FDDCCC', text: '#C0392B', border: '#E8A090' },
  earth: { bg: '#D5E8D4', text: '#27AE60', border: '#A8D5A0' },
  air:   { bg: '#DAE8FC', text: '#2980B9', border: '#A0C4E8' },
  water: { bg: '#E1D5E7', text: '#8E44AD', border: '#C0A8D0' },
};

const SIGN_LABELS: Record<string, string> = {
  aries: 'Áries', taurus: 'Touro', gemini: 'Gêmeos', cancer: 'Câncer',
  leo: 'Leão', virgo: 'Virgem', libra: 'Libra', scorpio: 'Escorp.',
  sagittarius: 'Sagit.', capricorn: 'Capric.', aquarius: 'Aquário', pisces: 'Peixes',
};

const PLANET_LABELS: Record<string, string> = {
  sun: 'SO', moon: 'LU', mercury: 'ME', venus: 'VE', mars: 'MA',
  jupiter: 'JU', saturn: 'SA', uranus: 'UR', neptune: 'NE', pluto: 'PL',
};

const PLANET_COLORS: Record<string, string> = {
  sun: '#DAA520', moon: '#A0A0A0', mercury: '#D2691E', venus: '#E75480',
  mars: '#DC143C', jupiter: '#7B68EE', saturn: '#708090', uranus: '#00CED1',
  neptune: '#4169E1', pluto: '#8B7355',
};

const ASPECT_COLORS: Record<string, string> = {
  conjunction: '#DAA520',
  opposition: '#DC143C',
  trine: '#2ECC71',
  square: '#DC143C',
  sextile: '#3498DB',
  quincunx: '#9B59B6',
};

const ASPECT_DASH: Record<string, string> = {
  conjunction: 'none',
  opposition: 'none',
  trine: 'none',
  square: 'none',
  sextile: '4,4',
  quincunx: '2,4',
};

// ============================================================
// HELPERS
// ============================================================

function eclipticToAngle(eclipticDeg: number, ascDeg: number): number {
  return 180 - (eclipticDeg - ascDeg);
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

// ============================================================
// COMPONENT
// ============================================================

export const AstralChartWheel: React.FC<AstralChartWheelProps> = ({
  result,
  size = 600,
}) => {
  const viewSize = size + 80; // Extra margin for labels
  const cx = viewSize / 2;
  const cy = viewSize / 2;
  const outerR = size * 0.46;
  const signInnerR = outerR - size * 0.055;
  const houseOuterR = signInnerR;
  const planetR = houseOuterR - size * 0.04;
  const innerR = size * 0.15;

  const ascDeg = result.ascendant.eclipticDegree;

  const signs = [
    'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
    'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces',
  ];

  // ---- SIGN SEGMENTS ----
  const signSegments = useMemo(() => {
    return signs.map((sign, i) => {
      const startEcliptic = i * 30;
      const endEcliptic = (i + 1) * 30;
      const startAngle = eclipticToAngle(startEcliptic, ascDeg);
      const endAngle = eclipticToAngle(endEcliptic, ascDeg);
      const midAngle = (startAngle + endAngle) / 2;
      const element = SIGN_ELEMENTS[sign];
      const colors = ELEMENT_BG[element] || ELEMENT_BG.fire;

      // Create arc path for the sign segment
      const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
      const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
      const innerStart = polarToCartesian(cx, cy, signInnerR, startAngle);
      const innerEnd = polarToCartesian(cx, cy, signInnerR, endAngle);

      // SVG arc: counterclockwise (sweep=0) from start to end
      const outerArc = `A ${outerR} ${outerR} 0 0 0 ${outerEnd.x} ${outerEnd.y}`;
      const innerArc = `A ${signInnerR} ${signInnerR} 0 0 1 ${innerStart.x} ${innerStart.y}`;
      const d = `M ${outerStart.x} ${outerStart.y} ${outerArc} L ${innerEnd.x} ${innerEnd.y} ${innerArc} Z`;

      // Label position
      const labelR = (outerR + signInnerR) / 2;
      const labelPos = polarToCartesian(cx, cy, labelR, midAngle);

      // Sign name position (outside the ring)
      const nameR = outerR + size * 0.035;
      const namePos = polarToCartesian(cx, cy, nameR, midAngle);

      return (
        <g key={sign}>
          <path d={d} fill={colors.bg} stroke={colors.border} strokeWidth="0.5" />
          {/* Sign divider */}
          <line
            x1={innerStart.x} y1={innerStart.y}
            x2={outerStart.x} y2={outerStart.y}
            stroke={colors.border} strokeWidth="0.5"
          />
          {/* Sign symbol */}
          <text
            x={labelPos.x} y={labelPos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.035} fill={colors.text} fontWeight="bold"
          >
            {SIGN_SYMBOLS[sign]}
          </text>
          {/* Sign name outside */}
          <text
            x={namePos.x} y={namePos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.02} fill={colors.text} fontWeight="500"
            opacity="0.8"
          >
            {SIGN_LABELS[sign]}
          </text>
        </g>
      );
    });
  }, [ascDeg, cx, cy, outerR, signInnerR, size]);

  // ---- HOUSE LINES ----
  const houseElements = useMemo(() => {
    return result.houses.map((house) => {
      const angle = eclipticToAngle(house.eclipticDegreeStart, ascDeg);
      const inner = polarToCartesian(cx, cy, innerR, angle);
      const outer = polarToCartesian(cx, cy, signInnerR, angle);
      const isAngular = [1, 4, 7, 10].includes(house.id);

      return (
        <line
          key={`house-${house.id}`}
          x1={inner.x} y1={inner.y}
          x2={outer.x} y2={outer.y}
          stroke={isAngular ? COLORS.primary : '#c0c0c080'}
          strokeWidth={isAngular ? 2 : 0.5}
        />
      );
    });
  }, [result.houses, ascDeg, cx, cy, innerR, signInnerR]);

  // ---- HOUSE NUMBERS ----
  const houseNumbers = useMemo(() => {
    return result.houses.map((house, i) => {
      const startAngle = eclipticToAngle(house.eclipticDegreeStart, ascDeg);
      const nextHouse = result.houses[(i + 1) % 12];
      const endAngle = eclipticToAngle(nextHouse.eclipticDegreeStart, ascDeg);
      let midAngle = (startAngle + endAngle) / 2;
      if (Math.abs(startAngle - endAngle) > 180) {
        midAngle = ((startAngle + endAngle + 360) / 2) % 360;
      }
      const numR = (innerR + houseOuterR) / 2;
      const pos = polarToCartesian(cx, cy, numR, midAngle);

      return (
        <text
          key={`house-num-${house.id}`}
          x={pos.x} y={pos.y}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.022} fill="#aaa" fontWeight="500"
        >
          {house.id}
        </text>
      );
    });
  }, [result.houses, ascDeg, cx, cy, innerR, houseOuterR, size]);

  // ---- PLANETS ----
  const planetElements = useMemo(() => {
    const mainPlanets = result.planets.filter(p =>
      ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'].includes(p.key)
    );

    // Calculate angles and resolve collisions
    const planetAngles = mainPlanets.map(p => ({
      ...p,
      angle: eclipticToAngle(p.eclipticDegree, ascDeg),
      displayRadius: planetR,
      collisionLevel: 0,
    }));

    planetAngles.sort((a, b) => a.angle - b.angle);

    const MIN_ANGLE_DIFF = 8; // degrees
    const radialOffsets = [0, -size * 0.04, -size * 0.08];
    for (let i = 0; i < planetAngles.length; i++) {
      let level = 0;
      for (let j = 0; j < i; j++) {
        let diff = Math.abs(planetAngles[i].angle - planetAngles[j].angle);
        if (diff > 180) diff = 360 - diff;
        if (diff < MIN_ANGLE_DIFF) {
          level = Math.max(level, planetAngles[j].collisionLevel + 1);
        }
      }
      planetAngles[i].collisionLevel = level;
      planetAngles[i].displayRadius = planetR + (radialOffsets[Math.min(level, 2)] || -size * 0.08);
    }

    return planetAngles.map((planet) => {
      const pos = polarToCartesian(cx, cy, planet.displayRadius, planet.angle);
      const color = PLANET_COLORS[planet.key] || COLORS.primary;
      const circleR = size * 0.02;

      // Degree label
      const degPos = polarToCartesian(cx, cy, planet.displayRadius + circleR + size * 0.012, planet.angle);

      // Line from planet to ecliptic (tick mark)
      const eclipticPos = polarToCartesian(cx, cy, signInnerR - 2, planet.angle);
      const tickStart = polarToCartesian(cx, cy, planet.displayRadius + circleR + 2, planet.angle);

      return (
        <g key={planet.key}>
          {/* Tick line from ecliptic to planet */}
          <line
            x1={eclipticPos.x} y1={eclipticPos.y}
            x2={tickStart.x} y2={tickStart.y}
            stroke="#ccc" strokeWidth="0.5" strokeDasharray="2,2"
          />
          {/* Planet circle */}
          <circle
            cx={pos.x} cy={pos.y} r={circleR}
            fill="white" stroke={color} strokeWidth="1.5"
          />
          {/* Planet label */}
          <text
            x={pos.x} y={pos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.02} fill={color} fontWeight="bold"
          >
            {PLANET_LABELS[planet.key] || planet.key.substring(0, 2).toUpperCase()}
          </text>
          {/* Degree label */}
          <text
            x={degPos.x} y={degPos.y}
            textAnchor="middle" dominantBaseline="central"
            fontSize={size * 0.013} fill="#999"
          >
            {planet.degree}°
          </text>
          {/* Retrograde indicator */}
          {planet.isRetrograde && (
            <text
              x={pos.x + circleR + 2} y={pos.y - circleR}
              textAnchor="start" dominantBaseline="central"
              fontSize={size * 0.012} fill="#E74C3C" fontWeight="bold"
            >
              R
            </text>
          )}
        </g>
      );
    });
  }, [result.planets, ascDeg, cx, cy, planetR, signInnerR, size]);

  // ---- ASPECT LINES ----
  const aspectLines = useMemo(() => {
    const majorAspects = result.aspects.filter(a =>
      ['conjunction', 'opposition', 'trine', 'square', 'sextile'].includes(a.type)
    );

    return majorAspects.slice(0, 20).map((aspect, i) => {
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
          x1={pos1.x} y1={pos1.y}
          x2={pos2.x} y2={pos2.y}
          stroke={color} strokeWidth="1"
          strokeDasharray={dash} opacity="0.5"
        />
      );
    });
  }, [result.aspects, result.planets, ascDeg, cx, cy, innerR]);

  // ---- ASC / MC / DSC / IC LABELS ----
  const angularLabels = useMemo(() => {
    const ascAngle = eclipticToAngle(ascDeg, ascDeg);
    const mcAngle = eclipticToAngle(result.midheaven.eclipticDegree, ascDeg);
    const dscAngle = eclipticToAngle(ascDeg + 180, ascDeg);
    const icAngle = eclipticToAngle(result.midheaven.eclipticDegree + 180, ascDeg);

    const labelR = outerR + size * 0.06;
    const labels = [
      { text: 'ASC', angle: ascAngle },
      { text: 'MC', angle: mcAngle },
      { text: 'DSC', angle: dscAngle },
      { text: 'IC', angle: icAngle },
    ];

    return labels.map(({ text, angle }) => {
      const pos = polarToCartesian(cx, cy, labelR, angle);
      return (
        <text
          key={text}
          x={pos.x} y={pos.y}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.025} fill={COLORS.primary} fontWeight="bold"
        >
          {text}
        </text>
      );
    });
  }, [ascDeg, result.midheaven.eclipticDegree, cx, cy, outerR, size]);

  // ---- CENTER INFO ----
  const centerInfo = useMemo(() => {
    const initials = result.birthData.cityName
      ? result.birthData.cityName.split(',')[0].substring(0, 2).toUpperCase()
      : 'KB';
    return (
      <g>
        <circle cx={cx} cy={cy} r={innerR * 0.6} fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.5" />
        <text
          x={cx} y={cy - size * 0.01}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.025} fill={COLORS.primary} fontWeight="bold"
        >
          {initials}
        </text>
        <text
          x={cx} y={cy + size * 0.02}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.012} fill="#999"
        >
          {`${result.birthData.day}/${result.birthData.month}/${result.birthData.year}`}
        </text>
      </g>
    );
  }, [cx, cy, innerR, size, result.birthData]);

  return (
    <div className="flex justify-center">
      <svg
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        width="100%"
        height="100%"
        style={{ maxWidth: viewSize, maxHeight: viewSize }}
        className="drop-shadow-sm"
      >
        {/* Background circles */}
        <circle cx={cx} cy={cy} r={outerR + 2} fill="white" stroke={COLORS.primary} strokeWidth="2.5" />
        <circle cx={cx} cy={cy} r={signInnerR} fill="white" stroke={COLORS.primary} strokeWidth="1" />
        <circle cx={cx} cy={cy} r={innerR} fill="#f8fafc" stroke="#e5e7eb" strokeWidth="0.5" />

        {/* Sign segments */}
        {signSegments}

        {/* Outer ring border */}
        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke={COLORS.primary} strokeWidth="2.5" />

        {/* House lines */}
        {houseElements}

        {/* House numbers */}
        {houseNumbers}

        {/* Aspect lines */}
        {aspectLines}

        {/* Planets */}
        {planetElements}

        {/* Angular labels */}
        {angularLabels}

        {/* Center info */}
        {centerInfo}
      </svg>
    </div>
  );
};
