import React, { forwardRef } from 'react';
import logo from '../Assets/logo.png';
import {
  VerbalAbilityLogoIcon,
  AnalyticalAbilityLogoIcon,
  ClericalAbilityLogoIcon,
  NumericalAbilityLogoIcon,
  GeneralInformationLogoIcon,
} from './Icons';

const normalizeSection = (name) => (name || '').toLowerCase().trim();

const SectionLogo = ({ sectionName, className = 'w-[18px] h-[18px]' }) => {
  const s = normalizeSection(sectionName);
  if (s.includes('verbal')) return <VerbalAbilityLogoIcon className={className} />;
  if (s.includes('analytical')) return <AnalyticalAbilityLogoIcon className={className} />;
  if (s.includes('clerical')) return <ClericalAbilityLogoIcon className={className} />;
  if (s.includes('numerical')) return <NumericalAbilityLogoIcon className={className} />;
  return <GeneralInformationLogoIcon className={className} />;
};

/** Static semi-circle gauge for the share card (no animation, unique gradient id). */
const CardGauge = ({ percentage }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const W = 180;
  const cx = W / 2;
  const cy = 82;
  const r = 72;
  const sw = 11;
  const toRad = (d) => (d * Math.PI) / 180;
  const startX = cx - r;
  const endX = cx + r;
  const angle = 180 - (pct / 100) * 180;
  const px = cx + r * Math.cos(toRad(angle));
  const py = cy - r * Math.sin(toRad(angle));
  const H = cy + sw / 2 + 4;
  const dotColor = pct >= 75 ? '#4ADE80' : pct >= 50 ? '#FBBF24' : '#F87171';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="cardGaugeGrad" x1={startX} y1="0" x2={endX} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="70%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
      </defs>
      <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${endX} ${cy}`} fill="none" stroke="#E5E7EB" strokeWidth={sw} strokeLinecap="round" />
      {pct > 0 && (
        <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${px} ${py}`} fill="none" stroke="url(#cardGaugeGrad)" strokeWidth={sw} strokeLinecap="round" />
      )}
      {pct > 0 && <circle cx={px} cy={py} r={sw * 0.58} fill={dotColor} />}
    </svg>
  );
};

/**
 * Off-screen score card that html2canvas captures to produce the shareable PNG.
 *
 * Props:
 *  - title: Reviewer title (e.g. "CSE Professional")
 *  - submittedAt: ISO date string
 *  - result: { percentage, correct, totalItems, passed, passingScore, duration, sectionScores }
 *  - passingThreshold: number (e.g. 80)
 *  - lowestSection: { section, totalItems, correct, score }
 *  - gapToPass: number
 *  - focusSectionWeight: number
 *  - sectionWeightsText: string | null
 */
const MockScoreCard = forwardRef(function MockScoreCard(
  { title, submittedAt, result, passingThreshold, lowestSection, gapToPass, focusSectionWeight, sectionWeightsText },
  ref,
) {
  const pct = (result.percentage != null ? result.percentage : 0).toFixed(2);
  const passed = result.passed;
  const totalCorrect = result.correct || 0;
  const totalItems = result.totalItems || 0;
  const breakdown = result.sectionScores || [];

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const durationMs = (result.duration != null) ? result.duration * 1000 : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const duration = durationH > 0
    ? `${durationH}h ${durationM}m`
    : `${durationM} min${durationM !== 1 ? 's' : ''}`;

  const dateStr = submittedAt
    ? new Date(submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  const pctNum = parseFloat(pct);
  const status = pctNum >= 85
    ? { label: 'Exam Ready', color: '#16A34A' }
    : pctNum >= 75
      ? { label: 'Almost Ready', color: '#D97706' }
      : pctNum >= 60
        ? { label: 'Needs Improvement', color: '#2563EB' }
        : { label: 'Early Stage', color: '#6E43B9' };

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left: '-9999px',
        top: 0,
        width: '560px',
        fontFamily: "'Inter', sans-serif",
        background: '#FFFFFF',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ padding: '24px 28px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src={logo} alt="Reviewly" style={{ height: '28px' }} crossOrigin="anonymous" />
        <span style={{ fontSize: '13px',  color: '#1A1A2E', fontWeight: 700 }}>
          {title} • {dateStr}
        </span>
      </div>

      {/* Gauge + Stats (two-column) */}
      <div style={{ padding: '0 28px 20px', display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left: gauge + score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '220px', flexShrink: 0 }}>
          <CardGauge percentage={pct} />
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#1A1A2E', marginTop: '-4px', marginBottom: '4px', lineHeight: 1 }}>
            {pct}%
          </p>
          <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Mock Exam Score</p>
          <p style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', margin: 0, lineHeight: '16px' }}>
            This score is for this mock attempt only
          </p>
        </div>

        {/* Right: stats */}
        <div style={{ flex: 1, paddingTop: '6px' }}>
          <div>
            {[
              ['Mock Exam Score', `${pct}%`],
              ['Correct Items', `${totalCorrect} / ${totalItems}`],
              ['Status', status.label],
              ['Total Time', duration],
            ].map(([label, value], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>{label}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: label === 'Status' ? status.color : '#1A1A2E' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
          {sectionWeightsText && (
            <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px', lineHeight: '16px' }}>
              Weighted by section coverage: {sectionWeightsText}
            </p>
          )}
        </div>
      </div>

      {/* Breakdown table */}
      <div style={{ padding: '20px 28px 0' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', marginBottom: '10px' }}>Detailed Exam Breakdown</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: '#1A1A2E' }}>Section</th>
              <th style={{ textAlign: 'center', padding: '8px 10px', fontWeight: 700, color: '#1A1A2E' }}>Score</th>
              <th style={{ textAlign: 'right', padding: '8px 10px', fontWeight: 700, color: '#1A1A2E' }}>Your Score</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                <td style={{ padding: '8px 10px', color: '#45464E' }}>{capitalize(row.section)}</td>
                <td style={{ padding: '8px 10px', color: '#45464E', textAlign: 'center' }}>{row.correct}/{row.totalItems}</td>
                <td style={{ padding: '8px 10px', color: '#45464E', fontWeight: 600, textAlign: 'right' }}>{row.score} %</td>
              </tr>
            ))}
            <tr style={{ borderTop: '2px solid #E5E7EB' }}>
              <td style={{ padding: '8px 10px', color: '#1A1A2E', fontWeight: 700 }}>Total</td>
              <td style={{ padding: '8px 10px', color: '#1A1A2E', fontWeight: 700, textAlign: 'center' }}>{totalCorrect}/{totalItems}</td>
              <td style={{ padding: '8px 10px', fontWeight: 700, textAlign: 'right', color: '#1A1A2E'  }}>{pct} %</td>
            </tr>
          </tbody>
        </table>
        <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '8px' }}>Based on your most recent full mock.</p>
      </div>

      {/* Recommended Focus */}
      {!passed && lowestSection && (
        <div style={{ padding: '16px 28px 0' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A2E', marginBottom: '10px' }}>Recommended Focus</p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {/* Focus section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SectionLogo sectionName={lowestSection.section} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>{capitalize(lowestSection.section)}</p>
                <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Section to focus</p>
              </div>
            </div>
            {/* Gap to pass */}
            {gapToPass > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>{gapToPass} item{gapToPass !== 1 ? 's' : ''}</p>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>To pass</p>
                </div>
              </div>
            )}
            {/* Section weight */}
            {focusSectionWeight > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#F5F4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="1.5" /><path d="M12 2a10 10 0 0 1 10 10H12V2Z" fill="#16A34A" fillOpacity="0.2" stroke="#16A34A" strokeWidth="1.5" strokeLinejoin="round" /></svg>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#1A1A2E', margin: 0 }}>{focusSectionWeight}%</p>
                  <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>Section weight</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '20px 28px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
          Get your own Mock Score Check at <span style={{ textDecoration: 'underline', color: '#6B7280', fontWeight: 400 }}>reviewly.ph</span>
        </p>
      </div>
    </div>
  );
});

export default MockScoreCard;
