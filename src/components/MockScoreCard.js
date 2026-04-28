import React, { forwardRef } from 'react';
import logo from '../Assets/logo.png';
import {
  VerbalAbilityLogoIcon,
  AnalyticalAbilityLogoIcon,
  ClericalAbilityLogoIcon,
  NumericalAbilityLogoIcon,
  GeneralInformationLogoIcon,
  RulerIcon,
  ChartPieIcon,
} from './Icons';

const normalizeSection = (name) => (name || '').toLowerCase().trim();

const SectionLogo = ({ sectionName }) => {
  const s = normalizeSection(sectionName);
  const cls = 'w-[22px] h-[22px]';
  if (s.includes('verbal')) return <VerbalAbilityLogoIcon className={cls} />;
  if (s.includes('analytical')) return <AnalyticalAbilityLogoIcon className={cls} />;
  if (s.includes('clerical')) return <ClericalAbilityLogoIcon className={cls} />;
  if (s.includes('numerical')) return <NumericalAbilityLogoIcon className={cls} />;
  return <GeneralInformationLogoIcon className={cls} />;
};

/**
 * SVG-based semi-circle gauge — renders correctly with html2canvas.
 * Uses multiple short arc segments to simulate a smooth colour gradient.
 */
const CardGauge = ({ percentage }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const cx = 120, cy = 110, R = 96, SW = 14, W = 240, H = 120;

  const hexToRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const lerp = (c1, c2, t) => {
    const [r1, g1, b1] = hexToRgb(c1), [r2, g2, b2] = hexToRgb(c2);
    return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
  };

  // Gradient stops: gauge angle 0 = left end (red), 180 = right end (green)
  const stops = [
    [0, '#9F0B1D'],
    [40, '#C95B2A'],
    [80, '#FFA153'],
    [100, '#FFC170'],
    [130, '#8DC96A'],
    [180, '#06A561'],
  ];

  const colorAt = (a) => {
    for (let i = 0; i < stops.length - 1; i++) {
      const [a1, c1] = stops[i], [a2, c2] = stops[i + 1];
      if (a <= a2) return lerp(c1, c2, Math.max(0, Math.min(1, (a - a1) / (a2 - a1))));
    }
    return stops[stops.length - 1][1];
  };

  // Convert gauge angle → SVG coordinates
  // angle 0 = leftmost point, angle 180 = rightmost point (arc goes clockwise over the top)
  const pt = (g) => {
    const r = (180 - g) * Math.PI / 180;
    return [cx + R * Math.cos(r), cy - R * Math.sin(r)];
  };

  const progressAngle = (pct / 100) * 180;

  // Build 2°-wide colored arc segments for the progress portion
  const segs = [];
  for (let a = 0; a < progressAngle - 0.01; a += 2) {
    const ae = Math.min(a + 2, progressAngle);
    const [x1, y1] = pt(a), [x2, y2] = pt(ae);
    segs.push({
      d: `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`,
      c: colorAt((a + ae) / 2),
    });
  }

  // Full 180° gray track
  const [tx1, ty1] = pt(0), [tx2, ty2] = pt(180);
  // Handle circle at progress tip
  const [hx, hy] = pct > 0 ? pt(progressAngle) : [0, 0];
  const hc = pct <= 33.33 ? '#9F0B1D' : pct <= 66.66 ? '#FFA153' : '#06A561';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
      {/* Gray background track — full 180° clockwise arc over the top */}
      <path
        d={`M ${tx1.toFixed(2)} ${ty1.toFixed(2)} A ${R} ${R} 0 1 1 ${tx2.toFixed(2)} ${ty2.toFixed(2)}`}
        stroke="#E5E7EB"
        strokeWidth={SW}
        fill="none"
        strokeLinecap="butt"
      />
      {/* Coloured progress segments */}
      {segs.map((s, i) => (
        <path key={i} d={s.d} stroke={s.c} strokeWidth={SW} fill="none" strokeLinecap="butt" />
      ))}
      {/* Handle */}
      {pct > 0 && (
        <circle cx={hx.toFixed(2)} cy={hy.toFixed(2)} r={7} fill="white" stroke={hc} strokeWidth={2.5} />
      )}
      {/* Percentage text */}
      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fontFamily="Inter, sans-serif"
        fontWeight="500"
        fontSize="36"
        fill="#232027"
      >
        {percentage}%
      </text>
    </svg>
  );
};

/**
 * Off-screen score card captured by html2canvas for the shareable PNG.
 * Single unified card — logo + title inside — matching image-1 reference design.
 */
const MockScoreCard = forwardRef(function MockScoreCard(
  { title, submittedAt, result, passingThreshold, lowestSection, gapToPass, focusSectionWeight, sectionWeightsText, reviewerType },
  ref,
) {
  const pct = (result.percentage != null ? result.percentage : 0).toFixed(2);
  const passed = result.passed;
  const totalCorrect = result.correct || 0;
  const totalItems = result.totalItems || 0;
  const breakdown = result.sectionScores || [];
  const threshold = passingThreshold ?? 80;

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '');

  const durationMs = result.duration != null ? result.duration * 1000 : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const duration = durationH > 0
    ? `${durationH} hr ${durationM} min`
    : `${durationM} min${durationM !== 1 ? 's' : ''}`;

  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const statusText = passed
    ? `Passing (${threshold}%)`
    : `Not yet passing (${threshold}%)`;

  const pctNum = parseFloat(pct);
  const readinessMessage = pctNum >= 85
    ? 'You are above the passing threshold.'
    : pctNum >= 75
      ? 'A few improvements can push you to passing.'
      : pctNum >= 60
        ? "You're within reach but need more practice."
        : 'Focus on building fundamentals first.';

  /* ── shared style tokens ── */
  const divider = { borderBottom: '1px solid rgba(24,29,31,0.1)' };
  const iconBox = {
    width: 48, height: 48,
    borderRadius: 8,
    background: '#F6F4F9',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: 840,
        fontFamily: "'Inter', sans-serif",
        background: '#FFFFFF',
        padding: '24px',
      }}
    >
      {/* ══════════════════════════════════════════
          Single unified card
         ══════════════════════════════════════════ */}
      <div style={{
        background: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 12,
        padding: '24px 32px',
      }}>

        {/* ── Header: logo + title • date ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: 16,
          ...divider,
        }}>
          <img src={logo} alt="Reviewly" style={{ height: 28 }} crossOrigin="anonymous" />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#45464E' }}>
            {title}{dateStr ? ` • ${dateStr}` : ''}
          </span>
        </div>

        {/* ── Score Overview: gauge + stats ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 32,
          alignItems: 'center',
          paddingTop: 24,
          paddingBottom: 24,
          ...divider,
        }}>
          {/* Gauge column */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            width: 240, flexShrink: 0,
          }}>
            <CardGauge percentage={pct} />
            <p style={{ fontSize: 14, color: 'rgba(15,23,42,0.75)', margin: '8px 0 0', textAlign: 'center' }}>
              Mock Exam Score
            </p>
            <p style={{
              fontSize: 14, color: 'rgba(69,70,78,0.5)',
              margin: '4px 0 0', textAlign: 'center',
              maxWidth: 260, lineHeight: '20px',
            }}>
              This score is for this mock attempt only
            </p>
          </div>

          {/* Stats column */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {[
              ['Mock Exam Score', `${pct} %`],
              ['Correct Items', `${totalCorrect} / ${totalItems}`],
              ['Status', statusText],
              ['Total Time', duration],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 0', ...divider }}>
                <span style={{ fontSize: 14, color: '#181D1F' }}>{label}</span>
                <span style={{ fontSize: 14, color: '#181D1F' }}>{value}</span>
              </div>
            ))}

            <div style={{ marginTop: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#45464E', margin: 0 }}>{readinessMessage}</p>
              {sectionWeightsText && (
                <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6, lineHeight: '20px' }}>
                  Weighted by section coverage: {sectionWeightsText}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Detailed Exam Breakdown ── */}
        <div style={{ paddingTop: 24, paddingBottom: 24, ...(!passed && lowestSection ? divider : {}) }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#45464E', margin: '0 0 8px' }}>
            Detailed Exam Breakdown
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(15,23,42,0.75)', margin: '0 0 20px' }}>
            Your performance breakdown for this exam attempt.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFB', borderBottom: '1px solid rgba(24,29,31,0.15)' }}>
                {['Section', 'Score', 'Your Score'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '11px 14px', fontWeight: 700, color: '#45464E', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {breakdown.map((row, i) => (
                <tr key={i} style={divider}>
                  <td style={{ padding: '12px 14px', color: '#181D1F' }}>{capitalize(row.section)}</td>
                  <td style={{ padding: '12px 14px', color: '#181D1F' }}>{row.correct} / {row.totalItems}</td>
                  <td style={{ padding: '12px 14px', color: '#181D1F' }}>{row.score} %</td>
                </tr>
              ))}
              <tr style={{ borderBottom: '1px solid rgba(24,29,31,0.1)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1A1A2E' }}>Total</td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1A1A2E' }}>{totalCorrect} / {totalItems}</td>
                <td style={{ padding: '12px 14px', fontWeight: 700, color: passed ? '#16A34A' : '#DC2626' }}>{pct} %</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Recommended Focus ── */}
        {!passed && lowestSection && !['practice', 'demo'].includes(String(reviewerType || '').toLowerCase()) && (
          <div style={{ paddingTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#45464E', margin: '0 0 8px' }}>
              Recommended Focus
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(15,23,42,0.75)', margin: '0 0 16px' }}>
              Improving this section will raise your next mock score the fastest.
            </p>

            <div style={{ display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>

              {/* Section to focus */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 248, width: '100%' }}>
                <div style={iconBox}><SectionLogo sectionName={lowestSection.section} /></div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>{capitalize(lowestSection.section)}</p>
                  <p style={{ fontSize: 14, color: '#45464E', margin: 0 }}>Section to focus</p>
                </div>
              </div>

              {/* Items to pass */}
              {gapToPass > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 248, width: '100%' }}>
                  <div style={iconBox}>
                    <RulerIcon className="w-[24px] h-[24px] rotate-[7deg]" />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', margin: 0 }}>
                      {gapToPass} item{gapToPass !== 1 ? 's' : ''}
                    </p>
                    <p style={{ fontSize: 14, color: '#45464E', margin: 0 }}>To pass</p>
                  </div>
                </div>
              )}

              {/* Section weight */}
              {focusSectionWeight > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={iconBox}>
                    <ChartPieIcon className="w-[24px] h-[24px]" />
                  </div>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A2E', margin: 0 }}>{focusSectionWeight}%</p>
                    <p style={{ fontSize: 13, color: '#6B7280', margin: 0 }}>Section weight</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ── Footer (outside card) ── */}
      <div style={{ textAlign: 'left', paddingTop: 16 }}>
        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>
          Get your own Mock Score Check at{' '}
          <span style={{ textDecoration: 'underline', color: '#6B7280' }}>reviewly.ph</span>
        </p>
      </div>
    </div>
  );
});

export default MockScoreCard;
